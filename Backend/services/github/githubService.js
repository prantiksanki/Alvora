const axios = require('axios');

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    }),
  },
});

const fetchGithubStats = async (username) => {
  const [userRes, reposRes] = await Promise.all([
    githubClient.get(`/users/${username}`),
    githubClient.get(`/users/${username}/repos?per_page=100&sort=pushed`),
  ]);

  const user = userRes.data;
  const repos = reposRes.data;

  // Aggregate language bytes across the 5 most-recently-pushed repos
  // to avoid burning the rate limit with per-repo language calls
  const topRepos = repos.slice(0, 5).filter((r) => !r.fork);
  const languageRequests = topRepos.map((r) =>
    githubClient.get(`/repos/${username}/${r.name}/languages`).catch(() => ({ data: {} }))
  );
  const languageResults = await Promise.all(languageRequests);

  const topLanguages = {};
  for (const result of languageResults) {
    for (const [lang, bytes] of Object.entries(result.data)) {
      topLanguages[lang] = (topLanguages[lang] || 0) + bytes;
    }
  }

  const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  // Fetch contribution calendar via GitHub GraphQL API (requires GITHUB_TOKEN)
  let activityCalendar = {};
  if (process.env.GITHUB_TOKEN) {
    try {
      const gqlQuery = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;
      const gqlRes = await axios.post(
        'https://api.github.com/graphql',
        { query: gqlQuery, variables: { username } },
        {
          headers: {
            Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const weeks = gqlRes.data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          if (day.contributionCount > 0) {
            activityCalendar[day.date] = day.contributionCount;
          }
        }
      }
    } catch (_) {}
  }

  return {
    followers: user.followers,
    publicRepos: user.public_repos,
    stars,
    topLanguages,
    contributions: Object.values(activityCalendar).reduce((s, c) => s + c, 0),
    activityCalendar,
  };
};

module.exports = { fetchGithubStats };
