const axios = require('axios');

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

// LeetCode has no official public API — we use the community GraphQL endpoint.
// The Referer header is required; requests without it return 403.
const query = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      userCalendar {
        streak
        totalActiveDays
        submissionCalendar
      }
      profile {
        ranking
      }
    }
  }
`;

const fetchLeetcodeStats = async (username) => {
  const response = await axios.post(
    LEETCODE_GRAPHQL,
    { query, variables: { username } },
    {
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
      },
    }
  );

  const matchedUser = response.data?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error(`LeetCode user not found: ${username}`);
  }

  const acStats = matchedUser.submitStats?.acSubmissionNum || [];
  const allEntry = acStats.find((s) => s.difficulty === 'All');
  const easyEntry = acStats.find((s) => s.difficulty === 'Easy');
  const mediumEntry = acStats.find((s) => s.difficulty === 'Medium');
  const hardEntry = acStats.find((s) => s.difficulty === 'Hard');

  // submissionCalendar is a JSON string: '{"unixTs": count, ...}'
  let submissionCalendar = {};
  try {
    const raw = matchedUser.userCalendar?.submissionCalendar;
    if (raw) submissionCalendar = JSON.parse(raw);
  } catch (_) {}

  return {
    solvedCount: allEntry?.count || 0,
    easySolved: easyEntry?.count || 0,
    mediumSolved: mediumEntry?.count || 0,
    hardSolved: hardEntry?.count || 0,
    ranking: matchedUser.profile?.ranking || 0,
    streak: matchedUser.userCalendar?.streak || 0,
    totalActiveDays: matchedUser.userCalendar?.totalActiveDays || 0,
    submissionCalendar,
  };
};

module.exports = { fetchLeetcodeStats };
