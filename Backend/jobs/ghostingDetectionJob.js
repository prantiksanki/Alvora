const cron = require('node-cron');
const JobApplication = require('../models/JobApplication');
const { createNotification } = require('../services/notifications/notificationService');
const logger = require('../utils/logger');

const GHOSTING_THRESHOLD_DAYS = 21;

/**
 * Find applications stuck in 'Applied' or 'OA_Received' with no updates
 * for GHOSTING_THRESHOLD_DAYS days, mark them as 'Ghosted', and notify owners.
 * Exported separately for direct invocation in tests/admin scripts.
 */
const runGhostingDetection = async () => {
  const cutoff = new Date(Date.now() - GHOSTING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const staleApps = await JobApplication.find({
    status: { $in: ['Applied', 'OA_Received'] },
    lastUpdated: { $lt: cutoff },
  })
    .select('_id userId company role')
    .lean();

  if (staleApps.length === 0) {
    logger.debug('Ghosting detection: no stale applications found');
    return { updated: 0 };
  }

  const ids = staleApps.map((a) => a._id);
  await JobApplication.updateMany(
    { _id: { $in: ids } },
    { $set: { status: 'Ghosted', lastUpdated: new Date() } }
  );

  // Group by userId to send one aggregated notification per user
  const byUser = new Map();
  for (const app of staleApps) {
    const uid = app.userId.toString();
    if (!byUser.has(uid)) byUser.set(uid, []);
    byUser.get(uid).push(app);
  }

  for (const [userId, apps] of byUser) {
    const count = apps.length;
    const companyList = apps
      .slice(0, 3)
      .map((a) => a.company)
      .join(', ');
    const suffix = count > 3 ? ` and ${count - 3} more` : '';
    await createNotification(
      userId,
      'ghosted_warning',
      'Applications may have gone cold',
      `${count} application${count > 1 ? 's' : ''} (${companyList}${suffix}) had no activity for ${GHOSTING_THRESHOLD_DAYS}+ days and ${count > 1 ? 'were' : 'was'} marked as Ghosted.`,
      '/job-tracker/applications?status=Ghosted'
    );
  }

  logger.info('Ghosting detection completed', {
    updated: staleApps.length,
    usersNotified: byUser.size,
  });

  return { updated: staleApps.length };
};

const startGhostingDetectionJob = () => {
  // Run daily at midnight UTC
  cron.schedule('0 0 * * *', runGhostingDetection, { timezone: 'UTC' });
  logger.info('Ghosting detection job scheduled — runs daily at midnight UTC');
};

module.exports = { startGhostingDetectionJob, runGhostingDetection };
