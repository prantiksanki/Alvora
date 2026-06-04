const DailyProblem = require('../models/DailyProblem');
const asyncHandler = require('../utils/asyncHandler');
const { getCache, setCache } = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_KEY = 'alvora:potd:today';
const CACHE_TTL = 3600; // 1 hour — problems don't change mid-day

/**
 * GET /api/potd
 * Returns today's POTD for all platforms.
 * Falls back to the most recent stored problem per platform if today's isn't available yet.
 */
const getTodayPotd = asyncHandler(async (req, res) => {
  const cached = await getCache(CACHE_KEY);
  if (cached) return res.status(200).json(cached);

  const today = new Date().toISOString().split('T')[0];
  const platforms = ['leetcode', 'gfg', 'codeforces', 'codechef'];

  // For each platform: try today's problem, fall back to latest available
  const problems = await Promise.all(
    platforms.map(async (platform) => {
      let doc = await DailyProblem.findOne({ platform, date: today }).lean();
      if (!doc) {
        doc = await DailyProblem.findOne({ platform }).sort({ date: -1 }).lean();
      }
      return doc;
    })
  );

  const result = problems.filter(Boolean);

  if (result.length > 0) {
    await setCache(CACHE_KEY, result, CACHE_TTL);
  }

  res.status(200).json(result);
});

/**
 * GET /api/potd/history?platform=leetcode&days=7
 * Returns past POTD problems for a platform.
 */
const getPotdHistory = asyncHandler(async (req, res) => {
  const { platform, days = 7 } = req.query;
  const query = {};
  if (platform) query.platform = platform;

  // Build date range
  const dates = [];
  for (let i = 0; i < Number(days); i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  query.date = { $in: dates };

  const problems = await DailyProblem.find(query).sort({ date: -1, platform: 1 }).lean();
  res.status(200).json(problems);
});

/**
 * POST /api/potd/refresh
 * Manually trigger a POTD sync (useful for testing / admin).
 */
const refreshPotd = asyncHandler(async (req, res) => {
  const { syncPotd } = require('../jobs/potdSyncJob');
  syncPotd().catch((err) => logger.error('Manual POTD sync failed', { error: err.message }));
  res.status(202).json({ message: 'POTD refresh triggered' });
});

module.exports = { getTodayPotd, getPotdHistory, refreshPotd };
