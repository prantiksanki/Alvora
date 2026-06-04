const cron = require('node-cron');
const ConnectedEmail = require('../models/ConnectedEmail');
const { getEmailSyncQueue } = require('../queues');
const logger = require('../utils/logger');

const runEmailSync = async () => {
  if (!process.env.REDIS_URL) {
    logger.debug('Email sync skipped — REDIS_URL not set');
    return;
  }

  const queue = getEmailSyncQueue();
  if (!queue) return;

  try {
    const accounts = await ConnectedEmail.find({ isActive: true }).lean();
    logger.info(`Email sync: scheduling incremental sync for ${accounts.length} account(s)`);

    for (const account of accounts) {
      await queue.add(
        'incremental-sync',
        {
          emailAccountId: account._id.toString(),
          userId: account.userId.toString(),
          syncType: 'incremental',
        },
        {
          // Deduplicate: skip if an identical job for this account is already queued
          jobId: `incremental-${account._id}`,
        }
      );
    }
  } catch (err) {
    logger.error('Email sync job scheduling failed', { error: err.message });
  }
};

const startEmailSyncJob = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', runEmailSync, { timezone: 'UTC' });
  logger.info('Email sync job scheduled — runs every 30 minutes');
};

module.exports = { startEmailSyncJob, runEmailSync };
