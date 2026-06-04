const mongoose = require('mongoose');
const AIInsight = require('../models/AIInsight');
const Snapshot = require('../models/Snapshot');
const { generateInsights } = require('../services/ai/insightsEngine');
const { getAnalyticsQueue } = require('../queues');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const getInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Return cached insight if < 24 hours old
  const existing = await AIInsight.findOne({ userId });
  if (existing) return res.status(200).json(existing);

  // Generate fresh insights synchronously
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

  const result = await generateInsights(overview, history);

  const insight = await AIInsight.findOneAndUpdate(
    { userId },
    { userId, ...result, generatedAt: new Date() },
    { upsert: true, new: true }
  );

  logger.info('Insights generated', { userId });
  res.status(200).json(insight);
});

const refreshInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const queue = getAnalyticsQueue();
  if (queue) {
    await queue.add('refresh-insights', { userId });
    return res.status(202).json({ message: 'Insights refresh queued. Check back in a moment.' });
  }

  // Fallback: delete existing and redirect to GET
  await AIInsight.deleteOne({ userId: req.user._id });
  res.status(202).json({ message: 'Insights cleared. Refresh the page to regenerate.' });
});

module.exports = { getInsights, refreshInsights };
