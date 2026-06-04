const mongoose = require('mongoose');

const platformProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  leetcodeUsername: { type: String, default: '', trim: true },
  codeforcesUsername: { type: String, default: '', trim: true },
  githubUsername: { type: String, default: '', trim: true },
  gfgUsername: { type: String, default: '', trim: true },
  codechefUsername: { type: String, default: '', trim: true },
  atcoderUsername: { type: String, default: '', trim: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlatformProfile', platformProfileSchema);
