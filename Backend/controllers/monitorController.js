const asyncHandler = require('../utils/asyncHandler');
const JobPosting = require('../models/JobPosting');
const JobSyncHistory = require('../models/JobSyncHistory');
const {
  COMPANY_REGISTRY,
  getRegistryStats,
  getCompaniesByPriority,
  getCompaniesByCategory,
  getCompaniesByProvider,
  getActiveCompanies,
} = require('../config/companyRegistry');

/**
 * GET /api/monitor/registry
 * Full company registry with optional filtering.
 * Query params: priority, category, provider, search, page, limit
 */
const getRegistry = asyncHandler(async (req, res) => {
  const { priority, category, provider, search, page = 1, limit = 50 } = req.query;

  let companies = COMPANY_REGISTRY.filter((c) => c.active);

  if (priority) companies = companies.filter((c) => c.priority === priority);
  if (category) companies = companies.filter((c) => c.category === category);
  if (provider) companies = companies.filter((c) => c.provider === provider);
  if (search) {
    const q = search.toLowerCase();
    companies = companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.identifier.includes(q)
    );
  }

  const total = companies.length;
  const skip  = (Number(page) - 1) * Number(limit);
  const paged = companies.slice(skip, skip + Number(limit));

  res.status(200).json({
    companies: paged,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
    stats: getRegistryStats(),
  });
});

/**
 * GET /api/monitor/stats
 * Registry + DB stats: total companies, jobs by source, recent sync activity.
 */
const getMonitorStats = asyncHandler(async (req, res) => {
  const [
    registryStats,
    totalJobs,
    jobsBySource,
    recentSyncs,
    jobsLast24h,
  ] = await Promise.all([
    Promise.resolve(getRegistryStats()),
    JobPosting.countDocuments({ isActive: true }),
    JobPosting.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    JobSyncHistory.find()
      .sort({ syncStartedAt: -1 })
      .limit(20)
      .lean(),
    JobPosting.countDocuments({
      isActive: true,
      detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  const sourceMap = Object.fromEntries(jobsBySource.map((s) => [s._id, s.count]));

  res.status(200).json({
    registry: registryStats,
    jobs: {
      total: totalJobs,
      last24h: jobsLast24h,
      bySource: sourceMap,
    },
    recentSyncs,
    monitorEnabled: process.env.JOB_MONITOR_ENABLED === 'true',
    redisEnabled: !!process.env.REDIS_URL,
  });
});

/**
 * POST /api/monitor/sync
 * Manually trigger a sync for a specific company or priority tier.
 * Body: { provider?, identifier?, priority? }
 * At least one of identifier or priority must be provided.
 */
const triggerSync = asyncHandler(async (req, res) => {
  const { provider, identifier, priority } = req.body;

  const { triggerManualSync, triggerCompanySync } = require('../jobs/jobMonitorJob');

  if (identifier) {
    if (!provider) {
      return res.status(400).json({ message: 'provider is required when identifier is provided' });
    }
    const result = await triggerCompanySync(provider, identifier);
    return res.status(200).json({ message: 'Sync completed', result });
  }

  if (priority) {
    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'priority must be high, medium, or low' });
    }
    // Run async — don't block the response for a full priority-tier sync
    triggerManualSync(priority).catch(() => {});
    const count = getCompaniesByPriority(priority).length;
    return res.status(202).json({
      message: `Sync triggered for ${count} ${priority}-priority companies`,
      count,
    });
  }

  return res.status(400).json({ message: 'Provide either identifier+provider or priority' });
});

/**
 * GET /api/monitor/sync-history
 * Recent sync history with optional company/source filter.
 * Query params: companySlug, source, limit
 */
const getSyncHistory = asyncHandler(async (req, res) => {
  const { companySlug, source, limit = 50 } = req.query;

  const query = {};
  if (companySlug) query.companySlug = companySlug;
  if (source)      query.source = source;

  const history = await JobSyncHistory.find(query)
    .sort({ syncStartedAt: -1 })
    .limit(Number(limit))
    .lean();

  res.status(200).json({ history });
});

module.exports = { getRegistry, getMonitorStats, triggerSync, getSyncHistory };
