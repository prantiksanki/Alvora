const UserXP = require('../models/UserXP');
const Badge = require('../models/Badge');
const { calculateLevel } = require('../services/gamification/xpEngine');
const asyncHandler = require('../utils/asyncHandler');

const getGamificationProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [xpDoc, badges] = await Promise.all([
    UserXP.findOne({ userId }),
    Badge.find({ userId }).sort({ unlockedAt: -1 }).lean(),
  ]);

  const totalXP = xpDoc?.totalXP || 0;
  const { level, levelName, xpToNext } = calculateLevel(totalXP);
  const recentBadges = badges.slice(0, 3);

  res.status(200).json({
    totalXP,
    level,
    levelName,
    xpToNext,
    badges,
    recentBadges,
    badgeCount: badges.length,
  });
});

module.exports = { getGamificationProfile };
