const axios = require('axios');

const extractInt = (html, key) => {
  // Stats are inside a Next.js streaming script with double-escaped JSON: \"key\":val
  const marker = '\\"' + key + '\\":';
  const idx = html.indexOf(marker);
  if (idx === -1) return 0;
  const rest = html.slice(idx + marker.length);
  const m = rest.match(/^-?\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

const fetchGfgStats = async (username) => {
  const { data: html } = await axios.get(
    `https://www.geeksforgeeks.org/user/${username}/`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 10000,
    }
  );

  if (!html.includes('total_problems_solved')) {
    throw new Error(`GFG: could not find stats for user "${username}" — profile may be private or username incorrect`);
  }

  return {
    solvedCount: extractInt(html, 'total_problems_solved'),
    score: extractInt(html, 'score'),
    streak: extractInt(html, 'pod_solved_current_streak'),
    longestStreak: extractInt(html, 'pod_solved_longest_streak'),
  };
};

module.exports = { fetchGfgStats };
