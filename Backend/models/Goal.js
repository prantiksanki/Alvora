const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  platform: { type: String, enum: ['leetcode', 'codeforces', 'github', 'gfg'], required: true },
  unit: { type: String, required: true, trim: true },
  current: { type: Number, default: 0 },
  target: { type: Number, required: true },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['active', 'completed', 'behind'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

goalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', goalSchema);
