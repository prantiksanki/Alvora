const mongoose = require('mongoose');

const jobSyncHistorySchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['greenhouse', 'lever', 'ashby', 'workday'],
    required: true,
  },
  companySlug: { type: String, required: true },
  syncStartedAt: { type: Date, default: Date.now },
  syncCompletedAt: { type: Date, default: null },
  jobsFetched: { type: Number, default: 0 },
  newJobsDetected: { type: Number, default: 0 },
  updatedJobsDetected: { type: Number, default: 0 },
  errors: [{ type: String }],
  status: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    required: true,
  },
});

// Auto-delete after 30 days
jobSyncHistorySchema.index({ syncStartedAt: 1 }, { expireAfterSeconds: 2592000 });
jobSyncHistorySchema.index({ source: 1, companySlug: 1 });

module.exports = mongoose.model('JobSyncHistory', jobSyncHistorySchema);
