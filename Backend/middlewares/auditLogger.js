const logger = require('../utils/logger');

/**
 * Middleware factory for auditing sensitive operations.
 * Usage: router.delete('/:id', protect, auditLogger('disconnect-email'), handler)
 *
 * Logs to Winston at INFO level with structured fields so audit entries
 * can be filtered with: logger.stream or external log aggregators.
 */
const auditLogger = (action) => (req, _res, next) => {
  logger.info('AUDIT', {
    action,
    userId: req.user?._id?.toString() || 'unauthenticated',
    ip: req.ip || req.socket?.remoteAddress,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
  next();
};

module.exports = auditLogger;
