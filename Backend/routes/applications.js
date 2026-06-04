const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  getApplications,
  getStats,
  getDetailedStats,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');

const JOB_STATUSES = [
  'Applied', 'OA_Received', 'Interview_Scheduled', 'Next_Round',
  'Rejected', 'Offer', 'Withdrawn', 'Ghosted', 'Waitlist', 'Recruiter_Outreach',
];

// IMPORTANT: /stats and /detailed-stats must be declared before /:id
// so Express does not treat the literal strings as MongoDB ObjectId parameters.
router.get('/', protect, getApplications);
router.get('/stats', protect, getStats);
router.get('/detailed-stats', protect, getDetailedStats);
router.get('/:id', protect, validate([param('id').isMongoId()]), getApplicationById);

router.post(
  '/',
  protect,
  validate([
    body('company').trim().notEmpty().withMessage('company is required').isLength({ max: 100 }),
    body('role').trim().notEmpty().withMessage('role is required').isLength({ max: 100 }),
    body('status').optional().isIn(JOB_STATUSES).withMessage('invalid status value'),
    body('appliedDate').optional().isISO8601().withMessage('appliedDate must be a valid ISO 8601 date'),
    body('notes').optional().isString().isLength({ max: 2000 }),
    body('tags').optional().isArray(),
  ]),
  createApplication
);

router.patch(
  '/:id',
  protect,
  validate([
    param('id').isMongoId(),
    body('status').optional().isIn(JOB_STATUSES).withMessage('invalid status value'),
    body('notes').optional().isString().isLength({ max: 2000 }),
    body('company').optional().trim().isLength({ min: 1, max: 100 }),
    body('role').optional().trim().isLength({ min: 1, max: 100 }),
    body('appliedDate').optional().isISO8601(),
    body('salaryRange').optional().isString().isLength({ max: 100 }),
  ]),
  updateApplication
);

router.delete('/:id', protect, validate([param('id').isMongoId()]), deleteApplication);

module.exports = router;
