const axios = require('axios');

const CF_BASE = 'https://codeforces.com/api';

const fetchCodeforcesStats = async (handle) => {
  const [infoRes, ratingRes, statusRes] = await Promise.all([
    axios.get(`${CF_BASE}/user.info?handles=${handle}`),
    axios.get(`${CF_BASE}/user.rating?handle=${handle}`),
    axios.get(`${CF_BASE}/user.status?handle=${handle}&from=1&count=10000`),
  ]);

  if (infoRes.data.status === 'FAILED') {
    throw new Error(`Codeforces user not found: ${handle}`);
  }

  const userInfo = infoRes.data.result[0];
  const contests = ratingRes.data.result || [];
  const submissions = statusRes.data.result || [];

  // Deduplicate accepted submissions by problem identifier
  const solvedSet = new Set();
  for (const sub of submissions) {
    if (sub.verdict === 'OK') {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      solvedSet.add(key);
    }
  }

  // Build per-day activity calendar from all accepted submissions
  const activityCalendar = {};
  for (const sub of submissions) {
    if (sub.verdict === 'OK' && sub.creationTimeSeconds) {
      const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
      activityCalendar[date] = (activityCalendar[date] || 0) + 1;
    }
  }

  return {
    rating: userInfo.rating || 0,
    maxRating: userInfo.maxRating || 0,
    rank: userInfo.rank || 'unrated',
    contestCount: contests.length,
    solvedCount: solvedSet.size,
    activityCalendar,
  };
};

module.exports = { fetchCodeforcesStats };
