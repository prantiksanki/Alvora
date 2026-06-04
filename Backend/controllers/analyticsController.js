const mongoose = require('mongoose');
const Snapshot = require('../models/Snapshot');
const asyncHandler = require('../utils/asyncHandler');
const { getCache, setCache } = require('../config/redis');

const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const cacheKey = `alvora:overview:${userId}`;

  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const overview = await Snapshot.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: '$platform',
        latest: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$latest' } },
  ]);

  // Cache for 30 minutes
  await setCache(cacheKey, overview, 1800);
  res.set('Cache-Control', 'no-store');
  res.status(200).json(overview);
});

const getHistory = asyncHandler(async (req, res) => {
  const { platform, days = 30 } = req.query;
  const userId = req.user._id.toString();
  const cacheKey = `alvora:history:${userId}:${platform || 'all'}:${days}`;

  const cached = await getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - Number(days));
  since.setUTCHours(0, 0, 0, 0);

  const query = { userId: req.user._id, date: { $gte: since } };
  if (platform) query.platform = platform;

  const snapshots = await Snapshot.find(query).sort({ date: 1 }).lean();

  // Cache for 1 hour
  await setCache(cacheKey, snapshots, 3600);
  res.set('Cache-Control', 'no-store');
  res.status(200).json(snapshots);
});

module.exports = { getOverview, getHistory };
