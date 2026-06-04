const UserXP = require('../../models/UserXP');
const logger = require('../../utils/logger');

const XP_EVENTS = {
  PROBLEM_SOLVED: 10,
  STREAK_DAY: 5,
  CONTEST_PARTICIPATED: 50,
  GITHUB_COMMIT: 2,
  BADGE_UNLOCKED: 100,
  GOAL_COMPLETED: 150,
  PROFILE_CONNECTED: 25,
  FIRST_SOLVE: 50,
};

const LEVELS = [
  { level: 1, minXP: 0, name: 'Beginner' },
  { level: 2, minXP: 500, name: 'Problem Solver' },
  { level: 3, minXP: 1500, name: 'Algorithm Enthusiast' },
  { level: 4, minXP: 3000, name: 'Competitive Coder' },
  { level: 5, minXP: 6000, name: 'Expert Developer' },
  { level: 6, minXP: 10000, name: 'Code Legend' },
];

const calculateLevel = (totalXP) => {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.minXP) current = lvl;
    else break;
  }
  const nextLevel = LEVELS.find((l) => l.minXP > totalXP);
  const xpToNext = nextLevel ? nextLevel.minXP - totalXP : 0;
  return { level: current.level, levelName: current.name, xpToNext, totalXP };
};

const awardXP = async (userId, source, amount) => {
  try {
    const doc = await UserXP.findOneAndUpdate(
      { userId },
      {
        $inc: { totalXP: amount },
        $push: { xpHistory: { $each: [{ source, amount, timestamp: new Date() }], $slice: -100 } },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    const { level, levelName } = calculateLevel(doc.totalXP);
    if (level !== doc.level) {
      await UserXP.updateOne({ userId }, { $set: { level, levelName } });
      logger.info('Level up!', { userId, level, levelName });
      return { leveled: true, level, levelName };
    }

    await UserXP.updateOne({ userId }, { $set: { level, levelName } });
    return { leveled: false };
  } catch (err) {
    logger.error('XP award failed', { userId, source, error: err.message });
    return { leveled: false };
  }
};

// Calculate XP from a snapshot delta vs previous state
const calculateSnapshotXP = (platform, current, previous) => {
  const awards = [];

  if (platform === 'leetcode' || platform === 'codeforces' || platform === 'gfg') {
    const delta = (current.solvedCount || 0) - (previous?.solvedCount || 0);
    if (delta > 0) {
      awards.push({ source: `${platform}_solved`, amount: delta * XP_EVENTS.PROBLEM_SOLVED });
    }
  }

  if (platform === 'codeforces') {
    const contestDelta = (current.contestCount || 0) - (previous?.contestCount || 0);
    if (contestDelta > 0) {
      awards.push({ source: 'contest_participated', amount: contestDelta * XP_EVENTS.CONTEST_PARTICIPATED });
    }
  }

  const streak = current.streak || 0;
  if (streak > 0) {
    awards.push({ source: 'streak_day', amount: XP_EVENTS.STREAK_DAY });
  }

  return awards;
};

module.exports = { XP_EVENTS, LEVELS, calculateLevel, awardXP, calculateSnapshotXP };
