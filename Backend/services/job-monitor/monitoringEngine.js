const JobPosting = require('../../models/JobPosting');
const JobSyncHistory = require('../../models/JobSyncHistory');
const greenhouseService = require('../job-sources/greenhouse/greenhouseService');
const leverService = require('../job-sources/lever/leverService');
const ashbyService = require('../job-sources/ashby/ashbyService');
const { findMatchedUserIds } = require('./subscriptionMatcher');
const jobEventBus = require('./jobEventBus');
const logger = require('../../utils/logger');

const SOURCE_SERVICES = {
  greenhouse: greenhouseService,
  lever: leverService,
  ashby: ashbyService,
};

const SLUG_PATTERN = /^[a-zA-Z0-9-]+$/;

/**
 * Run a full incremental sync for a given source + company slug.
 * Detects new, updated, and removed job postings.
 * Emits 'new-job-detected' on jobEventBus for matched subscribers.
 *
 * @param {'greenhouse'|'lever'|'ashby'} source
 * @param {string} companySlug
 * @returns {Promise<{ newJobs: number, updatedJobs: number, removedJobs: number, jobsFetched: number }>}
 */
const runSync = async (source, companySlug) => {
  if (!SLUG_PATTERN.test(companySlug)) {
    throw new Error(`Invalid company slug: "${companySlug}"`);
  }

  const service = SOURCE_SERVICES[source];
  if (!service) {
    throw new Error(`Unknown source: "${source}"`);
  }

  // Warn if no listener is attached — notifications will be silently dropped
  if (jobEventBus.listenerCount('new-job-detected') === 0) {
    logger.warn('monitoringEngine: no listeners on new-job-detected — job notifications will be dropped', { source, companySlug });
  }

  const syncStartedAt = new Date();
  const errors = [];
  let rawJobs = [];

  try {
    rawJobs = await service.fetchJobs(companySlug);
  } catch (err) {
    logger.error('Job sync: fetch failed', { source, companySlug, error: err.message });
    errors.push(`fetch: ${err.message}`);

    await JobSyncHistory.create({
      source,
      companySlug,
      syncStartedAt,
      syncCompletedAt: new Date(),
      jobsFetched: 0,
      newJobsDetected: 0,
      updatedJobsDetected: 0,
      errors,
      status: 'failed',
    });

    throw err; // re-throw so BullMQ records the failure and retries
  }

  const normalizedJobs = service.normalizeJobs(rawJobs, companySlug);
  logger.info('Job sync: fetched jobs', { source, companySlug, count: normalizedJobs.length });

  // Load existing DB docs into a Map for O(1) lookup
  const existing = await JobPosting.find({ source, company: companySlug.toLowerCase() }).lean();
  const existingMap = new Map(existing.map((j) => [j.externalJobId, j]));

  let newCount = 0;
  let updatedCount = 0;
  const seenIds = new Set();

  for (const normalized of normalizedJobs) {
    seenIds.add(normalized.externalJobId);
    const existingDoc = existingMap.get(normalized.externalJobId);

    if (!existingDoc) {
      // New job — insert and notify
      try {
        const doc = await JobPosting.create(normalized);
        newCount++;

        const matchedUserIds = await findMatchedUserIds(doc);
        if (matchedUserIds.length > 0) {
          jobEventBus.emit('new-job-detected', { job: doc, matchedUserIds });
        }
      } catch (insertErr) {
        if (insertErr.code === 11000) {
          // Race-condition duplicate — another worker beat us to it, safe to skip
          logger.debug('Job sync: duplicate insert skipped', { source, companySlug, externalJobId: normalized.externalJobId });
        } else {
          logger.error('Job sync: insert failed', { source, companySlug, error: insertErr.message });
          errors.push(`insert ${normalized.externalJobId}: ${insertErr.message}`);
        }
      }
    } else if (existingDoc.contentHash !== normalized.contentHash) {
      // Job content changed — update the record
      try {
        await JobPosting.findByIdAndUpdate(existingDoc._id, {
          $set: {
            title: normalized.title,
            location: normalized.location,
            description: normalized.description,
            employmentType: normalized.employmentType,
            remote: normalized.remote,
            applyUrl: normalized.applyUrl,
            tags: normalized.tags,
            contentHash: normalized.contentHash,
            isActive: true,
          },
        });
        updatedCount++;
      } catch (updateErr) {
        logger.error('Job sync: update failed', { source, companySlug, error: updateErr.message });
        errors.push(`update ${normalized.externalJobId}: ${updateErr.message}`);
      }
    }
    // else: hash unchanged — no-op
  }

  // Mark jobs that no longer appear in the feed as inactive
  const removedIds = [...existingMap.keys()].filter((id) => !seenIds.has(id));
  if (removedIds.length > 0) {
    await JobPosting.updateMany(
      { source, company: companySlug.toLowerCase(), externalJobId: { $in: removedIds } },
      { $set: { isActive: false } }
    );
    logger.info('Job sync: marked jobs inactive', { source, companySlug, count: removedIds.length });
  }

  const status = errors.length === 0 ? 'success' : 'partial';

  await JobSyncHistory.create({
    source,
    companySlug,
    syncStartedAt,
    syncCompletedAt: new Date(),
    jobsFetched: normalizedJobs.length,
    newJobsDetected: newCount,
    updatedJobsDetected: updatedCount,
    errors,
    status,
  });

  logger.info('Job sync: completed', {
    source,
    companySlug,
    jobsFetched: normalizedJobs.length,
    newJobs: newCount,
    updatedJobs: updatedCount,
    removedJobs: removedIds.length,
    status,
  });

  return {
    newJobs: newCount,
    updatedJobs: updatedCount,
    removedJobs: removedIds.length,
    jobsFetched: normalizedJobs.length,
  };
};

module.exports = { runSync };
