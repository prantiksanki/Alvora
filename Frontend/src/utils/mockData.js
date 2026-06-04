// ── OVERVIEW ─────────────────────────────────────────────────────────────────
export const MOCK_OVERVIEW = [
  {
    platform: 'leetcode',
    solvedCount: 347,
    rating: 1842,
    contestCount: 28,
    streak: 14,
    extraData: { easySolved: 142, mediumSolved: 178, hardSolved: 27, totalActiveDays: 189 },
    date: new Date().toISOString(),
  },
  {
    platform: 'codeforces',
    solvedCount: 214,
    rating: 1456,
    contestCount: 41,
    streak: 3,
    extraData: { maxRating: 1612, rank: 'specialist' },
    date: new Date().toISOString(),
  },
  {
    platform: 'github',
    solvedCount: 0,
    rating: 0,
    contestCount: 0,
    streak: 22,
    extraData: { followers: 48, publicRepos: 31, stars: 127, topLanguages: ['JavaScript', 'TypeScript', 'Python'] },
    date: new Date().toISOString(),
  },
  {
    platform: 'gfg',
    solvedCount: 124,
    rating: 892,
    contestCount: 7,
    streak: 5,
    extraData: {},
    date: new Date().toISOString(),
  },
];

// ── HISTORY (90 days × 4 platforms) ──────────────────────────────────────────
function generateHistory() {
  const snapshots = [];
  const start = new Date();
  start.setDate(start.getDate() - 89);

  const state = {
    leetcode: { solved: 280, rating: 1720 },
    codeforces: { solved: 168, rating: 1380 },
    github: { streak: 8 },
    gfg: { solved: 98, rating: 760 },
  };

  for (let day = 0; day < 90; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const dateStr = date.toISOString();

    // LeetCode
    state.leetcode.solved += Math.floor(Math.random() * 3);
    if (day % 7 === 0) state.leetcode.rating += Math.floor(Math.random() * 40) - 10;
    snapshots.push({
      platform: 'leetcode',
      solvedCount: state.leetcode.solved,
      rating: Math.max(1200, state.leetcode.rating),
      contestCount: Math.floor(day / 14),
      streak: Math.floor(Math.random() * 20) + 1,
      extraData: {
        easySolved: Math.floor(state.leetcode.solved * 0.41),
        mediumSolved: Math.floor(state.leetcode.solved * 0.51),
        hardSolved: Math.floor(state.leetcode.solved * 0.08),
        totalActiveDays: 100 + day,
      },
      date: dateStr,
    });

    // Codeforces
    state.codeforces.solved += Math.floor(Math.random() * 2);
    if (day % 10 === 0) state.codeforces.rating += Math.floor(Math.random() * 60) - 20;
    snapshots.push({
      platform: 'codeforces',
      solvedCount: state.codeforces.solved,
      rating: Math.max(1200, state.codeforces.rating),
      contestCount: Math.floor(day / 10),
      streak: Math.floor(Math.random() * 10),
      extraData: { maxRating: 1612, rank: 'specialist' },
      date: dateStr,
    });

    // GitHub
    state.github.streak = Math.max(0, Math.min(30, state.github.streak + (Math.random() > 0.15 ? 1 : -1)));
    snapshots.push({
      platform: 'github',
      solvedCount: 0,
      rating: 0,
      contestCount: 0,
      streak: state.github.streak,
      extraData: {
        followers: 30 + Math.floor(day * 0.2),
        publicRepos: 25 + Math.floor(day * 0.07),
        stars: 90 + Math.floor(day * 0.4),
        topLanguages: ['JavaScript', 'TypeScript', 'Python'],
      },
      date: dateStr,
    });

    // GFG
    state.gfg.solved += Math.random() > 0.4 ? 1 : 0;
    state.gfg.rating += Math.floor(Math.random() * 3);
    snapshots.push({
      platform: 'gfg',
      solvedCount: state.gfg.solved,
      rating: state.gfg.rating,
      contestCount: Math.floor(day / 20),
      streak: Math.floor(Math.random() * 8),
      extraData: {},
      date: dateStr,
    });
  }

  return snapshots;
}

export const MOCK_HISTORY = generateHistory();

// ── ACTIVITY FEED ─────────────────────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { id: '1', platform: 'leetcode', type: 'solved', description: 'Solved "Median of Two Sorted Arrays"', value: '+Hard', timestamp: new Date(Date.now() - 1.2 * 3600000).toISOString() },
  { id: '2', platform: 'github', type: 'commit', description: 'Pushed 3 commits to alvora-frontend', value: null, timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '3', platform: 'codeforces', type: 'contest', description: 'Participated in Codeforces Round 920', value: '+42', timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '4', platform: 'leetcode', type: 'solved', description: 'Solved "LRU Cache"', value: '+Medium', timestamp: new Date(Date.now() - 14 * 3600000).toISOString() },
  { id: '5', platform: 'gfg', type: 'solved', description: 'Solved 3 problems on GeeksForGeeks', value: null, timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: '6', platform: 'github', type: 'star', description: 'Received 5 new stars on portfolio-site', value: '⭐5', timestamp: new Date(Date.now() - 30 * 3600000).toISOString() },
  { id: '7', platform: 'codeforces', type: 'solved', description: 'Solved div.2 E "Graph Problem"', value: null, timestamp: new Date(Date.now() - 36 * 3600000).toISOString() },
  { id: '8', platform: 'leetcode', type: 'streak', description: '14-day streak milestone reached!', value: '🔥14', timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: '9', platform: 'github', type: 'commit', description: 'Opened PR: Add dark mode support', value: null, timestamp: new Date(Date.now() - 60 * 3600000).toISOString() },
  { id: '10', platform: 'leetcode', type: 'solved', description: 'Solved "Binary Tree Level Order Traversal"', value: '+Medium', timestamp: new Date(Date.now() - 72 * 3600000).toISOString() },
];

// ── GOALS ──────────────────────────────────────────────────────────────────────
export const MOCK_GOALS = [
  { id: 'g1', title: 'Reach 400 LeetCode Solved', platform: 'leetcode', current: 347, target: 400, unit: 'problems', deadline: '2025-03-01', status: 'active' },
  { id: 'g2', title: 'Hit Codeforces Expert (1600)', platform: 'codeforces', current: 1456, target: 1600, unit: 'rating', deadline: '2025-04-15', status: 'active' },
  { id: 'g3', title: 'Get 200 GitHub Stars', platform: 'github', current: 127, target: 200, unit: 'stars', deadline: '2025-06-01', status: 'active' },
  { id: 'g4', title: 'Solve 150 GFG Problems', platform: 'gfg', current: 124, target: 150, unit: 'problems', deadline: '2025-02-28', status: 'behind' },
  { id: 'g5', title: 'Complete 30-Day Streak', platform: 'github', current: 30, target: 30, unit: 'days', deadline: null, status: 'completed' },
  { id: 'g6', title: '50 LeetCode Hard Problems', platform: 'leetcode', current: 27, target: 50, unit: 'hard problems', deadline: '2025-05-01', status: 'active' },
];

// ── HEATMAP (365 days) ─────────────────────────────────────────────────────────
function generateHeatmap() {
  const data = [];
  const start = new Date();
  start.setDate(start.getDate() - 364);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const isActive = Math.random() > 0.35;
    data.push({
      date: d.toISOString().split('T')[0],
      count: isActive ? Math.floor(Math.random() * 12) + 1 : 0,
    });
  }
  return data;
}

export const MOCK_HEATMAP = generateHeatmap();
