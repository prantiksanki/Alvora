const mongoose = require('mongoose');

const emailEventSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emailSubject: { type: String },
    emailSender: { type: String },
    receivedAt: { type: Date },
    detectedStatus: { type: String },
    snippet: { type: String },
    gmailMessageId: { type: String },
    rawLabels: [{ type: String }],
  },
  { timestamps: true }
);

// Sparse so manual-app events (no gmailMessageId) don't collide; unique prevents re-processing
emailEventSchema.index({ gmailMessageId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('EmailEvent', emailEventSchema);
