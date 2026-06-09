const { Worker } = require('bullmq');
const { bullConnection, delCache } = require('../../config/redis');
const Snapshot = require('../../models/Snapshot');
const { awardXP, calculateSnapshotXP } = require('../../services/gamification/xpEngine');
const logger = require('../../utils/logger');

const PLATFORM_SERVICES = {
  github: () => require('../../services/github/githubService').fetchGithubStats,
  leetcode: () => require('../../services/leetcode/leetcodeService').fetchLeetcodeStats,
  codeforces: () => require('../../services/codeforces/codeforcesService').fetchCodeforcesStats,
  gfg: () => require('../../services/gfg/gfgService').fetchGfgStats,
};

const normalizeStats = (platform, data) => {
  switch (platform) {
    case 'github':
      return { solvedCount: 0, rating: 0, contestCount: 0, streak: 0, extraData: { ...data, activityCalendar: data.activityCalendar || {} } };
    case 'codeforces':
      return { solvedCount: data.solvedCount, rating: data.rating, contestCount: data.contestCount, streak: 0, extraData: { maxRating: data.maxRating, rank: data.rank, activityCalendar: data.activityCalendar || {} } };
    case 'leetcode':
      return { solvedCount: data.solvedCount, rating: data.ranking, contestCount: 0, streak: data.streak, extraData: { easySolved: data.easySolved, mediumSolved: data.mediumSolved, hardSolved: data.hardSolved, totalActiveDays: data.totalActiveDays, submissionCalendar: data.submissionCalendar || {} } };
    case 'gfg':
      return { solvedCount: data.solvedCount, rating: data.score, contestCount: 0, streak: data.streak, extraData: {} };
    default:
      return {};
  }
};

const processSnapshot = async (job) => {
  const { userId, platform, username } = job.data;

  const fetcher = PLATFORM_SERVICES[platform]?.();
  if (!fetcher) throw new Error(`Unknown platform: ${platform}`);

  const rawData = await fetcher(username);
  const stats = normalizeStats(platform, rawData);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Get previous snapshot for XP delta calculation
  const prevSnap = await Snapshot.findOne({ userId, platform, date: { $lt: today } }).sort({ date: -1 }).lean();

  // Upsert: update today's snapshot if it already exists (user solved more problems)
  await Snapshot.findOneAndUpdate(
    { userId, platform, date: today },
    { $set: stats },
    { upsert: true }
  );

  // Award XP based on progress since last snapshot
  const xpAwards = calculateSnapshotXP(platform, stats, prevSnap);
  for (const { source, amount } of xpAwards) {
    await awardXP(userId, source, amount);
  }

  // Bust the analytics cache so the next GET returns fresh data
  await delCache(
    `alvora:overview:${userId}`,
    `alvora:history:${userId}:all:90`,
    `alvora:history:${userId}:${platform}:90`,
    `alvora:history:${userId}:${platform}:30`,
    `alvora:history:${userId}:all:30`
  );

  // Push real-time update to the user's connected browser via Socket.IO
  const { emitToUser } = require('../../socket/index');
  emitToUser(userId.toString(), 'snapshot-updated', {
    platform,
    solvedCount: stats.solvedCount,
    streak: stats.streak,
    updatedAt: new Date(),
  });

  logger.info('Snapshot saved', { userId, platform, solvedCount: stats.solvedCount });
};

let worker = null;

const startSnapshotWorker = () => {
  try {
    worker = new Worker('snapshot-sync', processSnapshot, {
      connection: bullConnection,
      concurrency: 3,
    });

    worker.on('error', (err) => {
      logger.warn('Snapshot worker error', { error: err.message });
    });

    worker.on('failed', (job, err) => {
      logger.error('Snapshot job failed', { jobId: job?.id, error: err.message });
    });

    worker.on('completed', (job) => {
      logger.debug('Snapshot job completed', { jobId: job.id });
    });

    logger.info('Snapshot worker started');
  } catch (err) {
    logger.warn('Snapshot worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startSnapshotWorker };
