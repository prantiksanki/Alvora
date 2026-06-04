const Contest = require('../models/Contest');
const asyncHandler = require('../utils/asyncHandler');

const getUpcomingContests = asyncHandler(async (req, res) => {
  const { platform } = req.query;
  const query = {
    status: { $in: ['upcoming', 'running'] },
    startTime: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  };
  if (platform) query.platform = platform;

  const contests = await Contest.find(query)
    .sort({ startTime: 1 })
    .limit(20)
    .lean();

  res.status(200).json(contests);
});

const getRecentContests = asyncHandler(async (req, res) => {
  const { platform } = req.query;
  const query = { status: 'finished' };
  if (platform) query.platform = platform;

  const contests = await Contest.find(query)
    .sort({ startTime: -1 })
    .limit(10)
    .lean();

  res.status(200).json(contests);
});

module.exports = { getUpcomingContests, getRecentContests };
