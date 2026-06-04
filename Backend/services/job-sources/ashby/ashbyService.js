const axios = require('axios');
const { getCache, setCache } = require('../../../config/redis');
const logger = require('../../../utils/logger');
const crypto = require('crypto');

const ASHBY_BASE = 'https://api.ashbyhq.com/posting-api/job-board';
const CACHE_TTL = 120; // seconds

const makeHash = (...parts) =>
  crypto.createHash('sha256').update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 32);

const normalizeEmploymentType = (raw) => {
  const r = (raw || '').toLowerCase();
  if (r.includes('full')) return 'full_time';
  if (r.includes('part')) return 'part_time';
  if (r.includes('contract') || r.includes('freelance')) return 'contract';
  if (r.includes('intern')) return 'internship';
  return 'full_time';
};

/**
 * Fetch raw job postings from Ashby's public job board API.
 * Endpoint: POST https://api.ashbyhq.com/posting-api/job-board/{company}
 * Ashby also supports GET for some boards; we try GET first.
 */
const fetchJobs = async (companySlug) => {
  const cacheKey = `alvora:ashby:${companySlug}:jobs`;
  const cached = await getCache(cacheKey);
  if (cached) {
    logger.debug('Ashby cache hit', { companySlug });
    return cached;
  }

  const { data } = await axios.get(`${ASHBY_BASE}/${companySlug}`, {
    timeout: 10000,
    headers: { 'Accept': 'application/json' },
  });

  // Ashby returns { results: [...] } or { jobs: [...] } depending on version
  const jobs = data.results || data.jobs || [];
  await setCache(cacheKey, jobs, CACHE_TTL);
  return jobs;
};

/**
 * Normalize an Ashby job posting into the unified job format.
 */
const normalizeAshbyJob = (raw, companySlug) => {
  const location = raw.location || raw.locationName || null;
  const isRemote =
    raw.isRemote === true ||
    (location || '').toLowerCase().includes('remote') ||
    (raw.workplaceType || '').toLowerCase() === 'remote';

  const tags = [];
  if (raw.department?.name) tags.push(raw.department.name);
  if (raw.team?.name) tags.push(raw.team.name);

  return {
    company: companySlug.toLowerCase(),
    title: raw.title || raw.name || '',
    location,
    employmentType: normalizeEmploymentType(raw.employmentType || raw.type),
    remote: isRemote,
    source: 'ashby',
    externalJobId: (raw.id || raw.jobId || '').toString(),
    applyUrl: raw.applyUrl || raw.externalLink || null,
    description: raw.descriptionPlain || raw.description || null,
    postedAt: raw.publishedAt || raw.createdAt ? new Date(raw.publishedAt || raw.createdAt) : null,
    detectedAt: new Date(),
    tags,
    contentHash: makeHash(raw.title || raw.name, location, raw.descriptionPlain),
  };
};

const normalizeJobs = (rawJobs, companySlug) =>
  rawJobs.map((job) => normalizeAshbyJob(job, companySlug));

module.exports = { fetchJobs, normalizeJobs };
