const UserSubscription = require('../models/UserSubscription');
const asyncHandler = require('../utils/asyncHandler');
const { invalidateSubscriptionCache } = require('../services/job-monitor/subscriptionMatcher');

/**
 * POST /api/subscriptions
 * Create or update the authenticated user's job subscription (upsert).
 * Companies are stored lowercase for consistent matching.
 */
const createOrUpdateSubscription = asyncHandler(async (req, res) => {
  const { companies, roles, locations, notificationPreferences } = req.body;

  const update = { updatedAt: new Date() };
  if (companies !== undefined) update.companies = companies.map((c) => c.toLowerCase());
  if (roles !== undefined) update.roles = roles;
  if (locations !== undefined) update.locations = locations;
  if (notificationPreferences !== undefined) update.notificationPreferences = notificationPreferences;

  const subscription = await UserSubscription.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { ...update, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await invalidateSubscriptionCache();

  res.status(200).json({ subscription });
});

/**
 * GET /api/subscriptions
 * Get the authenticated user's subscription document.
 */
const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await UserSubscription.findOne({ userId: req.user._id }).lean();

  if (!subscription) {
    return res.status(200).json({ subscription: null });
  }

  res.status(200).json({ subscription });
});

/**
 * PATCH /api/subscriptions
 * Update arrays or preferences on the existing subscription.
 * Replaces the entire array field with the new value (full replace, not append).
 */
const updateSubscription = asyncHandler(async (req, res) => {
  const { companies, roles, locations, notificationPreferences } = req.body;

  const update = { updatedAt: new Date() };
  if (companies !== undefined) update.companies = companies.map((c) => c.toLowerCase());
  if (roles !== undefined) update.roles = roles;
  if (locations !== undefined) update.locations = locations;
  if (notificationPreferences !== undefined) update.notificationPreferences = notificationPreferences;

  const subscription = await UserSubscription.findOneAndUpdate(
    { userId: req.user._id },
    { $set: update },
    { new: true }
  );

  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found. Use POST to create one.' });
  }

  await invalidateSubscriptionCache();

  res.status(200).json({ subscription });
});

/**
 * DELETE /api/subscriptions
 * Deactivate (soft-delete) the user's subscription.
 */
const deactivateSubscription = asyncHandler(async (req, res) => {
  const subscription = await UserSubscription.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { isActive: false, updatedAt: new Date() } },
    { new: true }
  );

  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  await invalidateSubscriptionCache();

  res.status(200).json({ message: 'Subscription deactivated' });
});

module.exports = {
  createOrUpdateSubscription,
  getSubscription,
  updateSubscription,
  deactivateSubscription,
};
