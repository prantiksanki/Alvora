const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createOrUpdateSubscription,
  getSubscription,
  updateSubscription,
  deactivateSubscription,
} = require('../controllers/subscriptionsController');

const router = express.Router();

router.use(protect);

// Reusable validation chains for subscription arrays
const subscriptionValidation = validate([
  body('companies')
    .optional()
    .isArray({ max: 50 })
    .withMessage('companies must be an array of at most 50 items'),
  body('companies.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each company must be a non-empty string (max 100 chars)'),
  body('roles')
    .optional()
    .isArray({ max: 50 })
    .withMessage('roles must be an array of at most 50 items'),
  body('roles.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each role keyword must be a non-empty string (max 100 chars)'),
  body('locations')
    .optional()
    .isArray({ max: 50 })
    .withMessage('locations must be an array of at most 50 items'),
  body('locations.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each location must be a non-empty string (max 100 chars)'),
  body('notificationPreferences').optional().isObject(),
  body('notificationPreferences.email').optional().isBoolean(),
  body('notificationPreferences.push').optional().isBoolean(),
  body('notificationPreferences.websocket').optional().isBoolean(),
]);

router.post('/', subscriptionValidation, createOrUpdateSubscription);
router.get('/', getSubscription);
router.patch('/', subscriptionValidation, updateSubscription);
router.delete('/', deactivateSubscription);

module.exports = router;
