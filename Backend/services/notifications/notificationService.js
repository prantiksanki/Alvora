const Notification = require('../../models/Notification');
const logger = require('../../utils/logger');

const createNotification = async (userId, type, title, message, link = null) => {
  try {
    return await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    logger.error('Failed to create notification', { userId, type, error: err.message });
    return null;
  }
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, read: false });
};

const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  );
};

const markAllRead = async (userId) => {
  return Notification.updateMany({ userId, read: false }, { $set: { read: true } });
};

// Email placeholder — ready for nodemailer/resend integration
const sendEmail = async (to, subject, html) => {
  if (process.env.SENDGRID_API_KEY) {
    // TODO: Integrate SendGrid or Resend
    logger.info('Email send intent', { to, subject });
  } else {
    logger.debug('Email skipped (no SENDGRID_API_KEY)', { to, subject });
  }
};

module.exports = { createNotification, getUnreadCount, markAsRead, markAllRead, sendEmail };
