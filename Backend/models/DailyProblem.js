const mongoose = require('mongoose');

const dailyProblemSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['leetcode', 'gfg', 'codeforces', 'codechef'],
    required: true,
  },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  title: { type: String, required: true },
  problemId: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  url: { type: String, required: true },
  tags: [{ type: String }],
  accuracy: { type: Number, default: null },
  rating: { type: Number, default: null }, // Codeforces rating
  fetchedAt: { type: Date, default: Date.now },
});

// One document per platform per date
dailyProblemSchema.index({ platform: 1, date: 1 }, { unique: true });
// TTL: auto-delete after 90 days
dailyProblemSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('DailyProblem', dailyProblemSchema);
