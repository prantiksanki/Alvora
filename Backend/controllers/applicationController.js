const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const EmailEvent = require('../models/EmailEvent');
const SyncHistory = require('../models/SyncHistory');
const asyncHandler = require('../utils/asyncHandler');
const { getCache, setCache, delCache } = require('../config/redis');

const invalidateStatsCache = (userId) =>
  Promise.all([
    delCache(`alvora:jobstats:${userId}`),
    delCache(`alvora:jobstats:detailed:${userId}`),
  ]);

/**
 * GET /api/applications
 * Paginated list with optional filters: status, company, startDate, endDate.
 */
const getApplications = asyncHandler(async (req, res) => {
  const { status, company, startDate, endDate, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = { userId: req.user._id };
  if (status) query.status = status;
  if (company) query.company = { $regex: new RegExp(company, 'i') };
  if (startDate || endDate) {
    query.appliedDate = {};
    if (startDate) query.appliedDate.$gte = new Date(startDate);
    if (endDate) query.appliedDate.$lte = new Date(endDate);
  }

  const [applications, total] = await Promise.all([
    JobApplication.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    JobApplication.countDocuments(query),
  ]);

  res.status(200).json({
    applications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/applications/stats
 * Aggregated counts: by status, applications per month, top 10 companies.
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const cacheKey = `alvora:jobstats:${req.user._id}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const [byStatus, byMonth, topCompanies] = await Promise.all([
    JobApplication.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    JobApplication.aggregate([
      { $match: { userId, appliedDate: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    JobApplication.aggregate([
      { $match: { userId } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const total = await JobApplication.countDocuments({ userId });

  const result = { total, byStatus, byMonth, topCompanies };
  await setCache(cacheKey, result, 600);
  res.status(200).json(result);
});

/**
 * GET /api/applications/:id
 * Single application with its full email event history.
 */
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await JobApplication.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const emailEvents = await EmailEvent.find({ applicationId: application._id })
    .sort({ receivedAt: 1 })
    .lean();

  res.status(200).json({ ...application, emailEvents });
});

/**
 * POST /api/applications
 * Manually create a job application (isManual: true).
 */
const createApplication = asyncHandler(async (req, res) => {
  const { company, role, status, appliedDate, notes, tags } = req.body;

  if (!company || !role) {
    return res.status(400).json({ message: 'company and role are required' });
  }

  const application = await JobApplication.create({
    userId: req.user._id,
    company: company.trim(),
    role: role.trim(),
    status: status || 'Applied',
    appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
    lastUpdated: new Date(),
    notes: notes || '',
    tags: tags || [],
    isManual: true,
    extractedBy: 'manual',
  });

  await invalidateStatsCache(req.user._id);
  res.status(201).json(application);
});

/**
 * PATCH /api/applications/:id
 * Update allowed fields on an existing application.
 */
const updateApplication = asyncHandler(async (req, res) => {
  const application = await JobApplication.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const ALLOWED_FIELDS = ['status', 'notes', 'tags', 'role', 'company', 'appliedDate'];
  for (const field of ALLOWED_FIELDS) {
    if (req.body[field] !== undefined) {
      application[field] = req.body[field];
    }
  }
  application.lastUpdated = new Date();
  await application.save();
  await invalidateStatsCache(req.user._id);

  res.status(200).json(application);
});

/**
 * DELETE /api/applications/:id
 * Hard-delete an application and its associated email events.
 */
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await JobApplication.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Clean up orphaned email events
  await EmailEvent.deleteMany({ applicationId: application._id });
  await invalidateStatsCache(req.user._id);

  res.status(200).json({ message: 'Application deleted' });
});

/**
 * GET /api/applications/detailed-stats
 * Advanced analytics: avg response time, stage conversion rates, velocity, ghost rate.
 */
const getDetailedStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const cacheKey = `alvora:jobstats:detailed:${req.user._id}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  const pct = (num, denom) => (denom > 0 ? Math.round((num / denom) * 100) : 0);

  const [responseTimeAgg, stageCounts, velocityAgg] = await Promise.all([
    // Average days from appliedDate to first qualifying email event
    JobApplication.aggregate([
      { $match: { userId, appliedDate: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'emailevents',
          localField: '_id',
          foreignField: 'applicationId',
          as: 'events',
        },
      },
      { $unwind: '$events' },
      {
        $match: {
          'events.detectedStatus': {
            $in: ['Interview_Scheduled', 'OA_Received', 'Rejected', 'Offer', 'Next_Round'],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          appliedDate: { $first: '$appliedDate' },
          firstEventDate: { $min: '$events.receivedAt' },
        },
      },
      {
        $project: {
          diffDays: {
            $divide: [{ $subtract: ['$firstEventDate', '$appliedDate'] }, 86400000],
          },
        },
      },
      { $match: { diffDays: { $gte: 0 } } },
      { $group: { _id: null, avg: { $avg: '$diffDays' } } },
    ]),

    // Status distribution for conversion rates
    JobApplication.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Applications per ISO week for the last 8 weeks
    JobApplication.aggregate([
      { $match: { userId, appliedDate: { $exists: true, $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { week: { $isoWeek: '$appliedDate' }, year: { $isoWeekYear: '$appliedDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]),
  ]);

  const countMap = Object.fromEntries(stageCounts.map((s) => [s._id, s.count]));
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);

  const result = {
    avgResponseTime: responseTimeAgg[0]?.avg != null ? Math.round(responseTimeAgg[0].avg) : null,
    stageConversion: {
      appliedToOA:       pct(countMap['OA_Received']          || 0, countMap['Applied'] || 0),
      oaToInterview:     pct(countMap['Interview_Scheduled']   || 0, countMap['OA_Received'] || 0),
      interviewToOffer:  pct(countMap['Offer']                 || 0, countMap['Interview_Scheduled'] || 0),
    },
    applicationVelocity: velocityAgg,
    ghostRate: pct(countMap['Ghosted'] || 0, total),
    total,
  };

  await setCache(cacheKey, result, 900);
  res.status(200).json(result);
});

module.exports = {
  getApplications,
  getStats,
  getDetailedStats,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
};
