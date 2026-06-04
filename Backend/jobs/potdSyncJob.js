const cron = require('node-cron');
const DailyProblem = require('../models/DailyProblem');
const { fetchLeetcodePotd } = require('../services/potd/leetcodePotdService');
const { fetchGfgPotd } = require('../services/potd/gfgPotdService');
const { fetchCodeforcesPotd } = require('../services/potd/codeforcesPotdService');
const { fetchCodechefPotd } = require('../services/potd/codechefPotdService');
const { delCache } = require('../config/redis');
const logger = require('../utils/logger');

const FETCHERS = [
  { platform: 'leetcode',   fn: fetchLeetcodePotd },
  { platform: 'gfg',        fn: fetchGfgPotd },
  { platform: 'codeforces', fn: fetchCodeforcesPotd },
  { platform: 'codechef',   fn: fetchCodechefPotd },
];

const CACHE_KEY = 'alvora:potd:today';

const syncPotd = async () => {
  logger.info('POTD sync started');
  let saved = 0;

  const results = await Promise.allSettled(FETCHERS.map((f) => f.fn()));

  for (let i = 0; i < FETCHERS.length; i++) {
    const { platform } = FETCHERS[i];
    const result = results[i];

    if (result.status === 'rejected') {
      logger.error('POTD fetch failed', { platform, error: result.reason.message });
      continue;
    }

    const problem = result.value;
    try {
      await DailyProblem.findOneAndUpdate(
        { platform: problem.platform, date: problem.date },
        { $set: { ...problem, fetchedAt: new Date() } },
        { upsert: true }
      );
      saved++;
    } catch (err) {
      logger.error('POTD save failed', { platform, error: err.message });
    }
  }

  // Bust cache so next request gets fresh problems
  await delCache(CACHE_KEY);
  logger.info(`POTD sync complete — ${saved}/${FETCHERS.length} platforms saved`);
};

const startPotdSyncJob = () => {
  // Run at midnight UTC every day to fetch the new day's problems
  cron.schedule('1 0 * * *', syncPotd, { timezone: 'UTC' });
  // Also run every 6 hours to catch mid-day updates (e.g. Codeforces rotation)
  cron.schedule('0 */6 * * *', syncPotd, { timezone: 'UTC' });
  // Fetch immediately on startup
  setImmediate(() => syncPotd().catch((err) =>
    logger.error('Startup POTD sync failed', { error: err.message })
  ));
  logger.info('POTD sync job scheduled — runs at midnight UTC + every 6 hours');
};

module.exports = { startPotdSyncJob, syncPotd };
