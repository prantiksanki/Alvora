const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}] ${stack || message}${metaStr}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
  }),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: combine(timestamp(), errors({ stack: true }), winston.format.json()),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: combine(timestamp(), winston.format.json()),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports,
  exitOnError: false,
});

// Morgan stream adapter — use info level (http level requires custom configuration)
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
