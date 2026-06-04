const { google } = require('googleapis');
const asyncHandler = require('../utils/asyncHandler');
const ConnectedEmail = require('../models/ConnectedEmail');
const JobApplication = require('../models/JobApplication');
const EmailEvent = require('../models/EmailEvent');
const { generateAuthUrl, exchangeCodeForTokens, buildClientFromRawToken } = require('../services/gmail/gmailAuth');
const { encrypt } = require('../utils/encryption');
const { getEmailSyncQueue } = require('../queues');
const { runSync } = require('../services/sync/syncService');
const { fetchEmailBody } = require('../services/gmail/gmailService');
const logger = require('../utils/logger');

/**
 * GET /api/emails/connect-gmail
 * Returns the Google OAuth consent URL. Frontend redirects the user to it.
 */
const connectGmail = asyncHandler(async (req, res) => {
  const authUrl = generateAuthUrl(req.user._id.toString());
  res.status(200).json({ authUrl });
});

/**
 * GET /api/emails/callback
 * OAuth redirect target — NO protect middleware. Google sends the browser here
 * after the user grants consent. The userId was embedded in the `state` param
 * during generateAuthUrl().
 */
const gmailCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    logger.warn('Gmail OAuth error from Google', { error });
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings/emails?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings/emails?error=missing_params`
    );
  }

  let userId;
  try {
    ({ userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8')));
  } catch {
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings/emails?error=invalid_state`
    );
  }

  const tokens = await exchangeCodeForTokens(code);

  if (!tokens.refresh_token) {
    logger.warn('No refresh_token received — user may have already authorized this app', { userId });
  }

  // Fetch the email address using the raw (not-yet-encrypted) access token
  const auth = buildClientFromRawToken(tokens.access_token);
  const gmail = google.gmail({ version: 'v1', auth });
  const profile = await gmail.users.getProfile({ userId: 'me' });
  const emailAddress = profile.data.emailAddress.toLowerCase();

  const updateData = {
    userId,
    provider: 'gmail',
    emailAddress,
    accessToken: encrypt(tokens.access_token),
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    isActive: true,
  };
  // Only overwrite refreshToken if Google returned one (it won't on re-authorization
  // without prompt:'consent', but we always set prompt:'consent' in generateAuthUrl)
  if (tokens.refresh_token) {
    updateData.refreshToken = encrypt(tokens.refresh_token);
  }

  await ConnectedEmail.findOneAndUpdate(
    { userId, emailAddress },
    updateData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const account = await ConnectedEmail.findOne({ userId, emailAddress });

  // Trigger initial full sync — via queue if available, otherwise fire-and-forget directly
  const queue = getEmailSyncQueue();
  if (queue) {
    await queue.add('full-sync', {
      emailAccountId: account._id.toString(),
      userId: userId.toString(),
      syncType: 'full',
    });
    logger.info('Full sync enqueued after Gmail connect', { emailAddress });
  } else {
    // No Redis — run in background without blocking the redirect
    runSync({ emailAccountId: account._id.toString(), userId: userId.toString(), syncType: 'full' })
      .then((r) => logger.info('Initial full sync completed', { emailAddress, ...r }))
      .catch((err) => logger.error('Initial full sync failed', { emailAddress, error: err.message }));
  }

  res.redirect(`${process.env.FRONTEND_URL}/job-tracker/emails?connected=true`);
});

/**
 * GET /api/emails
 * List the current user's connected email accounts.
 * Tokens are never included in the response.
 */
const getConnectedEmails = asyncHandler(async (req, res) => {
  const accounts = await ConnectedEmail.find({ userId: req.user._id, isActive: true })
    .select('-accessToken -refreshToken')
    .lean();
  res.status(200).json(accounts);
});

/**
 * DELETE /api/emails/:id
 * Remove a connected email account and cascade-delete all job applications
 * and email events that were sourced from it.
 */
const disconnectEmail = asyncHandler(async (req, res) => {
  const account = await ConnectedEmail.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!account) {
    return res.status(404).json({ message: 'Email account not found' });
  }

  // Find all applications linked to this email account
  const applications = await JobApplication.find({
    emailAccountId: account._id,
    userId: req.user._id,
  }).select('_id').lean();

  const applicationIds = applications.map((a) => a._id);

  // Cascade delete: email events → applications → connected account
  if (applicationIds.length > 0) {
    await EmailEvent.deleteMany({ applicationId: { $in: applicationIds } });
    await JobApplication.deleteMany({ _id: { $in: applicationIds } });
  }

  await ConnectedEmail.findByIdAndDelete(account._id);

  logger.info('Email account removed with cascade delete', {
    accountId: account._id,
    emailAddress: account.emailAddress,
    applicationsDeleted: applicationIds.length,
  });

  res.status(200).json({
    message: 'Email account removed',
    applicationsDeleted: applicationIds.length,
  });
});

/**
 * POST /api/emails/:id/sync
 * Manually trigger a sync for a connected account.
 * Uses full sync (6 months back) if never synced before, incremental otherwise.
 * Uses BullMQ queue when Redis is available; falls back to direct sync otherwise.
 */
const triggerSync = asyncHandler(async (req, res) => {
  const account = await ConnectedEmail.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true,
  });
  if (!account) {
    return res.status(404).json({ message: 'Email account not found or inactive' });
  }

  // Manual "Sync Now" always does a full sync (6 months back) so the user
  // sees all historical job emails. Incremental is only for the background cron.
  const syncType = 'full';

  const queue = getEmailSyncQueue();
  if (queue) {
    await queue.add('manual-sync', {
      emailAccountId: account._id.toString(),
      userId: req.user._id.toString(),
      syncType,
    });
    return res.status(200).json({ message: 'Sync started' });
  }

  // No Redis — run sync directly (blocks until complete, suitable for manual trigger)
  const result = await runSync({
    emailAccountId: account._id.toString(),
    userId: req.user._id.toString(),
    syncType,
  });

  res.status(200).json({
    message: 'Sync completed',
    emailsProcessed: result.emailsProcessed,
    newApplications: result.newApplications,
    updatedApplications: result.updatedApplications,
  });
});

/**
 * GET /api/emails/:accountId/message/:messageId
 * Fetch the full plain-text body of a Gmail message on demand.
 * Used by the frontend to expand email content in the timeline.
 */
const getEmailBody = asyncHandler(async (req, res) => {
  const { accountId, messageId } = req.params;
  const account = await ConnectedEmail.findOne({
    _id: accountId,
    userId: req.user._id,
    isActive: true,
  });
  if (!account) {
    return res.status(404).json({ message: 'Email account not found' });
  }
  const body = await fetchEmailBody(account, messageId);
  res.status(200).json({ body: body || '' });
});

module.exports = { connectGmail, gmailCallback, getConnectedEmails, disconnectEmail, triggerSync, getEmailBody };
