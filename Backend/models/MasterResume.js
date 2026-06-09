const mongoose = require('mongoose');

const masterResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rawText: { type: String, required: true },
  structured: {
    contactInfo: {
      name:     { type: String, default: '' },
      email:    { type: String, default: '' },
      phone:    { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github:   { type: String, default: '' },
      website:  { type: String, default: '' },
    },
    education: [{ type: mongoose.Schema.Types.Mixed }],
    experience: [{ type: mongoose.Schema.Types.Mixed }],
    skills: [{ type: String }],
    projects: [{
      name:        String,
      description: String,
      bullets:     [String],
      techStack:   [String],
      githubUrl:   String,
    }],
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MasterResume', masterResumeSchema);
