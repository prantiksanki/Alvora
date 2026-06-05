const cron = require('node-cron');
const {
  getCompaniesByPriority,
  getActiveCompanies,
  PRIORITY_INTERVALS,
  getRegistryStats,
} = require('../config/companyRegistry');
const { getPriorityQueue } = require('../queues');
const logger = require('../utils/logger');

/**
 * Registry-driven monitor: enqueues sync jobs for all companies at a given
 * priority tier. Falls back to direct sync when Redis/BullMQ is unavailable.
 *
 * @param {'high'|'medium'|'low'} priority
 */
const runMonitorForPriority = async (priority) => {
  if (process.env.JOB_MONITOR_ENABLED !== 'true') return;

  const companies = getCompaniesByPriority(priority);
  if (companies.length === 0) return;

  logger.info(`Job monitor [${priority}]: syncing ${companies.length} companies`);

  if (process.env.REDIS_URL) {
    // Queue-based path (preferred)
    const queue = getPriorityQueue(priority);
    if (queue) {
      for (const company of companies) {
        // For Workday, companySlug is the display name (lowercase), identifier is the full tenant|wd|board string
        const companySlug = company.provider === 'workday'
          ? company.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
          : company.identifier;
        await queue.add(
          'monitor',
          {
            provider: company.provider,
            companySlug,
            companyName: company.name,
            identifier: company.identifier, // Workday needs this; others ignore it
          },
          {
            jobId: `${company.provider}-${company.name.toLowerCase().replace(/\s+/g, '-')}`,
          }
        ).catch((err) =>
          logger.error('Failed to enqueue company', { company: company.name, error: err.message })
        );
      }
      return;
    }
  }

  // Direct fallback — runs synchronously (no Redis required)
  const { runSync } = require('../services/job-monitor/monitoringEngine');
  for (const company of companies) {
    const companySlug = company.provider === 'workday'
      ? company.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : company.identifier;
    try {
      await runSync(company.provider, companySlug, company.identifier);
    } catch (err) {
      logger.error('Direct sync failed', { company: company.identifier, provider: company.provider, error: err.message });
    }
  }
};

const startJobMonitorJob = () => {
  if (process.env.JOB_MONITOR_ENABLED !== 'true') {
    logger.info('Job monitor disabled — set JOB_MONITOR_ENABLED=true to enable');
    return;
  }

  const hiMin  = PRIORITY_INTERVALS.high;
  const medMin = PRIORITY_INTERVALS.medium;
  const lowMin = PRIORITY_INTERVALS.low;

  const stats = getRegistryStats();
  const mode  = process.env.REDIS_URL ? 'queue' : 'direct';

  logger.info('Job monitor starting', {
    mode,
    totalCompanies: stats.active,
    byPriority: stats.byPriority,
    byProvider: stats.byProvider,
    intervals: { high: `${hiMin}min`, medium: `${medMin}min`, low: `${lowMin}min` },
  });

  // High priority — every N minutes (default 2)
  cron.schedule(`*/${hiMin} * * * *`, () => runMonitorForPriority('high'),   { timezone: 'UTC' });

  // Medium priority — every N minutes (default 5)
  cron.schedule(`*/${medMin} * * * *`, () => runMonitorForPriority('medium'), { timezone: 'UTC' });

  // Low priority — every N minutes (default 15)
  cron.schedule(`*/${lowMin} * * * *`, () => runMonitorForPriority('low'),    { timezone: 'UTC' });

  // Run high-priority immediately on startup so the DB has fresh data right away
  setImmediate(() => runMonitorForPriority('high').catch((err) =>
    logger.error('Startup high-priority sync failed', { error: err.message })
  ));
};

/**
 * Manually trigger a sync for all companies at a specific priority.
 * Useful for admin endpoints and testing.
 */
const triggerManualSync = (priority = 'high') => runMonitorForPriority(priority);

/**
 * Manually trigger a sync for a single company by identifier.
 */
const triggerCompanySync = async (provider, identifier) => {
  const { runSync } = require('../services/job-monitor/monitoringEngine');
  return runSync(provider, identifier);
};

module.exports = { startJobMonitorJob, triggerManualSync, triggerCompanySync };
