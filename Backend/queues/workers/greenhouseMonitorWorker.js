const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

const processGreenhouseMonitor = async (job) => {
  const { companySlug } = job.data;
  // Lazy require avoids circular dependency issues at module load time
  const { runSync } = require('../../services/job-monitor/monitoringEngine');
  const result = await runSync('greenhouse', companySlug);
  logger.info('Greenhouse monitor sync completed', { companySlug, ...result });
  return result;
};

let worker = null;

const startGreenhouseMonitorWorker = () => {
  try {
    worker = new Worker('greenhouse-monitor', processGreenhouseMonitor, {
      connection: bullConnection,
      concurrency: 3,
    });

    worker.on('error', (err) =>
      logger.warn('Greenhouse monitor worker error', { error: err.message })
    );
    worker.on('failed', (job, err) =>
      logger.error('Greenhouse monitor job failed', {
        jobId: job?.id,
        companySlug: job?.data?.companySlug,
        error: err.message,
      })
    );
    worker.on('completed', (job) =>
      logger.debug('Greenhouse monitor job completed', { jobId: job.id })
    );

    logger.info('Greenhouse monitor worker started');
  } catch (err) {
    logger.warn('Greenhouse monitor worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startGreenhouseMonitorWorker };
