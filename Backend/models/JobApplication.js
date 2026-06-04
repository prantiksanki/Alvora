const mongoose = require('mongoose');

const JOB_STATUSES = [
  'Applied',
  'OA_Received',
  'Interview_Scheduled',
  'Next_Round',
  'Rejected',
  'Offer',
  'Withdrawn',
  'Ghosted',
  'Waitlist',
  'Recruiter_Outreach',
];

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'Applied',
    },
    appliedDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    sourceEmail: { type: String }, // sender address of the detection email
    emailAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConnectedEmail',
    },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    isManual: { type: Boolean, default: false },

    // AI extraction metadata
    extractedBy: { type: String, enum: ['rule', 'ai', 'manual'], default: 'manual' },
    aiConfidence: { type: Number, min: 0, max: 100, default: null },

    // Recruiter contact (AI-extracted or manual)
    recruiterName: { type: String, trim: true },
    recruiterEmail: { type: String, trim: true, lowercase: true },

    // Scheduling signals
    interviewDate: { type: Date },
    meetingLink: { type: String },
    oaDeadline: { type: Date },

    // Manual enrichment
    salaryRange: { type: String, trim: true },
  },
  { timestamps: true }
);

// Used for deduplication lookups (case-insensitive handled at service layer)
jobApplicationSchema.index({ userId: 1, company: 1, role: 1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
