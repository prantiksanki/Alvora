const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  urlHash:  { type: String, required: true, unique: true },
  url:      { type: String, required: true },
  company:  { type: String, default: '' },
  title:    { type: String, default: '' },
  rawText:  { type: String, default: '' },
  structured: {
    requiredSkills:  [{ type: String }],
    preferredSkills: [{ type: String }],
    atsKeywords:     [{ type: String }],
    technologies:    [{ type: String }],
    roleType:        { type: String, default: '' },
    seniorityLevel:  { type: String, default: '' },
  },
  scrapedAt: { type: Date, default: Date.now },
});

// Auto-expire after 24 hours
jobDescriptionSchema.index({ scrapedAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
