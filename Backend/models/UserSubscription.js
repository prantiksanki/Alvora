const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companies: [{ type: String }],
  roles: [{ type: String }],
  locations: [{ type: String }],
  notificationPreferences: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    websocket: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

// One subscription document per user
userSubscriptionSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
