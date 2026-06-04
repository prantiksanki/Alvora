const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['github', 'leetcode', 'codeforces', 'gfg', 'codechef', 'atcoder'],
    required: true,
  },
  solvedCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  contestCount: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  // Stores platform-specific fields (e.g. GitHub: followers, stars, topLanguages)
  extraData: { type: mongoose.Schema.Types.Mixed, default: {} },
  // Normalized to midnight UTC — used for per-day deduplication
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Unique constraint prevents more than one snapshot per user per platform per day
snapshotSchema.index({ userId: 1, platform: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Snapshot', snapshotSchema);
