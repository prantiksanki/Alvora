const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

/**
 * Job payload for priority monitor queues:
 *   { provider: 'greenhouse'|'lever'|'ashby', companySlug: string, companyName: string }
 */
const processPriorityMonitor = async (job) => {
  const { provider, companySlug, companyName } = job.data;
  // Lazy require avoids circular dependency at module load time
  const { runSync } = require('../../services/job-monitor/monitoringEngine');
  const result = await runSync(provider, companySlug);
  logger.info('Priority monitor sync completed', { provider, companySlug, companyName, ...result });
  return result;
};

let highWorker = null;
let mediumWorker = null;
let lowWorker = null;

const makeWorker = (queueName, concurrency) => {
  try {
    const worker = new Worker(queueName, processPriorityMonitor, {
      connection: bullConnection,
      concurrency,
    });

    worker.on('error', (err) =>
      logger.warn(`${queueName} worker error`, { error: err.message })
    );
    worker.on('failed', (job, err) =>
      logger.error(`${queueName} job failed`, {
        jobId: job?.id,
        provider: job?.data?.provider,
        companySlug: job?.data?.companySlug,
        error: err.message,
      })
    );
    worker.on('completed', (job) =>
      logger.debug(`${queueName} job completed`, { jobId: job.id })
    );

    logger.info(`${queueName} worker started (concurrency: ${concurrency})`);
    return worker;
  } catch (err) {
    logger.warn(`${queueName} worker unavailable (Redis required)`, { error: err.message });
    return null;
  }
};

const startPriorityMonitorWorkers = () => {
  // High-priority: most concurrency, processes FAANG + top startups every 2 min
  highWorker   = makeWorker('high-priority-monitor',   10);
  // Medium: moderate concurrency
  mediumWorker = makeWorker('medium-priority-monitor', 6);
  // Low: minimal concurrency, runs every 15 min so throughput matters less
  lowWorker    = makeWorker('low-priority-monitor',    3);
};

module.exports = { startPriorityMonitorWorkers };
