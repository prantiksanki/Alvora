const axios = require('axios');

const fetchAtcoderStats = async (username) => {
  const { data: history } = await axios.get(
    `https://atcoder.jp/users/${username}/history/json`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    }
  );

  if (!Array.isArray(history)) throw new Error(`AtCoder: unexpected response for ${username}`);

  const contestCount = history.length;
  const rating = contestCount > 0 ? history[contestCount - 1].NewRating : 0;
  const maxRating = contestCount > 0 ? Math.max(...history.map((h) => h.NewRating)) : 0;

  return { solvedCount: 0, rating, maxRating, contestCount };
};

module.exports = { fetchAtcoderStats };
