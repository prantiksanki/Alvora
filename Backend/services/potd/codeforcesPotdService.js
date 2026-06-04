const axios = require('axios');

/**
 * Codeforces does not have an official POTD.
 * We surface a "Featured Problem" — a high-quality, recently-added problem
 * from the Codeforces problem set, rotating daily based on the current date.
 * This ensures a different problem every day with a direct link.
 */

const CF_PROBLEMSET_URL = 'https://codeforces.com/api/problemset.problems';

// Difficulty range: Div2-friendly (800–1600 rating)
const MIN_RATING = 800;
const MAX_RATING = 1800;

const fetchCodeforcesPotd = async () => {
  const { data } = await axios.get(CF_PROBLEMSET_URL, { timeout: 12000 });

  if (data.status !== 'OK') throw new Error('Codeforces API error');

  const problems = (data.result?.problems || []).filter(
    (p) => p.rating && p.rating >= MIN_RATING && p.rating <= MAX_RATING && p.contestId
  );

  if (problems.length === 0) throw new Error('No suitable Codeforces problems found');

  // Deterministic daily rotation: pick index based on UTC day-of-year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getUTCFullYear(), 0, 0)) / 86400000
  );
  const problem = problems[dayOfYear % problems.length];

  const today = new Date().toISOString().split('T')[0];
  const cfUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;

  const diffMap = { 800: 'easy', 900: 'easy', 1000: 'easy', 1100: 'easy', 1200: 'easy', 1300: 'medium', 1400: 'medium', 1500: 'medium', 1600: 'medium', 1700: 'hard', 1800: 'hard' };

  return {
    platform: 'codeforces',
    date: today,
    title: problem.name,
    problemId: `${problem.contestId}${problem.index}`,
    difficulty: diffMap[problem.rating] || 'medium',
    rating: problem.rating,
    url: cfUrl,
    tags: problem.tags || [],
    accuracy: null,
  };
};

module.exports = { fetchCodeforcesPotd };
