const mongoose = require('mongoose');

const connectedEmailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'outlook'],
      default: 'gmail',
    },
    emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Stored AES-256-GCM encrypted — never returned in API responses
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiry: { type: Date },
    lastSyncedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

connectedEmailSchema.index({ userId: 1, emailAddress: 1 }, { unique: true });

module.exports = mongoose.model('ConnectedEmail', connectedEmailSchema);
