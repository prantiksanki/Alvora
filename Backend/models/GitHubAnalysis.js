const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String, default: '' },
  stars:       { type: Number, default: 0 },
  language:    { type: String, default: '' },
  languages:   { type: mongoose.Schema.Types.Mixed, default: {} },
  topics:      [{ type: String }],
  readme:      { type: String, default: '' },
  techStack:   [{ type: String }],
  summary:     { type: String, default: '' },
  category:    { type: String, default: 'other' },
  skillTags:   [{ type: String }],
  githubUrl:   { type: String, default: '' },
}, { _id: false });

const gitHubAnalysisSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username:   { type: String, required: true },
  repos:      [repoSchema],
  allSkills:  [{ type: String }],
  analyzedAt: { type: Date, default: Date.now },
  expiresAt:  { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
});

gitHubAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GitHubAnalysis', gitHubAnalysisSchema);
