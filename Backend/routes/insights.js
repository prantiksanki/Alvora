const express = require('express');
const { getInsights, refreshInsights } = require('../controllers/insightsController');
const { protect } = require('../middlewares/auth');
const { strictLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/', protect, getInsights);
router.post('/refresh', protect, strictLimiter, refreshInsights);

module.exports = router;
