const axios = require('axios');

const fetchCodechefStats = async (username) => {
  const { data: html } = await axios.get(
    `https://www.codechef.com/users/${username}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
      timeout: 10000,
    }
  );

  // Parse the full Drupal.settings JSON embedded in the page
  const match = html.match(/jQuery\.extend\(Drupal\.settings,\s*(\{[\s\S]*?\})\s*\);/);
  if (!match) throw new Error(`CodeChef: could not find Drupal settings for ${username}`);

  let settings;
  try {
    settings = JSON.parse(match[1]);
  } catch {
    throw new Error(`CodeChef: failed to parse settings JSON for ${username}`);
  }

  const ratingArr = settings?.date_versus_rating?.all || [];
  const contestCount = ratingArr.length;
  const rating = contestCount > 0 ? parseInt(ratingArr[contestCount - 1].rating, 10) : 0;
  const maxRating = contestCount > 0 ? Math.max(...ratingArr.map((r) => parseInt(r.rating, 10))) : 0;

  // Solved count appears as "Problems Solved" followed by a number in the page
  const solvedMatch = html.match(/Problems Solved[^0-9]*(\d+)/i);
  const solvedCount = solvedMatch ? parseInt(solvedMatch[1], 10) : 0;

  return { solvedCount, rating, maxRating, contestCount };
};

module.exports = { fetchCodechefStats };
