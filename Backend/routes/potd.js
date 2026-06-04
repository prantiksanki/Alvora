const express = require('express');
const { query } = require('express-validator');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { getTodayPotd, getPotdHistory, refreshPotd } = require('../controllers/potdController');

const router = express.Router();

router.use(protect);

// GET /api/potd — today's POTD for all platforms
router.get('/', getTodayPotd);

// GET /api/potd/history — past problems
router.get(
  '/history',
  validate([
    query('platform').optional().isIn(['leetcode', 'gfg', 'codeforces', 'codechef']),
    query('days').optional().isInt({ min: 1, max: 30 }).toInt(),
  ]),
  getPotdHistory
);

// POST /api/potd/refresh — manual trigger
router.post('/refresh', refreshPotd);

module.exports = router;
