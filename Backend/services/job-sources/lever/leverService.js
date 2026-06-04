const axios = require('axios');
const { getCache, setCache } = require('../../../config/redis');
const { normalizeLeverJob } = require('../../normalization/jobNormalizer');
const logger = require('../../../utils/logger');

const LV_BASE = 'https://api.lever.co/v0/postings';
const CACHE_TTL = 150; // seconds — slightly less than the 3-minute poll interval

/**
 * Fetch raw job postings from the Lever public postings API.
 * Lever returns an array directly (unlike Greenhouse which wraps in { jobs: [] }).
 * Lets HTTP errors propagate to the monitoring engine.
 */
const fetchJobs = async (companySlug) => {
  const cacheKey = `alvora:lever:${companySlug}:jobs`;

  const cached = await getCache(cacheKey);
  if (cached) {
    logger.debug('Lever cache hit', { companySlug });
    return cached;
  }

  const { data } = await axios.get(`${LV_BASE}/${companySlug}?mode=json`, {
    timeout: 10000,
  });

  const jobs = data || [];
  await setCache(cacheKey, jobs, CACHE_TTL);
  return jobs;
};

/**
 * Normalize raw Lever postings into the unified job format.
 */
const normalizeJobs = (rawJobs, companySlug) =>
  rawJobs.map((job) => normalizeLeverJob(job, companySlug));

module.exports = { fetchJobs, normalizeJobs };
