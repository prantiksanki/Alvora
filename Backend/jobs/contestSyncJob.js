const cron = require('node-cron');
const Contest = require('../models/Contest');
const { fetchUpcomingContests: cfUpcoming, fetchRunningContests: cfRunning } = require('../services/contests/codeforcesContestService');
const { fetchUpcomingContests: lcUpcoming } = require('../services/contests/leetcodeContestService');
const logger = require('../utils/logger');

const syncContests = async () => {
  logger.info('Contest sync started');

  try {
    const [cfContests, cfRunning_, lcContests] = await Promise.allSettled([
      cfUpcoming(),
      cfRunning(),
      lcUpcoming(),
    ]);

    const allContests = [
      ...(cfContests.status === 'fulfilled' ? cfContests.value.map((c) => ({ ...c, platform: 'codeforces' })) : []),
      ...(cfRunning_.status === 'fulfilled' ? cfRunning_.value.map((c) => ({ ...c, platform: 'codeforces' })) : []),
      ...(lcContests.status === 'fulfilled' ? lcContests.value.map((c) => ({ ...c, platform: 'leetcode' })) : []),
    ];

    let upserted = 0;
    for (const contest of allContests) {
      await Contest.findOneAndUpdate(
        { contestId: contest.contestId, platform: contest.platform },
        { ...contest, updatedAt: new Date() },
        { upsert: true }
      );
      upserted++;
    }

    // Mark contests that have passed as finished
    await Contest.updateMany(
      { startTime: { $lt: new Date() }, status: { $ne: 'finished' } },
      { $set: { status: 'finished' } }
    );

    logger.info(`Contest sync complete — ${upserted} contests upserted`);
  } catch (err) {
    logger.error('Contest sync failed', { error: err.message });
  }
};

const startContestSyncJob = () => {
  // Runs every 2 hours
  cron.schedule('0 */2 * * *', syncContests, { timezone: 'UTC' });
  logger.info('Contest sync job scheduled — runs every 2 hours');
};

module.exports = { startContestSyncJob, syncContests };
