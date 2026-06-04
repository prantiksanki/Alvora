const mongoose = require('mongoose');

const syncHistorySchema = new mongoose.Schema({
  emailAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedEmail',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  syncStartedAt: { type: Date, default: Date.now },
  syncCompletedAt: { type: Date },
  emailsProcessed: { type: Number, default: 0 },
  newApplications: { type: Number, default: 0 },
  updatedApplications: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running',
  },
  errors: [{ type: String }],
});

// Auto-delete sync history after 90 days
syncHistorySchema.index({ syncStartedAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('SyncHistory', syncHistorySchema);
