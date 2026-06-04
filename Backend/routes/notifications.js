const express = require('express');
const { param } = require('express-validator');
const { getNotifications, getUnreadCountHandler, markReadHandler, markAllReadHandler } = require('../controllers/notificationsController');
const { getJobNotifications, markJobNotificationRead } = require('../controllers/jobNotificationsController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCountHandler);

// Job notification routes — MUST come before /:id/read to prevent Express
// matching the literal path segment "jobs" as :id
router.get('/jobs', protect, getJobNotifications);
router.patch(
  '/jobs/:id/read',
  protect,
  validate([param('id').isMongoId().withMessage('Invalid notification ID')]),
  markJobNotificationRead
);

router.patch('/:id/read', protect, markReadHandler);
router.patch('/read-all', protect, markAllReadHandler);

module.exports = router;
