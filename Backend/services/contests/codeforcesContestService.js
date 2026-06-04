const axios = require('axios');
const logger = require('../../utils/logger');

const CF_API = 'https://codeforces.com/api';

const fetchUpcomingContests = async () => {
  const res = await axios.get(`${CF_API}/contest.list?gym=false`);
  if (res.data.status !== 'OK') throw new Error('Codeforces API error');

  const now = Date.now();
  return res.data.result
    .filter((c) => c.phase === 'BEFORE')
    .slice(0, 10)
    .map((c) => ({
      contestId: String(c.id),
      name: c.name,
      startTime: new Date(c.startTimeSeconds * 1000),
      duration: c.durationSeconds,
      url: `https://codeforces.com/contests/${c.id}`,
      status: 'upcoming',
    }));
};

const fetchRunningContests = async () => {
  const res = await axios.get(`${CF_API}/contest.list?gym=false`);
  if (res.data.status !== 'OK') return [];
  return res.data.result
    .filter((c) => c.phase === 'CODING')
    .map((c) => ({
      contestId: String(c.id),
      name: c.name,
      startTime: new Date(c.startTimeSeconds * 1000),
      duration: c.durationSeconds,
      url: `https://codeforces.com/contests/${c.id}`,
      status: 'running',
    }));
};

module.exports = { fetchUpcomingContests, fetchRunningContests };
