const fs   = require('fs');
const axios = require('axios');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const MasterResume    = require('../models/MasterResume');
const GitHubAnalysis  = require('../models/GitHubAnalysis');
const JobDescription  = require('../models/JobDescription');
const GeneratedResume = require('../models/GeneratedResume');
const PlatformProfile = require('../models/PlatformProfile');

const { analyzeUserRepos } = require('../services/resume/githubAnalyzer');
const { scrapeJob }        = require('../services/resume/jobScraper');
const { matchAndGenerate } = require('../services/resume/resumeAI');
const { buildLatex }       = require('../services/resume/latexBuilder');
const { compileToPdf }     = require('../services/resume/pdfCompiler');

// ── Master Resume ────────────────────────────────────────────────────────────

/**
 * GET /api/resume/master
 */
const getMasterResume = asyncHandler(async (req, res) => {
  const resume = await MasterResume.findOne({ userId: req.user._id }).lean();
  res.status(200).json({ resume: resume || null });
});

/**
 * POST /api/resume/master
 * Body: { rawText: string, structured?: {...} }
 * Parses the raw text via AI to extract structured sections.
 */
const saveMasterResume = asyncHandler(async (req, res) => {
  const { rawText, structured } = req.body;
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ message: 'Resume text is required' });
  }

  let parsedStructured = structured;

  // If structured not provided, ask AI to parse it
  if (!parsedStructured) {
    try {
      const prompt = `Parse this resume text and extract structured information. Respond with ONLY valid JSON, no markdown.

Resume text:
${rawText.slice(0, 6000)}

Respond with ONLY this JSON:
{
  "contactInfo": {
    "name": "", "email": "", "phone": "", "linkedin": "", "github": "", "website": ""
  },
  "education": [
    { "school": "", "degree": "", "field": "", "dates": "", "gpa": "" }
  ],
  "experience": [
    { "company": "", "role": "", "dates": "", "location": "", "bullets": [""] }
  ],
  "skills": ["skill1", "skill2"],
  "projects": [
    { "name": "", "description": "", "bullets": [""], "techStack": [""], "githubUrl": "" }
  ]
}

Extract only what is explicitly present. Leave fields empty if not found.`;

      const { data } = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-2.5-flash-lite',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );

      let raw = data.choices?.[0]?.message?.content || '{}';
      raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      parsedStructured = JSON.parse(raw);
    } catch (err) {
      logger.warn('resumeController: AI parse failed, saving raw only', { error: err.message });
      parsedStructured = { contactInfo: {}, education: [], experience: [], skills: [], projects: [] };
    }
  }

  const resume = await MasterResume.findOneAndUpdate(
    { userId: req.user._id },
    { userId: req.user._id, rawText, structured: parsedStructured, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  res.status(200).json({ resume });
});

// ── GitHub Analysis ──────────────────────────────────────────────────────────

/**
 * GET /api/resume/github-analysis
 */
const getGitHubAnalysis = asyncHandler(async (req, res) => {
  const analysis = await GitHubAnalysis.findOne({ userId: req.user._id }).lean();
  res.status(200).json({ analysis: analysis || null });
});

/**
 * POST /api/resume/analyze-github
 * Triggers deep repo analysis. Uses cached result if < 7 days old.
 */
const analyzeGitHub = asyncHandler(async (req, res) => {
  const profile = await PlatformProfile.findOne({ userId: req.user._id }).lean();
  if (!profile?.githubUsername) {
    return res.status(400).json({ message: 'No GitHub username connected. Add it in Settings first.' });
  }

  const analysis = await analyzeUserRepos(req.user._id, profile.githubUsername);
  res.status(200).json({ analysis });
});

// ── Job Scraping ─────────────────────────────────────────────────────────────

/**
 * POST /api/resume/scrape-job
 * Body: { url: string }
 */
const scrapeJobDescription = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ message: 'A valid job URL is required' });
  }

  try {
    const jobDesc = await scrapeJob(url);
    res.status(200).json({ jobDescription: jobDesc });
  } catch (err) {
    logger.error('resumeController: scrape-job failed', { url, error: err.message });
    res.status(422).json({ message: err.message || 'Failed to parse job URL' });
  }
});

// ── Generate Tailored Resume ─────────────────────────────────────────────────

/**
 * POST /api/resume/generate
 * Body: { jobDescriptionId: string }
 * Full pipeline: AI match → LaTeX build → PDF compile → store
 */
const generateResume = asyncHandler(async (req, res) => {
  const { jobDescriptionId } = req.body;
  if (!jobDescriptionId) {
    return res.status(400).json({ message: 'jobDescriptionId is required' });
  }

  const [masterResume, githubAnalysis, jobDescription] = await Promise.all([
    MasterResume.findOne({ userId: req.user._id }),
    GitHubAnalysis.findOne({ userId: req.user._id }),
    JobDescription.findById(jobDescriptionId),
  ]);

  if (!masterResume) return res.status(400).json({ message: 'No master resume found. Upload your resume first.' });
  if (!githubAnalysis) return res.status(400).json({ message: 'No GitHub analysis found. Analyze your repositories first.' });
  if (!jobDescription) return res.status(400).json({ message: 'Job description not found.' });

  logger.info('resumeController: generating resume', {
    userId: req.user._id,
    company: jobDescription.company,
    title: jobDescription.title,
  });

  // Step 1: AI matching
  const aiJson = await matchAndGenerate({ jobDescription, githubAnalysis, masterResume });

  // Step 2: Build LaTeX
  const latexContent = buildLatex(masterResume, aiJson);

  // Step 3: Create DB record (get the ID for the directory path)
  const generated = await GeneratedResume.create({
    userId: req.user._id,
    jobDescriptionId,
    jobTitle: jobDescription.title,
    company: jobDescription.company,
    aiJson,
    selectedProjects: (aiJson.selectedProjects || []).map((p) => p.name),
    injectedSkills: [
      ...(aiJson.skills?.languages  || []),
      ...(aiJson.skills?.frameworks || []),
      ...(aiJson.skills?.tools      || []),
      ...(aiJson.skills?.databases  || []),
    ],
    atsScore: aiJson.atsScore || 0,
  });

  // Step 4: Compile PDF
  const { texPath, pdfPath, dockerUnavailable } = await compileToPdf(
    req.user._id.toString(),
    generated._id.toString(),
    latexContent
  );

  // Step 5: Save paths to DB record
  generated.texPath = texPath;
  generated.pdfPath = pdfPath || null;
  await generated.save();

  logger.info('resumeController: resume generated', { id: generated._id, atsScore: aiJson.atsScore, dockerUnavailable });

  res.status(200).json({
    resume: {
      _id:              generated._id,
      jobTitle:         generated.jobTitle,
      company:          generated.company,
      atsScore:         generated.atsScore,
      selectedProjects: generated.selectedProjects,
      injectedSkills:   generated.injectedSkills,
      createdAt:        generated.createdAt,
      hasPdf:           !!pdfPath,
      dockerUnavailable,
    },
  });
});

// ── Version History ──────────────────────────────────────────────────────────

/**
 * GET /api/resume/versions
 */
const getVersions = asyncHandler(async (req, res) => {
  const versions = await GeneratedResume.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-aiJson -texPath')
    .lean();

  res.status(200).json({ versions });
});

// ── PDF Download ─────────────────────────────────────────────────────────────

/**
 * GET /api/resume/download/:id
 * Streams the generated PDF file (or .tex if Docker was unavailable).
 */
const downloadResume = asyncHandler(async (req, res) => {
  const generated = await GeneratedResume.findOne({
    _id:    req.params.id,
    userId: req.user._id,
  }).lean();

  if (!generated) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  const base = (generated.company || 'resume').replace(/\s+/g, '_') + '_' +
               (generated.jobTitle || 'resume').replace(/\s+/g, '_');

  // Prefer PDF; fall back to .tex if Docker was not available
  if (generated.pdfPath && fs.existsSync(generated.pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${base}.pdf"`);
    return fs.createReadStream(generated.pdfPath).pipe(res);
  }

  if (generated.texPath && fs.existsSync(generated.texPath)) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${base}.tex"`);
    return fs.createReadStream(generated.texPath).pipe(res);
  }

  return res.status(404).json({ message: 'No file found on disk. Try regenerating.' });
});

module.exports = {
  getMasterResume,
  saveMasterResume,
  getGitHubAnalysis,
  analyzeGitHub,
  scrapeJobDescription,
  generateResume,
  getVersions,
  downloadResume,
};
