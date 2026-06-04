const UserSubscription = require('../../models/UserSubscription');
const { getCache, setCache, delCache } = require('../../config/redis');
const logger = require('../../utils/logger');

const CACHE_KEY = 'alvora:subscriptions:active-list';
const CACHE_TTL = 60; // seconds

/**
 * Return cached active subscription list, or fetch from DB and cache it.
 */
const getActiveSubscriptions = async () => {
  const cached = await getCache(CACHE_KEY);
  if (cached) return cached;

  const subs = await UserSubscription.find({ isActive: true })
    .select('userId companies roles locations')
    .lean();

  await setCache(CACHE_KEY, subs, CACHE_TTL);
  return subs;
};

/**
 * Invalidate the subscription cache — call this after any create/update/delete.
 */
const invalidateSubscriptionCache = async () => {
  await delCache(CACHE_KEY);
};

/**
 * Find all user IDs whose subscriptions match the given job posting.
 * Matching criteria (OR logic):
 *   - company array contains the job's company (exact lowercase match)
 *   - roles array has any keyword that appears in the job title (case-insensitive substring)
 *
 * V1: in-memory filtering — acceptable at launch scale.
 * TODO: optimize with a dedicated text index when subscription count grows > 5000.
 *
 * @param {object} job - Normalized job object (must have .company and .title)
 * @returns {Promise<string[]>} - Array of matched userId strings
 */
const findMatchedUserIds = async (job) => {
  try {
    const subs = await getActiveSubscriptions();
    const jobCompany = (job.company || '').toLowerCase();
    const jobTitle = (job.title || '').toLowerCase();

    return subs
      .filter((sub) => {
        const companyMatch = (sub.companies || []).some(
          (c) => c.toLowerCase() === jobCompany
        );
        const roleMatch = (sub.roles || []).some(
          (r) => jobTitle.includes(r.toLowerCase())
        );
        return companyMatch || roleMatch;
      })
      .map((sub) => sub.userId.toString());
  } catch (err) {
    logger.error('Subscription matching failed', { error: err.message, company: job.company });
    return [];
  }
};

module.exports = { findMatchedUserIds, invalidateSubscriptionCache };
