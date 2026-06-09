const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getMasterResume,
  saveMasterResume,
  getGitHubAnalysis,
  analyzeGitHub,
  scrapeJobDescription,
  generateResume,
  getVersions,
  downloadResume,
} = require('../controllers/resumeController');

const router = express.Router();

router.use(protect);

router.get('/master',           getMasterResume);
router.post('/master',          saveMasterResume);
router.get('/github-analysis',  getGitHubAnalysis);
router.post('/analyze-github',  analyzeGitHub);
router.post('/scrape-job',      scrapeJobDescription);
router.post('/generate',        generateResume);
router.get('/versions',         getVersions);
router.get('/download/:id',     downloadResume);

module.exports = router;
