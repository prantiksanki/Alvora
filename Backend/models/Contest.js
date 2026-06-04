const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['codeforces', 'leetcode'],
    required: true,
  },
  contestId: { type: String, required: true },
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, default: 0 }, // seconds
  url: { type: String, default: '' },
  status: {
    type: String,
    enum: ['upcoming', 'running', 'finished'],
    default: 'upcoming',
  },
  updatedAt: { type: Date, default: Date.now },
});

contestSchema.index({ platform: 1, startTime: -1 });
contestSchema.index({ platform: 1, contestId: 1 }, { unique: true });
contestSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('Contest', contestSchema);
