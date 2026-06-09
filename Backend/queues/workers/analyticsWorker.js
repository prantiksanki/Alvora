const { Worker } = require('bullmq');
const { bullConnection } = require('../../config/redis');
const logger = require('../../utils/logger');

const processAnalytics = async (job) => {
  const { userId } = job.data;

  const mongoose = require('mongoose');
  const Snapshot = require('../../models/Snapshot');
  const AIInsight = require('../../models/AIInsight');
  const { generateInsights } = require('../../services/ai/insightsEngine');

  const userObjId = new mongoose.Types.ObjectId(userId);

  const [overview, history] = await Promise.all([
    Snapshot.aggregate([
      { $match: { userId: userObjId } },
      { $sort: { date: -1 } },
      { $group: { _id: '$platform', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
    ]),
    Snapshot.find({
      userId,
      date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    }).sort({ date: 1 }).lean(),
  ]);

  const result = await generateInsights(overview, history);

  await AIInsight.findOneAndUpdate(
    { userId },
    { userId, ...result, generatedAt: new Date() },
    { upsert: true, new: true }
  );

  logger.info('AI insights generated via worker', { userId });
};

let worker = null;

const startAnalyticsWorker = () => {
  try {
    worker = new Worker('analytics', processAnalytics, {
      connection: bullConnection,
      concurrency: 2,
    });

    worker.on('error', (err) => {
      logger.warn('Analytics worker error', { error: err.message });
    });

    worker.on('failed', (job, err) => {
      logger.error('Analytics job failed', { jobId: job?.id, error: err.message });
    });

    logger.info('Analytics worker started');
  } catch (err) {
    logger.warn('Analytics worker unavailable (Redis required)', { error: err.message });
  }
};

module.exports = { startAnalyticsWorker };
