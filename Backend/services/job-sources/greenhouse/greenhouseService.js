const axios = require('axios');
const { getCache, setCache } = require('../../../config/redis');
const { normalizeGreenhouseJob } = require('../../normalization/jobNormalizer');
const logger = require('../../../utils/logger');

const GH_BASE = 'https://boards-api.greenhouse.io/v1/boards';
const CACHE_TTL = 90; // seconds — slightly less than the 2-minute poll interval

/**
 * Fetch raw job listings from the Greenhouse public boards API.
 * Returns the raw jobs array; lets HTTP errors propagate to the monitoring engine.
 */
const fetchJobs = async (companySlug) => {
  const cacheKey = `alvora:greenhouse:${companySlug}:jobs`;

  const cached = await getCache(cacheKey);
  if (cached) {
    logger.debug('Greenhouse cache hit', { companySlug });
    return cached;
  }

  const { data } = await axios.get(`${GH_BASE}/${companySlug}/jobs?content=true`, {
    timeout: 10000,
  });

  const jobs = data.jobs || [];
  await setCache(cacheKey, jobs, CACHE_TTL);
  return jobs;
};

/**
 * Normalize raw Greenhouse jobs into the unified job format.
 */
const normalizeJobs = (rawJobs, companySlug) =>
  rawJobs.map((job) => normalizeGreenhouseJob(job, companySlug));

module.exports = { fetchJobs, normalizeJobs };
