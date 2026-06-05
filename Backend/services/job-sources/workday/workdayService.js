const axios = require('axios');
const { getCache, setCache } = require('../../../config/redis');
const logger = require('../../../utils/logger');
const crypto = require('crypto');

const CACHE_TTL = 120; // seconds
const PAGE_LIMIT = 20; // jobs per request (Workday default)
const MAX_PAGES = 10;  // cap at 200 jobs per company to avoid long syncs

const makeHash = (...parts) =>
  crypto.createHash('sha256').update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 32);

const normalizeEmploymentType = (raw) => {
  const r = (raw || '').toLowerCase();
  if (r.includes('intern')) return 'internship';
  if (r.includes('part')) return 'part_time';
  if (r.includes('contract') || r.includes('temp')) return 'contract';
  return 'full_time';
};

/**
 * Build the Workday API URL for a given tenant config.
 * identifier format: "{tenant}|{wdInstance}|{boardId}"
 * e.g. "adobe|wd5|external_experienced"
 */
const buildUrl = (identifier) => {
  const [tenant, wdInstance, boardId] = identifier.split('|');
  return `https://${tenant}.${wdInstance}.myworkdayjobs.com/wday/cxs/${tenant}/${boardId}/jobs`;
};

/**
 * Fetch raw job postings from a Workday tenant.
 * Workday paginates via offset — we fetch up to MAX_PAGES pages.
 */
const fetchJobs = async (companySlug, identifier) => {
  const cacheKey = `alvora:workday:${companySlug}:jobs`;
  const cached = await getCache(cacheKey);
  if (cached) {
    logger.debug('Workday cache hit', { companySlug });
    return cached;
  }

  const url = buildUrl(identifier);
  const allJobs = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const { data } = await axios.post(
      url,
      { limit: PAGE_LIMIT, offset },
      {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 12000,
      }
    );

    const postings = data.jobPostings || [];
    allJobs.push(...postings);

    const total = data.total || 0;
    offset += PAGE_LIMIT;

    if (offset >= total || postings.length < PAGE_LIMIT) break;
  }

  await setCache(cacheKey, allJobs, CACHE_TTL);
  return allJobs;
};

/**
 * Normalize a raw Workday job posting into the unified job format.
 */
const normalizeWorkdayJob = (raw, companySlug, identifier) => {
  const [tenant, wdInstance, boardId] = identifier.split('|');
  const baseUrl = `https://${tenant}.${wdInstance}.myworkdayjobs.com`;

  const location = raw.locationsText || raw.locationText || null;
  const isRemote =
    raw.remoteType === 'Remote' ||
    (location || '').toLowerCase().includes('remote') ||
    (raw.workplaceType || '').toLowerCase() === 'remote';

  // Workday externalPath looks like: /job/City/Job-Title_JobId
  // Correct public URL: https://{tenant}.{wd}.myworkdayjobs.com/{boardId}/job/City/Title_Id
  const jobId = raw.externalPath?.split('_').pop() || raw.bulletFields?.[0] || raw.externalPath || '';
  const applyUrl = raw.externalPath ? `${baseUrl}/${boardId}${raw.externalPath}` : null;

  return {
    company: companySlug.toLowerCase(),
    title: raw.title || '',
    location,
    employmentType: normalizeEmploymentType(raw.jobScheduleType || raw.timeType || ''),
    remote: isRemote,
    source: 'workday',
    externalJobId: jobId,
    applyUrl,
    description: null, // Workday list API doesn't return full descriptions
    postedAt: raw.postedOn ? parseWorkdayDate(raw.postedOn) : null,
    detectedAt: new Date(),
    tags: raw.jobFamilyGroup ? [raw.jobFamilyGroup] : [],
    contentHash: makeHash(raw.title, location, raw.externalPath),
  };
};

/**
 * Parse Workday's human-readable date strings like "Posted Today", "Posted Yesterday", "Posted 3 Days Ago"
 */
const parseWorkdayDate = (postedOn) => {
  if (!postedOn) return null;
  const s = postedOn.toLowerCase();
  const now = new Date();
  if (s.includes('today')) return now;
  if (s.includes('yesterday')) { const d = new Date(now); d.setDate(d.getDate() - 1); return d; }
  const match = s.match(/(\d+)\s+day/);
  if (match) { const d = new Date(now); d.setDate(d.getDate() - parseInt(match[1])); return d; }
  if (s.includes('month')) { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
  return null;
};

const normalizeJobs = (rawJobs, companySlug, identifier) =>
  rawJobs
    .filter((j) => j.externalPath) // skip malformed entries
    .map((job) => normalizeWorkdayJob(job, companySlug, identifier));

module.exports = { fetchJobs, normalizeJobs, buildUrl };
