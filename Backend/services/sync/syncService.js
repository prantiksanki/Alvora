const ConnectedEmail = require('../../models/ConnectedEmail');
const EmailEvent = require('../../models/EmailEvent');
const SyncHistory = require('../../models/SyncHistory');
const { fetchEmails } = require('../gmail/gmailService');
const { parseAndClassifyEmail } = require('../email-parser/emailParser');
const { aiParseAndClassify } = require('../ai-email-parser/aiClassifier');
const { upsertApplication } = require('../applications/applicationService');
const logger = require('../../utils/logger');

/**
 * Orchestrates a full or incremental email sync for a single connected account.
 *
 * Flow:
 *   1. Load account, create SyncHistory (status: running)
 *   2. Fetch emails from Gmail matching job-related keywords
 *   3. For each email:
 *      a. Skip if gmailMessageId already in EmailEvent (dedup)
 *      b. Parse + classify the email
 *      c. Skip if below confidence threshold (parser returns null)
 *      d. Upsert JobApplication (create or update if status progressed)
 *      e. Create EmailEvent record
 *   4. Update lastSyncedAt on ConnectedEmail
 *   5. Mark SyncHistory completed
 *
 * All per-email errors are caught and logged — a single bad email never
 * aborts the entire sync run.
 */
const runSync = async ({ emailAccountId, userId, syncType = 'incremental' }) => {
  const account = await ConnectedEmail.findById(emailAccountId);
  if (!account || !account.isActive) {
    throw new Error(`Email account ${emailAccountId} not found or inactive`);
  }

  const history = await SyncHistory.create({
    emailAccountId,
    userId,
    syncStartedAt: new Date(),
    status: 'running',
  });

  let emailsProcessed = 0;
  let newApplications = 0;
  let updatedApplications = 0;
  const errors = [];

  try {
    const emails = await fetchEmails(account, syncType);
    logger.info('Email sync fetched messages', {
      emailAccountId,
      syncType,
      count: emails.length,
    });

    for (const email of emails) {
      try {
        // Deduplication: skip if we've already processed this Gmail message
        const alreadyProcessed = await EmailEvent.findOne({ gmailMessageId: email.id });
        if (alreadyProcessed) continue;

        // Debug: log each email being processed
        const dbgHeaders = email.payload?.headers || [];
        const dbgSubject = dbgHeaders.find(h => h.name === 'Subject')?.value || '(no subject)';
        const dbgFrom    = dbgHeaders.find(h => h.name === 'From')?.value || '(no from)';
        logger.debug('Processing email', { id: email.id, subject: dbgSubject, from: dbgFrom, snippet: (email.snippet || '').slice(0, 80) });

        // Try AI classifier first; fall back to rule-based on any failure
        let parsed;
        try {
          parsed = await aiParseAndClassify(email);
        } catch (aiErr) {
          logger.debug('AI classifier fallback', { id: email.id, reason: aiErr.message });
        }
        if (!parsed) parsed = parseAndClassifyEmail(email);
        if (!parsed) {
          logger.debug('Email skipped — no match', { id: email.id, subject: dbgSubject });
          continue; // not a recognizable job email
        }

        const { application, isNew } = await upsertApplication(
          userId,
          emailAccountId,
          parsed
        );

        // Insert EmailEvent — unique index on gmailMessageId prevents race-condition dupes
        await EmailEvent.create({
          applicationId: application._id,
          userId,
          emailSubject: parsed.subject,
          emailSender: parsed.sender,
          receivedAt: parsed.receivedAt,
          detectedStatus: parsed.detectedStatus,
          snippet: parsed.snippet,
          gmailMessageId: email.id,
          rawLabels: email.labelIds || [],
        });

        emailsProcessed++;
        if (isNew) newApplications++;
        else updatedApplications++;
      } catch (err) {
        // Ignore duplicate key errors from the EmailEvent unique index — these
        // are benign races that can occur if two sync jobs overlap briefly.
        if (err.code !== 11000) {
          errors.push(`${email.id}: ${err.message}`);
          logger.warn('Email processing error', {
            emailId: email.id,
            error: err.message,
          });
        }
      }
    }

    await ConnectedEmail.findByIdAndUpdate(emailAccountId, { lastSyncedAt: new Date() });

    await SyncHistory.findByIdAndUpdate(history._id, {
      syncCompletedAt: new Date(),
      emailsProcessed,
      newApplications,
      updatedApplications,
      status: 'completed',
      errors,
    });

    logger.info('Email sync completed', {
      emailAccountId,
      emailsProcessed,
      newApplications,
      updatedApplications,
    });

    return { emailsProcessed, newApplications, updatedApplications };
  } catch (err) {
    await SyncHistory.findByIdAndUpdate(history._id, {
      syncCompletedAt: new Date(),
      status: 'failed',
      errors: [err.message],
    });
    throw err;
  }
};

module.exports = { runSync };
