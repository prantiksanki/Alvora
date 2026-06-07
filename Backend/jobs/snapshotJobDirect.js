/**
 * Direct sync — used when Redis/BullMQ is unavailable, and for per-user manual syncs.
 */
const PlatformProfile = require('../models/PlatformProfile');
const Snapshot = require('../models/Snapshot');
const { fetchGithubStats } = require('../services/github/githubService');
const { fetchCodeforcesStats } = require('../services/codeforces/codeforcesService');
const { fetchLeetcodeStats } = require('../services/leetcode/leetcodeService');
const { fetchGfgStats } = require('../services/gfg/gfgService');
const { fetchCodechefStats } = require('../services/codechef/codechefService');
const { fetchAtcoderStats } = require('../services/atcoder/atcoderService');
const { delCache } = require('../config/redis');
const logger = require('../utils/logger');

const FETCHERS = {
  github: fetchGithubStats,
  codeforces: fetchCodeforcesStats,
  leetcode: fetchLeetcodeStats,
  gfg: fetchGfgStats,
  codechef: fetchCodechefStats,
  atcoder: fetchAtcoderStats,
};

const PLATFORM_USERNAME_FIELDS = {
  github: 'githubUsername',
  codeforces: 'codeforcesUsername',
  leetcode: 'leetcodeUsername',
  gfg: 'gfgUsername',
  codechef: 'codechefUsername',
  atcoder: 'atcoderUsername',
};

const normalizeStats = (platform, data) => {
  switch (platform) {
    case 'github': return { solvedCount: 0, rating: 0, contestCount: 0, streak: 0, extraData: { ...data, activityCalendar: data.activityCalendar || {} } };
    case 'codeforces': return { solvedCount: data.solvedCount, rating: data.rating, contestCount: data.contestCount, streak: 0, extraData: { maxRating: data.maxRating, rank: data.rank, activityCalendar: data.activityCalendar || {} } };
    case 'leetcode': return { solvedCount: data.solvedCount, rating: 0, contestCount: 0, streak: data.streak, extraData: { easySolved: data.easySolved, mediumSolved: data.mediumSolved, hardSolved: data.hardSolved, ranking: data.ranking, submissionCalendar: data.submissionCalendar || {} } };
    case 'gfg': return { solvedCount: data.solvedCount, rating: data.score, contestCount: 0, streak: data.streak, extraData: {} };
    case 'codechef': return { solvedCount: data.solvedCount, rating: data.rating, contestCount: data.contestCount, streak: 0, extraData: { maxRating: data.maxRating } };
    case 'atcoder': return { solvedCount: 0, rating: data.rating, contestCount: data.contestCount, streak: 0, extraData: { maxRating: data.maxRating } };
    default: return {};
  }
};

/**
 * Sync all platforms for a single user profile.
 * Emits 'snapshot-updated' via Socket.IO after each successful save.
 */
const runUserSync = async (profile) => {
  const { emitToUser } = require('../socket/index');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const userId = profile.userId.toString();

  for (const [platform, field] of Object.entries(PLATFORM_USERNAME_FIELDS)) {
    const username = profile[field];
    if (!username) continue;
    try {
      const rawData = await FETCHERS[platform](username);
      const stats = normalizeStats(platform, rawData);

      await Snapshot.findOneAndUpdate(
        { userId: profile.userId, platform, date: today },
        { $set: stats },
        { upsert: true }
      );

      // Bust analytics cache for this user
      await delCache(
        `alvora:overview:${userId}`,
        `alvora:history:${userId}:all:90`,
        `alvora:history:${userId}:${platform}:90`,
        `alvora:history:${userId}:${platform}:30`,
        `alvora:history:${userId}:all:30`
      );

      // Push real-time update to the user's browser
      emitToUser(userId, 'snapshot-updated', {
        platform,
        solvedCount: stats.solvedCount,
        streak: stats.streak,
        updatedAt: new Date(),
      });

      logger.info('Direct snapshot saved', { platform, userId });
    } catch (err) {
      logger.error('Direct snapshot failed', { platform, userId, error: err.message });
    }
  }
};

/**
 * Sync all users (used by the cron job).
 */
const runDirectSync = async () => {
  const profiles = await PlatformProfile.find({});
  for (const profile of profiles) {
    await runUserSync(profile);
  }
};

module.exports = { runDirectSync, runUserSync };
