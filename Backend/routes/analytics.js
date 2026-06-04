const express = require('express');
const { getOverview, getHistory } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/history', protect, getHistory);

module.exports = router;
