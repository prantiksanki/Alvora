const { emitToUser } = require('../../socket/index');

/**
 * Emit a new-job-detected event to a specific user's Socket.IO room.
 * No-ops if the socket layer is unavailable (graceful degradation inherited from emitToUser).
 */
const emitNewJob = (userId, job) => {
  emitToUser(userId.toString(), 'new-job-detected', { job, timestamp: new Date() });
};

/**
 * Emit a job-updated event to a specific user's Socket.IO room.
 */
const emitJobUpdate = (userId, job) => {
  emitToUser(userId.toString(), 'job-updated', { job, timestamp: new Date() });
};

module.exports = { emitNewJob, emitJobUpdate };
