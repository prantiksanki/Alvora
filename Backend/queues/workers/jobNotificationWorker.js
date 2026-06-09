const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

const processJobNotification = async (job) => {
  const { jobId, userIds, type } = job.data;

  // Lazy requires to avoid circular dependency issues
  const { createNotification, sendJobAlertEmail } = require('../../services/notifications/notificationService');
  const { emitNewJob } = require('../../services/websocket/jobSocketService');
  const JobPosting = require('../../models/JobPosting');
  const NotificationEvent = require('../../models/NotificationEvent');
  const UserSubscription = require('../../models/UserSubscription');
  const User = require('../../models/User');

  const jobPosting = await JobPosting.findById(jobId).lean();
  if (!jobPosting) {
    logger.warn('Job notification: posting not found', { jobId });
    return;
  }

  // Batch-fetch subscriptions and users to avoid N queries per user
  const [subscriptions, users] = await Promise.all([
    UserSubscription.find({ userId: { $in: userIds }, isActive: true }).lean(),
    User.find({ _id: { $in: userIds } }).select('email alertEmail').lean(),
  ]);

  const subByUser = Object.fromEntries(subscriptions.map((s) => [s.userId.toString(), s]));
  const userById  = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  for (const userId of userIds) {
    try {
      // Compound unique index on { userId, jobPostingId } guards against duplicates
      await NotificationEvent.create({
        userId,
        jobPostingId: jobId,
        type,
        sentAt: new Date(),
      });

      // Create in-app notification using the existing notification system
      await createNotification(
        userId,
        'new_job',
        `New job at ${jobPosting.company.charAt(0).toUpperCase() + jobPosting.company.slice(1)}`,
        `${jobPosting.title}${jobPosting.location ? ` — ${jobPosting.location}` : ''}`,
        `/jobs/${jobId}`
      );

      // Real-time WebSocket push
      emitNewJob(userId, jobPosting);

      // Email alert — only if user has opted in
      const sub  = subByUser[userId];
      const user = userById[userId];
      if (sub?.notificationPreferences?.email && user) {
        // Use custom alert email if set, otherwise fall back to login email
        const to = user.alertEmail?.trim() || user.email;
        sendJobAlertEmail(to, jobPosting).catch((err) =>
          logger.error('Job alert email failed', { userId, jobId, error: err.message })
        );
      }

    } catch (err) {
      if (err.code === 11000) {
        // Duplicate notification — this user was already notified for this job
        logger.debug('Job notification: duplicate skipped', { userId, jobId });
      } else {
        logger.error('Job notification: delivery failed', { userId, jobId, error: err.message });
      }
    }
  }
};

let worker = null;

const startJobNotificationWorker = () => {
  // Subscribe to the internal event bus to enqueue BullMQ notification jobs
  const jobEventBus = require('../../services/job-monitor/jobEventBus');
  const { getJobNotificationQueue } = require('../index');

  jobEventBus.on('new-job-detected', async ({ job, matchedUserIds }) => {
    const queue = getJobNotificationQueue();
    if (!queue) {
      logger.warn('Job notification: queue unavailable, delivering synchronously via socket only');
      // Fallback: emit WebSocket events directly without DB persistence
      const { emitNewJob } = require('../../services/websocket/jobSocketService');
      for (const userId of matchedUserIds) {
        emitNewJob(userId, job);
      }
      return;
    }

    try {
      await queue.add('notify-users', {
        jobId: job._id.toString(),
        userIds: matchedUserIds,
        type: 'new_job',
      });
    } catch (err) {
      logger.error('Job notification: failed to enqueue', { jobId: job._id, error: err.message });
    }
  });

  try {
    worker = new Worker('job-notification', processJobNotification, {
      connection: bullConnection,
      concurrency: 5,
    });

    worker.on('error', (err) =>
      logger.warn('Job notification worker error', { error: err.message })
    );
    worker.on('failed', (job, err) =>
      logger.error('Job notification job failed', { jobId: job?.id, error: err.message })
    );
    worker.on('completed', (job) =>
      logger.debug('Job notification job completed', { jobId: job.id })
    );

    logger.info('Job notification worker started');
  } catch (err) {
    logger.warn('Job notification worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startJobNotificationWorker };
