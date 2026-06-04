const axios = require('axios');
const logger = require('../../utils/logger');

const LC_GRAPHQL = 'https://leetcode.com/graphql';

const UPCOMING_CONTESTS_QUERY = `
  query {
    topTwoContests {
      title
      titleSlug
      startTime
      duration
      originStartTime
    }
  }
`;

const fetchUpcomingContests = async () => {
  try {
    const res = await axios.post(
      LC_GRAPHQL,
      { query: UPCOMING_CONTESTS_QUERY },
      { headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' } }
    );

    const contests = res.data?.data?.topTwoContests || [];
    return contests.map((c, i) => ({
      contestId: c.titleSlug || `lc-${c.startTime}`,
      name: c.title,
      startTime: new Date((c.startTime || c.originStartTime) * 1000),
      duration: c.duration,
      url: `https://leetcode.com/contest/${c.titleSlug}`,
      status: 'upcoming',
    }));
  } catch (err) {
    logger.warn('LeetCode contest fetch failed', { error: err.message });
    return [];
  }
};

module.exports = { fetchUpcomingContests };
