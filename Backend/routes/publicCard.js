const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Snapshot = require('../models/Snapshot');
const UserXP = require('../models/UserXP');
const Badge = require('../models/Badge');
const { calculateLevel } = require('../services/gamification/xpEngine');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Public — no auth required
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const [user, snapshots, xpDoc, badges] = await Promise.all([
    User.findById(userId).select('name bio college location avatarColor').lean(),
    Snapshot.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { date: -1 } },
      { $group: { _id: '$platform', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
    ]),
    UserXP.findOne({ userId }).lean(),
    Badge.find({ userId }).sort({ unlockedAt: -1 }).limit(6).lean(),
  ]);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const totalXP = xpDoc?.totalXP || 0;
  const { level, levelName, xpToNext } = calculateLevel(totalXP);

  res.status(200).json({
    user,
    overview: snapshots,
    gamification: { totalXP, level, levelName, xpToNext, badges },
  });
}));

module.exports = router;
