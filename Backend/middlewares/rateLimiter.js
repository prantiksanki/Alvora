const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in test environment
    skip: () => process.env.NODE_ENV === 'test',
  });

// Auth endpoints: 10 requests per 15 minutes per IP
const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

// General API: 100 requests per minute per IP
const apiLimiter = createLimiter(
  60 * 1000,
  100,
  'Too many requests. Please slow down.'
);

// Expensive endpoints (AI insights regeneration): 5 per hour
const strictLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Rate limit exceeded for this operation. Try again in an hour.'
);

module.exports = { authLimiter, apiLimiter, strictLimiter };
