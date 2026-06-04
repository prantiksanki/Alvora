const helmet = require('helmet');
const cors = require('cors');

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const helmetOptions = {
  // Disable CSP for a pure API — not serving HTML
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
};

module.exports = {
  helmet: helmet(helmetOptions),
  cors: cors(corsOptions),
  // Hard limit on body size to prevent payload bombs
  jsonParser: require('express').json({ limit: '10kb' }),
};
