const mongoose = require('mongoose');
const AIInsight = require('../models/AIInsight');
const Snapshot = require('../models/Snapshot');
const { generateInsights } = require('../services/ai/insightsEngine');
const { getAnalyticsQueue } = require('../queues');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const getInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Return cached insight if < 24 hours old (skip cache with ?force=true)
  const forceRefresh = req.query.force === 'true';
  if (!forceRefresh) {
    const existing = await AIInsight.findOne({ userId });
    if (existing) {
      logger.info('Returning cached insights', { userId });
      return res.status(200).json(existing);
    }
  } else {
    await AIInsight.deleteOne({ userId });
    logger.info('Force-refresh: cleared cached insights', { userId });
  }

  // Fetch latest snapshot per platform + 90-day history
  const [overview, history] = await Promise.all([
    Snapshot.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { date: -1 } },
      { $group: { _id: '$platform', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
    ]),
    Snapshot.find({
      userId,
      date: { $gte: new Date(Date.now() - 90 * 86400000) },
    }).sort({ date: 1 }).lean(),
  ]);

  logger.info('Snapshot data for insights', {
    userId,
    platformsFound: overview.map((s) => s.platform),
    snapshotCount: history.length,
  });

  const result = await generateInsights(overview, history);

  const insight = await AIInsight.findOneAndUpdate(
    { userId },
    { userId, ...result, generatedAt: new Date() },
    { upsert: true, new: true }
  );

  logger.info('Fresh insights generated and cached', { userId, insightCount: result.insights?.length });
  res.status(200).json(insight);
});

const refreshInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  // Always delete cached insights so the next GET regenerates fresh
  await AIInsight.deleteOne({ userId: req.user._id });

  const queue = getAnalyticsQueue();
  if (queue) {
    await queue.add('refresh-insights', { userId });
  }

  res.status(202).json({ message: 'Insights cleared. Refresh the page to regenerate.' });
});

module.exports = { getInsights, refreshInsights };
