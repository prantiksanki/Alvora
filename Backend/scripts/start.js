/**
 * Production startup script.
 * Validates required environment variables before launching the server.
 */

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const RECOMMENDED_ENV = ['REDIS_URL', 'FRONTEND_URL', 'GITHUB_TOKEN'];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[startup] Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const warnings = RECOMMENDED_ENV.filter((k) => !process.env[k]);
if (warnings.length > 0) {
  console.warn(`[startup] Optional env vars not set (some features may be limited): ${warnings.join(', ')}`);
}

console.log('[startup] Environment validated — starting server...');
require('../index');
