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

  return {
    followers: user.followers,
    publicRepos: user.public_repos,
    stars,
    topLanguages,
    // Contribution data requires GitHub GraphQL API or scraping — placeholder for now
    contributions: 0,
  };
};

module.exports = { fetchGithubStats };
