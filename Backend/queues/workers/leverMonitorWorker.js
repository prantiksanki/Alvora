const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

const processLeverMonitor = async (job) => {
  const { companySlug } = job.data;
  // Lazy require avoids circular dependency issues at module load time
  const { runSync } = require('../../services/job-monitor/monitoringEngine');
  const result = await runSync('lever', companySlug);
  logger.info('Lever monitor sync completed', { companySlug, ...result });
  return result;
};

let worker = null;

const startLeverMonitorWorker = () => {
  try {
    worker = new Worker('lever-monitor', processLeverMonitor, {
      connection: bullConnection,
      concurrency: 3,
    });

    worker.on('error', (err) =>
      logger.warn('Lever monitor worker error', { error: err.message })
    );
    worker.on('failed', (job, err) =>
      logger.error('Lever monitor job failed', {
        jobId: job?.id,
        companySlug: job?.data?.companySlug,
        error: err.message,
      })
    );
    worker.on('completed', (job) =>
      logger.debug('Lever monitor job completed', { jobId: job.id })
    );

    logger.info('Lever monitor worker started');
  } catch (err) {
    logger.warn('Lever monitor worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startLeverMonitorWorker };
