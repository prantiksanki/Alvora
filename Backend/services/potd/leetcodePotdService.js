const axios = require('axios');

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const potdQuery = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        questionFrontendId
        title
        titleSlug
        difficulty
        topicTags { name }
        acRate
      }
    }
  }
`;

/**
 * Fetch LeetCode's Problem of the Day.
 * Returns a normalised DailyProblem-compatible object.
 */
const fetchLeetcodePotd = async () => {
  const { data } = await axios.post(
    LEETCODE_GRAPHQL,
    { query: potdQuery },
    {
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
      timeout: 10000,
    }
  );

  const q = data?.data?.activeDailyCodingChallengeQuestion;
  if (!q) throw new Error('LeetCode POTD not found in response');

  return {
    platform: 'leetcode',
    date: q.date,
    title: q.question.title,
    problemId: q.question.questionFrontendId,
    difficulty: q.question.difficulty.toLowerCase(),
    url: `https://leetcode.com${q.link}`,
    tags: q.question.topicTags.map((t) => t.name),
    accuracy: parseFloat(q.question.acRate.toFixed(1)),
  };
};

module.exports = { fetchLeetcodePotd };
