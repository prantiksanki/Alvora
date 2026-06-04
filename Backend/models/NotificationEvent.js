const mongoose = require('mongoose');

const notificationEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobPostingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
  },
  sentAt: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['new_job', 'job_updated'],
    required: true,
  },
  readStatus: { type: Boolean, default: false },
});

// Compound unique index prevents duplicate notifications for same user+job
notificationEventSchema.index({ userId: 1, jobPostingId: 1 }, { unique: true });
// Auto-delete after 90 days
notificationEventSchema.index({ sentAt: 1 }, { expireAfterSeconds: 7776000 });
notificationEventSchema.index({ userId: 1, readStatus: 1 });

module.exports = mongoose.model('NotificationEvent', notificationEventSchema);
