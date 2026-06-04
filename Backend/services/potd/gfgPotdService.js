const axios = require('axios');

const GFG_POTD_URL = 'https://practiceapi.geeksforgeeks.org/api/vr/problems-of-day/problem/today/';

/**
 * Fetch GeeksforGeeks Problem of the Day.
 * Uses GFG's public practice API.
 */
const fetchGfgPotd = async () => {
  const { data } = await axios.get(GFG_POTD_URL, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  if (!data || !data.problem_name) throw new Error('GFG POTD not found in response');

  // Normalise difficulty label
  const diffMap = { Easy: 'easy', Medium: 'medium', Hard: 'hard', Basic: 'easy', School: 'easy' };
  const diff = diffMap[data.difficulty] || data.difficulty?.toLowerCase() || 'medium';

  return {
    platform: 'gfg',
    date: data.date?.split(' ')[0] || new Date().toISOString().split('T')[0],
    title: data.problem_name,
    problemId: String(data.problem_id),
    difficulty: diff,
    url: data.problem_url,
    tags: data.tags?.topic_tags || [],
    accuracy: data.accuracy ? parseFloat(data.accuracy.toFixed(1)) : null,
  };
};

module.exports = { fetchGfgPotd };
