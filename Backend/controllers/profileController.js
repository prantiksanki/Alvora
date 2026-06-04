const PlatformProfile = require('../models/PlatformProfile');
const asyncHandler = require('../utils/asyncHandler');
const { runDirectSync, runUserSync } = require('../jobs/snapshotJobDirect');
const logger = require('../utils/logger');

// Accept either a plain username or a full profile URL — extract just the username
const extractUsername = (input) => {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http')) {
    const parts = trimmed.replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
  }
  return trimmed;
};

const getProfile = asyncHandler(async (req, res) => {
  const profile = await PlatformProfile.findOne({ userId: req.user._id });

  if (!profile) {
    return res.status(200).json({
      userId: req.user._id,
      leetcodeUsername: '',
      codeforcesUsername: '',
      githubUsername: '',
      gfgUsername: '',
    });
  }

  res.status(200).json(profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { leetcodeUsername, codeforcesUsername, githubUsername, gfgUsername, codechefUsername, atcoderUsername } = req.body;

  const profile = await PlatformProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
      leetcodeUsername: extractUsername(leetcodeUsername),
      codeforcesUsername: extractUsername(codeforcesUsername),
      githubUsername: extractUsername(githubUsername),
      gfgUsername: extractUsername(gfgUsername),
      codechefUsername: extractUsername(codechefUsername),
      atcoderUsername: extractUsername(atcoderUsername),
      updatedAt: Date.now(),
    },
    { new: true, upsert: true }
  );

  // Kick off a snapshot sync in the background so stats appear immediately
  runDirectSync().catch((err) => logger.warn('Post-save sync failed', { error: err.message }));

  res.status(200).json(profile);
});

const triggerSync = asyncHandler(async (req, res) => {
  // Sync only the current user's profiles — not all users
  const profile = await PlatformProfile.findOne({ userId: req.user._id });
  if (!profile) {
    return res.status(200).json({ message: 'No platform profile connected' });
  }
  runUserSync(profile).catch((err) =>
    logger.warn('Manual user sync failed', { userId: req.user._id, error: err.message })
  );
  res.status(200).json({ message: 'Sync started' });
});

module.exports = { getProfile, updateProfile, triggerSync };
