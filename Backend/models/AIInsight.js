const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  category: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'tip', 'success'], default: 'info' },
  icon: { type: String, default: '💡' },
});

const scoresSchema = new mongoose.Schema({
  dsaReadiness: { type: Number, default: 0 },
  interviewReadiness: { type: Number, default: 0 },
  consistencyScore: { type: Number, default: 0 },
  openSourceScore: { type: Number, default: 0 },
}, { _id: false });

const aiInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  insights: [insightSchema],
  scores: scoresSchema,
  generatedAt: { type: Date, default: Date.now },
});

// Auto-delete after 24 hours — workers refresh this document
aiInsightSchema.index({ generatedAt: 1 }, { expireAfterSeconds: 86400 });
aiInsightSchema.index({ userId: 1 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
