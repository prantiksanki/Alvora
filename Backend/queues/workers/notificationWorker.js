const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

const processNotification = async (job) => {
  const { userId, type, title, message, link } = job.data;

  // Import here to avoid circular deps
  const { createNotification } = require('../../services/notifications/notificationService');
  await createNotification(userId, type, title, message, link);

  logger.debug('Notification created', { userId, type });
};

let worker = null;

const startNotificationWorker = () => {
  try {
    worker = new Worker('notifications', processNotification, {
      connection: bullConnection,
      concurrency: 5,
    });

    worker.on('error', (err) => {
      logger.warn('Notification worker error', { error: err.message });
    });

    worker.on('failed', (job, err) => {
      logger.error('Notification job failed', { jobId: job?.id, error: err.message });
    });

    logger.info('Notification worker started');
  } catch (err) {
    logger.warn('Notification worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startNotificationWorker };
