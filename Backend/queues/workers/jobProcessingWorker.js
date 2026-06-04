const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

/**
 * Job processing worker — reserved for post-detection enrichment.
 * Future use cases: AI-based job tagging, salary estimation, company enrichment.
 */
const processJobProcessing = async (job) => {
  const { jobId, task } = job.data;
  logger.debug('Job processing: task received', { jobId, task });
  // Future: dispatch to enrichment services based on task type
};

let worker = null;

const startJobProcessingWorker = () => {
  try {
    worker = new Worker('job-processing', processJobProcessing, {
      connection: bullConnection,
      concurrency: 2,
    });

    worker.on('error', (err) =>
      logger.warn('Job processing worker error', { error: err.message })
    );
    worker.on('failed', (job, err) =>
      logger.error('Job processing job failed', { jobId: job?.id, error: err.message })
    );
    worker.on('completed', (job) =>
      logger.debug('Job processing job completed', { jobId: job.id })
    );

    logger.info('Job processing worker started');
  } catch (err) {
    logger.warn('Job processing worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startJobProcessingWorker };
