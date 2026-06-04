const express = require('express');
const { getGamificationProfile } = require('../controllers/gamificationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', protect, getGamificationProfile);

// Leaderboard — placeholder for future feature
router.get('/leaderboard', protect, (req, res) => {
  res.status(200).json({ message: 'Leaderboard coming soon', data: [] });
});

module.exports = router;
