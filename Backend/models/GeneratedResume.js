const mongoose = require('mongoose');

const generatedResumeSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobDescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription' },
  jobTitle:         { type: String, default: '' },
  company:          { type: String, default: '' },
  aiJson:           { type: mongoose.Schema.Types.Mixed },
  texPath:          { type: String },
  pdfPath:          { type: String },
  selectedProjects: [{ type: String }],
  injectedSkills:   [{ type: String }],
  atsScore:         { type: Number, default: 0 },
  createdAt:        { type: Date, default: Date.now },
});

generatedResumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GeneratedResume', generatedResumeSchema);
