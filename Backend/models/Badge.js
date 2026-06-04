const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'github', 'gfg', 'general'],
    default: 'general',
  },
  unlockedAt: { type: Date, default: Date.now },
});

// Each user can only earn each badge once
badgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
badgeSchema.index({ userId: 1, unlockedAt: -1 });

module.exports = mongoose.model('Badge', badgeSchema);
