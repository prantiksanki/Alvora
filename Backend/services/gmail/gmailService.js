const { google } = require('googleapis');
const { encrypt } = require('../../utils/encryption');
const { buildAuthenticatedClient, refreshAccessToken } = require('./gmailAuth');
const ConnectedEmail = require('../../models/ConnectedEmail');
const logger = require('../../utils/logger');

// Keywords used to filter Gmail inbox for job-related emails
const JOB_QUERY_KEYWORDS =
  'application OR interview OR offer OR rejected OR assessment OR ' +
  'opportunity OR hackerrank OR codility OR codesignal OR recruiting OR recruiter';

/**
 * Returns an authenticated Gmail API client, refreshing the access token
 * automatically if it is within 5 minutes of expiry.
 */
const getGmailClient = async (account) => {
  const fiveMinutes = 5 * 60 * 1000;
  const needsRefresh =
    account.tokenExpiry &&
    account.tokenExpiry.getTime() < Date.now() + fiveMinutes;

  if (needsRefresh && account.refreshToken) {
    try {
      const newCreds = await refreshAccessToken(account.refreshToken);
      const encryptedNew = encrypt(newCreds.access_token);
      await ConnectedEmail.findByIdAndUpdate(account._id, {
        accessToken: encryptedNew,
        tokenExpiry: new Date(newCreds.expiry_date),
      });
      // Mutate in-place so callers use the fresh token without re-querying
      account.accessToken = encryptedNew;
      account.tokenExpiry = new Date(newCreds.expiry_date);
    } catch (err) {
      logger.error('Token refresh failed — deactivating account', {
        accountId: account._id,
        error: err.message,
      });
      await ConnectedEmail.findByIdAndUpdate(account._id, { isActive: false });
      throw new Error('Gmail token refresh failed — account deactivated');
    }
  }

  return buildAuthenticatedClient(account.accessToken);
};

/**
 * Builds the Gmail search query.
 * Full sync: last 6 months.
 * Incremental sync: since lastSyncedAt (or last hour as fallback).
 */
// Full sync looks back 3 years; cap at 2000 most-recent matching emails
const FULL_SYNC_YEARS = 3;
const FULL_SYNC_MAX_MESSAGES = 2000;

const buildQuery = (syncType, lastSyncedAt) => {
  const base = `(${JOB_QUERY_KEYWORDS})`;
  if (syncType === 'full') {
    const threeYearsAgo = Math.floor(
      (Date.now() - FULL_SYNC_YEARS * 365 * 24 * 60 * 60 * 1000) / 1000
    );
    return `${base} after:${threeYearsAgo}`;
  }
  const since = Math.floor(
    ((lastSyncedAt ? lastSyncedAt.getTime() : Date.now() - 3_600_000)) / 1000
  );
  return `${base} after:${since}`;
};

/**
 * Fetches job-related emails from Gmail.
 * Full sync: last 3 years, capped at 2000 most-recent messages.
 * Incremental sync: since lastSyncedAt, no cap.
 * Uses 'metadata' format to avoid downloading full bodies (saves API quota).
 */
const fetchEmails = async (account, syncType = 'incremental') => {
  const auth = await getGmailClient(account);
  const gmail = google.gmail({ version: 'v1', auth });
  const query = buildQuery(syncType, account.lastSyncedAt);
  const maxMessages = syncType === 'full' ? FULL_SYNC_MAX_MESSAGES : Infinity;

  const messageIds = [];
  let pageToken = null;

  do {
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
      ...(pageToken && { pageToken }),
    });

    const batch = listRes.data.messages || [];
    messageIds.push(...batch);
    pageToken = listRes.data.nextPageToken || null;

    logger.debug('Gmail list page fetched', {
      syncType,
      pageFetched: batch.length,
      totalSoFar: messageIds.length,
      hasMore: !!pageToken,
    });
  } while (pageToken && messageIds.length < maxMessages);

  // Gmail returns newest-first, so slicing from the front gives the most recent
  const capped = messageIds.slice(0, maxMessages);
  if (messageIds.length > maxMessages) {
    logger.info(`Full sync capped at ${maxMessages} most-recent messages`, {
      totalFound: messageIds.length,
    });
  }

  if (capped.length === 0) return [];

  logger.info('Fetching metadata for matched messages', {
    syncType,
    totalMessages: capped.length,
  });

  // Gmail API quota: 250 units/user/minute. Each messages.get = 5 units.
  // Safe rate: ~40 requests/minute = ~1 every 1.5s.
  // Strategy: fetch in chunks of 10 with a 2.5s pause between chunks.
  // This gives ~240 requests/minute safely under the limit.
  const CHUNK_SIZE = 10;
  const CHUNK_DELAY_MS = 2500;
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 10000; // wait 10s on quota error before retrying

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchWithRetry = async (id, attempt = 0) => {
    try {
      const res = await gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });
      return res.data;
    } catch (err) {
      const isQuota = err.message?.toLowerCase().includes('quota') || err.code === 429;
      if (isQuota && attempt < MAX_RETRIES) {
        logger.debug('Quota hit — retrying after delay', { id, attempt, delayMs: RETRY_DELAY_MS });
        await sleep(RETRY_DELAY_MS);
        return fetchWithRetry(id, attempt + 1);
      }
      logger.warn('Failed to fetch email metadata', { id, error: err.message });
      return null;
    }
  };

  const allResults = [];

  for (let i = 0; i < capped.length; i += CHUNK_SIZE) {
    const chunk = capped.slice(i, i + CHUNK_SIZE);
    const chunkResults = await Promise.all(chunk.map(({ id }) => fetchWithRetry(id)));
    allResults.push(...chunkResults);

    // Pause between chunks unless it's the last one
    if (i + CHUNK_SIZE < capped.length) {
      logger.debug('Chunk complete — pausing to respect rate limit', {
        processed: Math.min(i + CHUNK_SIZE, capped.length),
        total: capped.length,
      });
      await sleep(CHUNK_DELAY_MS);
    }
  }

  return allResults.filter(Boolean);
};

/**
 * Recursively extract email content from a Gmail message payload.
 * Returns plain text when available; otherwise returns raw HTML so the
 * frontend can render it properly in a sandboxed iframe.
 */
const extractTextFromPayload = (payload) => {
  if (!payload) return '';

  // Prefer plain text
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf8');
  }

  // Return raw HTML — frontend renders it in a sandboxed iframe
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf8');
  }

  // Multipart — recurse, prefer plain text over HTML
  if (payload.parts && payload.parts.length > 0) {
    const plainPart = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (plainPart) return extractTextFromPayload(plainPart);

    const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
    if (htmlPart) return extractTextFromPayload(htmlPart);

    // Recurse into nested multipart (e.g. multipart/related inside multipart/mixed)
    for (const part of payload.parts) {
      const text = extractTextFromPayload(part);
      if (text) return text;
    }
  }

  return '';
};

/**
 * Fetch the full body of a single Gmail message by its message ID.
 * Requires a ConnectedEmail account document (for auth + token refresh).
 */
const fetchEmailBody = async (account, messageId) => {
  const auth = await getGmailClient(account);
  const gmail = google.gmail({ version: 'v1', auth });
  const msg = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });
  return extractTextFromPayload(msg.data.payload);
};

module.exports = { fetchEmails, fetchEmailBody };
