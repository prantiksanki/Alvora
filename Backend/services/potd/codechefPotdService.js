const axios = require('axios');

/**
 * CodeChef does not expose a clean public POTD API.
 * We use their problems list sorted by date to surface the most recent
 * "learning" / beginner-level daily problem, falling back to a curated
 * daily problem from their practice section.
 *
 * The URL pattern for CodeChef problems is:
 *   https://www.codechef.com/problems/{PROBLEM_CODE}
 */

const CC_PROBLEMS_URL = 'https://www.codechef.com/api/list/problems';

const fetchCodechefPotd = async () => {
  // Use CodeChef's school-category problems sorted by date — reliably accessible
  // Use beginner category problems — reliably accessible without auth
  const { data } = await axios.get(CC_PROBLEMS_URL, {
    params: { category: 'beginner', limit: 100 },
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://www.codechef.com',
    },
    timeout: 10000,
  });

  const problems = data?.data || [];
  if (problems.length === 0) throw new Error('CodeChef POTD not found in response');

  // Rotate daily so users see a different problem each day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getUTCFullYear(), 0, 0)) / 86400000
  );
  const problem = problems[dayOfYear % problems.length];

  const today = new Date().toISOString().split('T')[0];

  return {
    platform: 'codechef',
    date: today,
    title: problem.name || problem.code,
    problemId: problem.code,
    difficulty: 'easy',
    url: `https://www.codechef.com/problems/${problem.code}`,
    tags: [],
    accuracy: problem.successful_submissions && problem.total_submissions
      ? parseFloat(((Number(problem.successful_submissions) / Number(problem.total_submissions)) * 100).toFixed(1))
      : null,
  };
};

module.exports = { fetchCodechefPotd };
