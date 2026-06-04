const NotificationEvent = require('../models/NotificationEvent');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/notifications/jobs
 * Get the authenticated user's job notification events, newest first.
 */
const getJobNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    NotificationEvent.find({ userId: req.user._id })
      .populate('jobPostingId', 'company title location employmentType remote source applyUrl detectedAt')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    NotificationEvent.countDocuments({ userId: req.user._id }),
  ]);

  const unreadCount = await NotificationEvent.countDocuments({
    userId: req.user._id,
    readStatus: false,
  });

  res.status(200).json({
    events,
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * PATCH /api/notifications/jobs/:id/read
 * Mark a single job notification event as read.
 */
const markJobNotificationRead = asyncHandler(async (req, res) => {
  const event = await NotificationEvent.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { readStatus: true } },
    { new: true }
  );

  if (!event) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.status(200).json({ event });
});

module.exports = { getJobNotifications, markJobNotificationRead };
