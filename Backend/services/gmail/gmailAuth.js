const { google } = require('googleapis');
const { encrypt, decrypt } = require('../../utils/encryption');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

/**
 * Determine the OAuth redirect URI.
 * Priority: GOOGLE_REDIRECT_URI env var → derived from request host.
 * Deriving from the request ensures it works on both localhost and production
 * without changing any env vars.
 */
const getRedirectUri = (req) => {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  // Derive from the incoming request: same host the user is on
  const protocol = req?.headers?.['x-forwarded-proto'] || req?.protocol || 'http';
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost:3000';
  return `${protocol}://${host}/api/emails/callback`;
};

const createOAuth2Client = (redirectUri) =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

/**
 * Generate the Google consent URL. userId is encoded in state so the
 * callback route (which has no Bearer token) can identify the user.
 * prompt:'consent' is required to always receive a refresh_token.
 */
const generateAuthUrl = (userId, req) => {
  const redirectUri = getRedirectUri(req);
  const client = createOAuth2Client(redirectUri);
  const state = Buffer.from(JSON.stringify({ userId, redirectUri })).toString('base64');
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
};

/** Exchange the one-time authorization code for access + refresh tokens. */
const exchangeCodeForTokens = async (code, redirectUri) => {
  const client = createOAuth2Client(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens; // { access_token, refresh_token, expiry_date, token_type, scope }
};

/**
 * Use the stored (encrypted) refresh token to get a new access token.
 * Returns new credentials: { access_token, expiry_date }.
 */
const refreshAccessToken = async (encryptedRefreshToken) => {
  // Token refresh doesn't need a specific redirect URI — use the env default
  const client = createOAuth2Client(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/emails/callback');
  client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
};

/**
 * Build an authenticated OAuth2 client from an already-encrypted access token.
 * The token is decrypted here — callers never handle raw token strings.
 */
const buildAuthenticatedClient = (encryptedAccessToken) => {
  const client = createOAuth2Client(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/emails/callback');
  client.setCredentials({ access_token: decrypt(encryptedAccessToken) });
  return client;
};

/**
 * Build an authenticated OAuth2 client directly from a raw (unencrypted) token.
 * Used only during the initial OAuth callback before the token is persisted.
 */
const buildClientFromRawToken = (rawAccessToken) => {
  const client = createOAuth2Client(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/emails/callback');
  client.setCredentials({ access_token: rawAccessToken });
  return client;
};

module.exports = {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  buildAuthenticatedClient,
  buildClientFromRawToken,
};
