const cron = require('node-cron');
const PlatformProfile = require('../models/PlatformProfile');
const { getSnapshotQueue } = require('../queues');
const logger = require('../utils/logger');

// Fallback: direct sync when Redis/BullMQ is unavailable
const { runDirectSync } = require('./snapshotJobDirect');

const PLATFORM_USERNAME_FIELDS = {
  github: 'githubUsername',
  codeforces: 'codeforcesUsername',
  leetcode: 'leetcodeUsername',
  gfg: 'gfgUsername',
};

const runSync = async () => {
  logger.info('Snapshot sync started');

  const profiles = await PlatformProfile.find({});
  logger.info(`Processing ${profiles.length} profile(s)`);

  const queue = getSnapshotQueue();

  if (!queue) {
    // Redis unavailable — fall back to direct sync
    logger.warn('BullMQ unavailable, using direct sync');
    await runDirectSync();
    return;
  }

  let jobsEnqueued = 0;
  for (const profile of profiles) {
    for (const [platform, field] of Object.entries(PLATFORM_USERNAME_FIELDS)) {
      const username = profile[field];
      if (!username) continue;
      await queue.add(`snapshot:${platform}`, {
        userId: profile.userId.toString(),
        platform,
        username,
      });
      jobsEnqueued++;
    }
  }

  logger.info(`Enqueued ${jobsEnqueued} snapshot jobs`);
};

const startSnapshotJob = () => {
  // Runs at minute 0 of every 6th hour: 00:00, 06:00, 12:00, 18:00 UTC
  cron.schedule('0 */6 * * *', runSync, { timezone: 'UTC' });
  logger.info('Snapshot job scheduled — runs every 6 hours');
};

module.exports = { startSnapshotJob, runSync };
