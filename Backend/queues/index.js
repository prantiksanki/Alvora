const { Queue } = require('bullmq');
const { bullConnection } = require('../config/redis');
const logger = require('../utils/logger');

let snapshotQueue = null;
let notificationQueue = null;
let analyticsQueue = null;
let emailSyncQueue = null;

// Job monitoring queues (legacy — kept for direct-source workers)
let greenhouseMonitorQueue = null;
let leverMonitorQueue = null;
let jobNotificationQueue = null;
let jobProcessingQueue = null;

// Priority-tier queues — process companies from the registry by urgency
let highPriorityMonitorQueue = null;
let mediumPriorityMonitorQueue = null;
let lowPriorityMonitorQueue = null;

const createQueue = (name) => {
  if (!process.env.REDIS_URL) return null;
  try {
    return new Queue(name, {
      connection: bullConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });
  } catch (err) {
    logger.warn(`BullMQ queue '${name}' unavailable (Redis required)`, { error: err.message });
    return null;
  }
};

const getSnapshotQueue = () => {
  if (!snapshotQueue) snapshotQueue = createQueue('snapshot-sync');
  return snapshotQueue;
};

const getNotificationQueue = () => {
  if (!notificationQueue) notificationQueue = createQueue('notifications');
  return notificationQueue;
};

const getAnalyticsQueue = () => {
  if (!analyticsQueue) analyticsQueue = createQueue('analytics');
  return analyticsQueue;
};

const getEmailSyncQueue = () => {
  if (!emailSyncQueue) emailSyncQueue = createQueue('email-sync');
  return emailSyncQueue;
};

const getGreenhouseMonitorQueue = () => {
  if (!greenhouseMonitorQueue) greenhouseMonitorQueue = createQueue('greenhouse-monitor');
  return greenhouseMonitorQueue;
};

const getLeverMonitorQueue = () => {
  if (!leverMonitorQueue) leverMonitorQueue = createQueue('lever-monitor');
  return leverMonitorQueue;
};

const getJobNotificationQueue = () => {
  if (!jobNotificationQueue) jobNotificationQueue = createQueue('job-notification');
  return jobNotificationQueue;
};

const getJobProcessingQueue = () => {
  if (!jobProcessingQueue) jobProcessingQueue = createQueue('job-processing');
  return jobProcessingQueue;
};

const getHighPriorityMonitorQueue = () => {
  if (!highPriorityMonitorQueue) highPriorityMonitorQueue = createQueue('high-priority-monitor');
  return highPriorityMonitorQueue;
};

const getMediumPriorityMonitorQueue = () => {
  if (!mediumPriorityMonitorQueue) mediumPriorityMonitorQueue = createQueue('medium-priority-monitor');
  return mediumPriorityMonitorQueue;
};

const getLowPriorityMonitorQueue = () => {
  if (!lowPriorityMonitorQueue) lowPriorityMonitorQueue = createQueue('low-priority-monitor');
  return lowPriorityMonitorQueue;
};

/** Return the correct priority queue for a given priority string */
const getPriorityQueue = (priority) => {
  if (priority === 'high')   return getHighPriorityMonitorQueue();
  if (priority === 'medium') return getMediumPriorityMonitorQueue();
  return getLowPriorityMonitorQueue();
};

module.exports = {
  getSnapshotQueue,
  getNotificationQueue,
  getAnalyticsQueue,
  getEmailSyncQueue,
  getGreenhouseMonitorQueue,
  getLeverMonitorQueue,
  getJobNotificationQueue,
  getJobProcessingQueue,
  getHighPriorityMonitorQueue,
  getMediumPriorityMonitorQueue,
  getLowPriorityMonitorQueue,
  getPriorityQueue,
};
