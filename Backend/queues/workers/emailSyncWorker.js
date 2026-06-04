const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

const processEmailSync = async (job) => {
  const { emailAccountId, userId, syncType } = job.data;
  // Lazy require avoids circular dependency issues at module load time
  const { runSync } = require('../../services/sync/syncService');
  const result = await runSync({ emailAccountId, userId, syncType });
  logger.info('Email sync job completed', { emailAccountId, syncType, ...result });
  return result;
};

let worker = null;

const startEmailSyncWorker = () => {
  try {
    worker = new Worker('email-sync', processEmailSync, {
      connection: bullConnection,
      concurrency: 2,
    });

    worker.on('error', (err) =>
      logger.warn('Email sync worker error', { error: err.message })
    );
    worker.on('failed', (job, err) =>
      logger.error('Email sync job failed', { jobId: job?.id, error: err.message })
    );
    worker.on('completed', (job) =>
      logger.debug('Email sync job completed', { jobId: job.id })
    );

    logger.info('Email sync worker started');
  } catch (err) {
    logger.warn('Email sync worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startEmailSyncWorker };
