const { google } = require('googleapis');
const { encrypt, decrypt } = require('../../utils/encryption');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const createOAuth2Client = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

/**
 * Generate the Google consent URL. userId is encoded in state so the
 * callback route (which has no Bearer token) can identify the user.
 * prompt:'consent' is required to always receive a refresh_token.
 */
const generateAuthUrl = (userId) => {
  const client = createOAuth2Client();
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
};

/** Exchange the one-time authorization code for access + refresh tokens. */
const exchangeCodeForTokens = async (code) => {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens; // { access_token, refresh_token, expiry_date, token_type, scope }
};

/**
 * Use the stored (encrypted) refresh token to get a new access token.
 * Returns new credentials: { access_token, expiry_date }.
 */
const refreshAccessToken = async (encryptedRefreshToken) => {
  const client = createOAuth2Client();
  client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
};

/**
 * Build an authenticated OAuth2 client from an already-encrypted access token.
 * The token is decrypted here — callers never handle raw token strings.
 */
const buildAuthenticatedClient = (encryptedAccessToken) => {
  const client = createOAuth2Client();
  client.setCredentials({ access_token: decrypt(encryptedAccessToken) });
  return client;
};

/**
 * Build an authenticated OAuth2 client directly from a raw (unencrypted) token.
 * Used only during the initial OAuth callback before the token is persisted.
 */
const buildClientFromRawToken = (rawAccessToken) => {
  const client = createOAuth2Client();
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
