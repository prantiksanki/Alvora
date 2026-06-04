const mongoose = require('mongoose');

const xpHistorySchema = new mongoose.Schema({
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const userXPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  levelName: { type: String, default: 'Beginner' },
  xpHistory: { type: [xpHistorySchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

userXPSchema.index({ userId: 1 });
userXPSchema.index({ totalXP: -1 }); // for future leaderboard

module.exports = mongoose.model('UserXP', userXPSchema);
