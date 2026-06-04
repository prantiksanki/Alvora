const express = require('express');
const { protect } = require('../middlewares/auth');
const { generateYearSummary } = require('../services/yearInCode/yearSummaryService');
const { getCache, setCache } = require('../config/redis');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/:year', protect, asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year);
  if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
    return res.status(400).json({ message: 'Invalid year' });
  }

  const cacheKey = `alvora:year:${req.user._id}:${year}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const summary = await generateYearSummary(req.user._id, year);

  // Cache for 6 hours
  await setCache(cacheKey, summary, 21600);
  res.status(200).json(summary);
}));

module.exports = router;
