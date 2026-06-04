const Snapshot = require('../../models/Snapshot');

const generateYearSummary = async (userId, year) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  const snapshots = await Snapshot.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 }).lean();

  if (snapshots.length === 0) {
    return { year, empty: true, message: `No data found for ${year}` };
  }

  // Group by platform
  const byPlatform = {};
  for (const snap of snapshots) {
    if (!byPlatform[snap.platform]) byPlatform[snap.platform] = [];
    byPlatform[snap.platform].push(snap);
  }

  const getFirst = (arr) => arr[0];
  const getLast = (arr) => arr[arr.length - 1];

  const lcSnaps = byPlatform['leetcode'] || [];
  const cfSnaps = byPlatform['codeforces'] || [];
  const ghSnaps = byPlatform['github'] || [];
  const gfgSnaps = byPlatform['gfg'] || [];

  // Use last known cumulative count per platform — delta would be 0 when only one snapshot exists
  const totalSolved =
    (getLast(lcSnaps)?.solvedCount || 0) +
    (getLast(cfSnaps)?.solvedCount || 0) +
    (getLast(gfgSnaps)?.solvedCount || 0);

  // Biggest streak
  const biggestStreak = Math.max(...snapshots.map((s) => s.streak || 0), 0);

  // Active days
  const activeDays = new Set(snapshots.map((s) => s.date.toISOString().split('T')[0])).size;

  // Most active month
  const monthCounts = {};
  for (const snap of snapshots) {
    const month = snap.date.getMonth();
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  }
  const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const mostActiveMonthName = mostActiveMonth ? MONTHS[mostActiveMonth[0]] : 'N/A';

  // Total contests
  const totalContests =
    (getLast(cfSnaps)?.contestCount || 0) - (getFirst(cfSnaps)?.contestCount || 0);

  // Rating growth
  const ratingGrowth = {
    codeforces: {
      start: getFirst(cfSnaps)?.rating || 0,
      end: getLast(cfSnaps)?.rating || 0,
      delta: (getLast(cfSnaps)?.rating || 0) - (getFirst(cfSnaps)?.rating || 0),
    },
    leetcode: {
      start: getFirst(lcSnaps)?.rating || 0,
      end: getLast(lcSnaps)?.rating || 0,
      delta: (getLast(lcSnaps)?.rating || 0) - (getFirst(lcSnaps)?.rating || 0),
    },
  };

  // GitHub growth
  const githubGrowth = {
    stars: { start: getFirst(ghSnaps)?.extraData?.stars || 0, end: getLast(ghSnaps)?.extraData?.stars || 0 },
    repos: { start: getFirst(ghSnaps)?.extraData?.publicRepos || 0, end: getLast(ghSnaps)?.extraData?.publicRepos || 0 },
    followers: { start: getFirst(ghSnaps)?.extraData?.followers || 0, end: getLast(ghSnaps)?.extraData?.followers || 0 },
  };

  // Top languages — stored as {lang: bytes} object, convert to sorted array of names
  const rawLangs = getLast(ghSnaps)?.extraData?.topLanguages || {};
  const topLanguages = Array.isArray(rawLangs)
    ? rawLangs
    : Object.entries(rawLangs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang);

  // Favorite quarter
  const quarterCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  for (const snap of snapshots) {
    const m = snap.date.getMonth();
    if (m < 3) quarterCounts.Q1++;
    else if (m < 6) quarterCounts.Q2++;
    else if (m < 9) quarterCounts.Q3++;
    else quarterCounts.Q4++;
  }
  const favoriteQuarter = Object.entries(quarterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Q1';

  return {
    year,
    totalSolved: Math.max(0, totalSolved),
    biggestStreak,
    activeDays,
    mostActiveMonth: mostActiveMonthName,
    totalContests: Math.max(0, totalContests),
    ratingGrowth,
    githubGrowth,
    topLanguages,
    favoriteQuarter,
  };
};

module.exports = { generateYearSummary };
