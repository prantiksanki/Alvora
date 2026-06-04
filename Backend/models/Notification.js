const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['streak_reminder', 'goal_complete', 'contest_upcoming', 'badge_unlocked', 'inactivity', 'level_up', 'general', 'ghosted_warning', 'job_update', 'new_job'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
// Auto-delete notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);
