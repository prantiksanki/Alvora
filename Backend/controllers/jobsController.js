const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const asyncHandler = require('../utils/asyncHandler');
const { getCache, setCache } = require('../config/redis');

const JOB_LIST_CACHE_TTL = parseInt(process.env.JOB_CACHE_TTL || '300', 10);

/**
 * GET /api/jobs
 * Paginated job listing with optional filters: company, source, employmentType, remote, search.
 */
// Regex patterns that match location strings for each region value
const REGION_PATTERNS = {
  us:     /san francisco|new york|nyc|seattle|austin|chicago|boston|los angeles|denver|atlanta|washington|california|texas|georgia|indiana|illinois|virginia|massachusetts|\bca\b|\bny\b|\btx\b|\bwa\b|\bil\b|united states|\bus\b|sf,|nyc,/i,
  india:  /india|bengaluru|bangalore|hyderabad|mumbai|pune|chennai|delhi|noida|gurugram|gurgaon|kolkata|\bin-/i,
  remote: /remote/i,
  uk:     /united kingdom|london|manchester|edinburgh|birmingham|\buk\b/i,
  canada: /canada|toronto|vancouver|montreal|ottawa|calgary/i,
  europe: /europe|germany|france|spain|netherlands|amsterdam|berlin|paris|madrid|stockholm|zurich|dublin|warsaw|prague|copenhagen/i,
  apac:   /singapore|australia|japan|sydney|melbourne|tokyo|hong kong|korea|seoul|beijing|shanghai|taipei|bangkok|kuala lumpur/i,
};

const getJobs = asyncHandler(async (req, res) => {
  const {
    company,
    source,
    employmentType,
    remote,
    region,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const query = { isActive: true };
  if (company) query.company = { $regex: new RegExp(company, 'i') };
  if (source) query.source = source;
  if (employmentType) query.employmentType = employmentType;
  if (remote === 'true') query.remote = true;
  if (remote === 'false') query.remote = false;
  if (region && REGION_PATTERNS[region]) query.location = { $regex: REGION_PATTERNS[region] };
  if (search) query.title = { $regex: new RegExp(search, 'i') };

  // Cache based on query fingerprint
  const cacheKey = `alvora:jobs:list:${JSON.stringify({ company, source, employmentType, remote, region, search, page, limit })}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  const [jobs, total] = await Promise.all([
    JobPosting.find(query)
      .sort({ detectedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    JobPosting.countDocuments(query),
  ]);

  const response = {
    jobs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };

  await setCache(cacheKey, response, JOB_LIST_CACHE_TTL);
  res.status(200).json(response);
});

/**
 * GET /api/jobs/applied-ids
 * Returns the set of JobPosting _ids the authenticated user has already applied to,
 * matched by looking up their JobApplications by company+role against active JobPostings.
 * This is the authoritative source — localStorage is only an optimistic cache.
 * NOTE: must be declared before /:id to avoid Express treating "applied-ids" as a MongoId.
 */
const getAppliedJobIds = asyncHandler(async (req, res) => {
  // Fetch all applications for this user that came from the job board (tagged with a source)
  const applications = await JobApplication.find({
    userId: req.user._id,
    tags: { $in: ['greenhouse', 'lever', 'ashby', 'company_api'] },
  })
    .select('company role tags')
    .lean();

  if (applications.length === 0) {
    return res.status(200).json({ appliedJobIds: [] });
  }

  // Build queries to match JobPostings by company+title for each application
  const orClauses = applications.map((app) => ({
    company: app.company.toLowerCase(),
    title: app.role,
  }));

  const matchedPostings = await JobPosting.find({ $or: orClauses })
    .select('_id')
    .lean();

  const appliedJobIds = matchedPostings.map((p) => p._id.toString());
  res.status(200).json({ appliedJobIds });
});

/**
 * GET /api/jobs/live
 * Jobs detected in the last 24 hours, sorted by detectedAt desc.
 * NOTE: This route must be registered BEFORE /:id to prevent Express
 * treating "live" as a MongoDB ObjectId.
 */
const getLiveJobs = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const jobs = await JobPosting.find({
    isActive: true,
    detectedAt: { $gte: since },
  })
    .sort({ detectedAt: -1 })
    .limit(50)
    .lean();

  res.status(200).json({ jobs, count: jobs.length });
});

/**
 * GET /api/jobs/:id
 * Fetch a single job posting by MongoDB ID.
 */
const getJobById = asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id).lean();

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  res.status(200).json({ job });
});

/**
 * POST /api/jobs/:id/apply
 * Mark the authenticated user as having applied to a job.
 * Creates a JobApplication record linked to the posting data.
 * Idempotent — returns existing record if already applied.
 */
const applyToJob = asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.id).lean();

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  // Dedup: one application per user per company+role combination
  const existing = await JobApplication.findOne({
    userId: req.user._id,
    company: job.company,
    role: job.title,
  });

  if (existing) {
    return res.status(200).json({ message: 'Already applied', application: existing });
  }

  const application = await JobApplication.create({
    userId: req.user._id,
    company: job.company.charAt(0).toUpperCase() + job.company.slice(1),
    role: job.title,
    status: 'Applied',
    appliedDate: new Date(),
    isManual: false,
    extractedBy: 'manual',
    tags: [job.source],
    notes: job.applyUrl ? `Apply URL: ${job.applyUrl}` : '',
  });

  res.status(201).json({ message: 'Application recorded', application });
});

module.exports = { getJobs, getAppliedJobIds, getLiveJobs, getJobById, applyToJob };
