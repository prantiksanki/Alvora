const express = require('express');
const { body, param, query } = require('express-validator');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { getJobs, getAppliedJobIds, getLiveJobs, getJobById, applyToJob } = require('../controllers/jobsController');

const router = express.Router();

router.use(protect);

// Literal paths MUST come before /:id — prevents Express treating them as MongoIds
router.get('/live', getLiveJobs);
router.get('/applied-ids', getAppliedJobIds);

router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('source')
      .optional()
      .isIn(['greenhouse', 'lever', 'ashby', 'workday', 'company_api'])
      .withMessage('Invalid source'),
    query('employmentType')
      .optional()
      .isIn(['full_time', 'part_time', 'contract', 'internship'])
      .withMessage('Invalid employmentType'),
    query('remote').optional().isBoolean().withMessage('remote must be boolean'),
    query('search').optional().isString().trim().isLength({ max: 100 }),
    query('company').optional().isString().trim().isLength({ max: 100 }),
  ]),
  getJobs
);

router.get('/:id', validate([param('id').isMongoId().withMessage('Invalid job ID')]), getJobById);

router.post('/:id/apply', validate([param('id').isMongoId().withMessage('Invalid job ID')]), applyToJob);

module.exports = router;
