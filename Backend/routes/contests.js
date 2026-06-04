const express = require('express');
const { getUpcomingContests, getRecentContests } = require('../controllers/contestsController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/upcoming', protect, getUpcomingContests);
router.get('/recent', protect, getRecentContests);

module.exports = router;
