const express = require('express');
const { body, query } = require('express-validator');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { getRegistry, getMonitorStats, triggerSync, getSyncHistory } = require('../controllers/monitorController');

const router = express.Router();

router.use(protect);

// GET /api/monitor/registry — browse the company registry
router.get(
  '/registry',
  validate([
    query('priority').optional().isIn(['high', 'medium', 'low']),
    query('provider').optional().isIn(['greenhouse', 'lever', 'ashby', 'workday']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
  ]),
  getRegistry
);

// GET /api/monitor/stats — dashboard stats for monitoring system
router.get('/stats', getMonitorStats);

// GET /api/monitor/sync-history — recent sync audit log
router.get(
  '/sync-history',
  validate([
    query('companySlug').optional().isString().trim(),
    query('source').optional().isIn(['greenhouse', 'lever', 'ashby']),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  ]),
  getSyncHistory
);

// POST /api/monitor/sync — manually trigger a sync
router.post(
  '/sync',
  validate([
    body('provider').optional().isIn(['greenhouse', 'lever', 'ashby', 'workday']),
    body('identifier').optional().isString().trim().matches(/^[a-zA-Z0-9-]+$/),
    body('priority').optional().isIn(['high', 'medium', 'low']),
  ]),
  triggerSync
);

module.exports = router;
