const Notification = require('../models/Notification');
const { getUnreadCount, markAsRead, markAllRead } = require('../services/notifications/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unread] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId: req.user._id }),
    getUnreadCount(req.user._id),
  ]);

  res.status(200).json({
    notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    unreadCount: unread,
  });
});

const getUnreadCountHandler = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  res.status(200).json({ unreadCount: count });
});

const markReadHandler = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.user._id, req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.status(200).json(notification);
});

const markAllReadHandler = asyncHandler(async (req, res) => {
  await markAllRead(req.user._id);
  res.status(200).json({ message: 'All notifications marked as read' });
});

module.exports = { getNotifications, getUnreadCountHandler, markReadHandler, markAllReadHandler };
