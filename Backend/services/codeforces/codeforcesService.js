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

  return {
    rating: userInfo.rating || 0,
    maxRating: userInfo.maxRating || 0,
    rank: userInfo.rank || 'unrated',
    contestCount: contests.length,
    solvedCount: solvedSet.size,
  };
};

module.exports = { fetchCodeforcesStats };
