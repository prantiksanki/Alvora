const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, default: null },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'internship'],
    default: 'full_time',
  },
  remote: { type: Boolean, default: false },
  source: {
    type: String,
    enum: ['greenhouse', 'lever', 'ashby', 'workday', 'company_api'],
    required: true,
  },
  externalJobId: { type: String, required: true },
  applyUrl: { type: String, default: null },
  description: { type: String, default: null },
  postedAt: { type: Date, default: null },
  detectedAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  contentHash: { type: String, default: null },
});

// Deduplication anchor — one job per source+externalId
jobPostingSchema.index({ source: 1, externalJobId: 1 }, { unique: true });
jobPostingSchema.index({ company: 1 });
jobPostingSchema.index({ title: 1 });
jobPostingSchema.index({ detectedAt: -1 });
jobPostingSchema.index({ isActive: 1 });

module.exports = mongoose.model('JobPosting', jobPostingSchema);
