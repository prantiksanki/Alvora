const Badge = require('../../models/Badge');
const { awardXP, XP_EVENTS } = require('./xpEngine');
const logger = require('../../utils/logger');

const BADGES = [
  { id: 'streak_7', name: 'On Fire', description: '7-day coding streak', icon: '🔥', platform: 'general', check: ({ maxStreak }) => maxStreak >= 7 },
  { id: 'streak_30', name: 'Consistency King', description: '30-day coding streak', icon: '👑', platform: 'general', check: ({ maxStreak }) => maxStreak >= 30 },
  { id: 'streak_100', name: 'Unstoppable', description: '100-day coding streak', icon: '💎', platform: 'general', check: ({ maxStreak }) => maxStreak >= 100 },
  { id: 'solved_50', name: 'Problem Seeker', description: '50 problems solved', icon: '🎯', platform: 'leetcode', check: ({ lcSolved }) => lcSolved >= 50 },
  { id: 'solved_100', name: 'Century Club', description: '100 problems solved', icon: '💯', platform: 'leetcode', check: ({ lcSolved }) => lcSolved >= 100 },
  { id: 'solved_300', name: 'Problem Master', description: '300 problems solved', icon: '⚡', platform: 'leetcode', check: ({ lcSolved }) => lcSolved >= 300 },
  { id: 'solved_500', name: 'LeetCode Legend', description: '500 problems solved', icon: '🌟', platform: 'leetcode', check: ({ lcSolved }) => lcSolved >= 500 },
  { id: 'first_contest', name: 'Arena Debut', description: 'First contest participated', icon: '🏟️', platform: 'codeforces', check: ({ cfContests }) => cfContests >= 1 },
  { id: 'cf_1200', name: 'Pupil', description: 'Reached Codeforces Pupil (1200)', icon: '🌱', platform: 'codeforces', check: ({ cfRating }) => cfRating >= 1200 },
  { id: 'cf_1400', name: 'Specialist', description: 'Reached Codeforces Specialist (1400)', icon: '🔵', platform: 'codeforces', check: ({ cfRating }) => cfRating >= 1400 },
  { id: 'cf_1600', name: 'Expert', description: 'Reached Codeforces Expert (1600)', icon: '💙', platform: 'codeforces', check: ({ cfRating }) => cfRating >= 1600 },
  { id: 'cf_1900', name: 'Candidate Master', description: 'Reached Codeforces Candidate Master (1900)', icon: '💜', platform: 'codeforces', check: ({ cfRating }) => cfRating >= 1900 },
  { id: 'github_stars_10', name: 'Star Earner', description: '10 GitHub stars', icon: '⭐', platform: 'github', check: ({ ghStars }) => ghStars >= 10 },
  { id: 'github_stars_50', name: 'Star Catcher', description: '50 GitHub stars', icon: '✨', platform: 'github', check: ({ ghStars }) => ghStars >= 50 },
  { id: 'github_repos_10', name: 'Builder', description: '10 public GitHub repos', icon: '🏗️', platform: 'github', check: ({ ghRepos }) => ghRepos >= 10 },
  { id: 'platform_connected', name: 'Multi-Platform Dev', description: 'Connected all 4 platforms', icon: '🔗', platform: 'general', check: ({ platformsConnected }) => platformsConnected >= 4 },
  { id: 'gfg_100', name: 'GFG Scholar', description: '100 GFG problems solved', icon: '📚', platform: 'gfg', check: ({ gfgSolved }) => gfgSolved >= 100 },
];

const checkAndAwardBadges = async (userId, overview, profile) => {
  const getSnap = (platform) => overview.find((s) => s.platform === platform);
  const lc = getSnap('leetcode');
  const cf = getSnap('codeforces');
  const gh = getSnap('github');
  const gfg = getSnap('gfg');

  const maxStreak = Math.max(...overview.map((s) => s.streak || 0), 0);

  const context = {
    lcSolved: lc?.solvedCount || 0,
    cfRating: cf?.rating || 0,
    cfContests: cf?.contestCount || 0,
    ghStars: gh?.extraData?.stars || 0,
    ghRepos: gh?.extraData?.publicRepos || 0,
    gfgSolved: gfg?.solvedCount || 0,
    maxStreak,
    platformsConnected: [
      profile?.githubUsername,
      profile?.leetcodeUsername,
      profile?.codeforcesUsername,
      profile?.gfgUsername,
    ].filter(Boolean).length,
  };

  // Get badges the user already has
  const existingBadges = await Badge.find({ userId }).select('badgeId').lean();
  const existingIds = new Set(existingBadges.map((b) => b.badgeId));

  const newBadges = [];
  for (const badge of BADGES) {
    if (existingIds.has(badge.id)) continue;
    if (badge.check(context)) {
      try {
        const created = await Badge.create({ userId, badgeId: badge.id, name: badge.name, description: badge.description, icon: badge.icon, platform: badge.platform });
        await awardXP(userId, `badge_${badge.id}`, XP_EVENTS.BADGE_UNLOCKED);
        newBadges.push(created);
        logger.info('Badge awarded', { userId, badgeId: badge.id });
      } catch (err) {
        if (err.code !== 11000) logger.error('Badge award failed', { userId, badgeId: badge.id, error: err.message });
      }
    }
  }

  return newBadges;
};

module.exports = { BADGES, checkAndAwardBadges };
