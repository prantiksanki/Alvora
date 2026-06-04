const { EventEmitter } = require('events');

class JobEventBus extends EventEmitter {}

// Singleton — shared across the entire process
const jobEventBus = new JobEventBus();

// Raise the default limit to accommodate multiple listeners (workers + future consumers)
jobEventBus.setMaxListeners(20);

/**
 * Events emitted:
 *   'new-job-detected'  { job: JobPosting, matchedUserIds: string[] }
 *   'job-updated'       { job: JobPosting }
 */

module.exports = jobEventBus;
