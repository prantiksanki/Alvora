const axios = require('axios');

// ─── Helpers ────────────────────────────────────────────────────────────────

const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(n)));

const getActiveDays = (history, lastNDays = 30) => {
  const cutoff = new Date(Date.now() - lastNDays * 86400000);
  const days = new Set();
  for (const snap of history) {
    if (new Date(snap.date) >= cutoff)
      days.add(new Date(snap.date).toISOString().split('T')[0]);
  }
  return days.size;
};

const getSnap = (overview, platform) =>
  overview.find((s) => s.platform === platform) || null;

// ─── Scoring (unchanged) ─────────────────────────────────────────────────────

const calculateScores = (overview, history) => {
  const lc  = getSnap(overview, 'leetcode');
  const cf  = getSnap(overview, 'codeforces');
  const gh  = getSnap(overview, 'github');
  const gfg = getSnap(overview, 'gfg');
  const cc  = getSnap(overview, 'codechef');
  const at  = getSnap(overview, 'atcoder');

  const lcSolved    = lc?.solvedCount  || 0;
  const cfRating    = cf?.rating       || 0;
  const cfContests  = cf?.contestCount || 0;
  const gfgSolved   = gfg?.solvedCount || 0;
  const ccSolved    = cc?.solvedCount  || 0;
  const ghRepos     = gh?.extraData?.publicRepos || 0;
  const ghStars     = gh?.extraData?.stars       || 0;
  const ghFollowers = gh?.extraData?.followers   || 0;

  const activeDays = getActiveDays(history, 30);

  const totalSolved = lcSolved + gfgSolved + ccSolved;

  const dsaReadiness = clamp(
    (Math.min(totalSolved, 300) / 300) * 40 +
    (Math.min(cfRating, 2400)  / 2400) * 35 +
    (Math.min(cfContests, 50)  / 50)   * 15 +
    (Math.min(at?.contestCount || 0, 30) / 30) * 10
  );

  const repoScore = ghRepos >= 10 ? 20 : ghRepos * 2;
  const starScore = ghStars >= 50 ? 20 : ghStars * 0.4;
  const interviewReadiness = clamp(dsaReadiness * 0.6 + repoScore + starScore);

  const consistencyScore = clamp((activeDays / 30) * 100);

  const openSourceScore = clamp(
    Math.min(ghStars, 100) * 0.4 +
    Math.min(ghRepos, 30)  * 1.5 +
    Math.min(ghFollowers, 100) * 0.3
  );

  return { dsaReadiness, interviewReadiness, consistencyScore, openSourceScore };
};

// ─── Build prompt context ────────────────────────────────────────────────────

const buildStatsContext = (overview, history) => {
  const activeDays30 = getActiveDays(history, 30);
  const activeDays7  = getActiveDays(history, 7);

  const platform = (p) => {
    const s = getSnap(overview, p);
    if (!s) return `${p}: not connected`;
    const extra = s.extraData || {};
    switch (p) {
      case 'leetcode':
        return `LeetCode: ${s.solvedCount} solved (easy:${extra.easySolved||0} medium:${extra.mediumSolved||0} hard:${extra.hardSolved||0}), streak:${s.streak} days`;
      case 'codeforces':
        return `Codeforces: rating:${s.rating} (max:${extra.maxRating||s.rating}), rank:${extra.rank||'unrated'}, contests:${s.contestCount}`;
      case 'github':
        return `GitHub: ${extra.publicRepos||0} repos, ${extra.stars||0} stars, ${extra.followers||0} followers, top langs: ${Object.keys(extra.topLanguages||{}).slice(0,3).join('/')||'none'}`;
      case 'gfg':
        return `GeeksForGeeks: ${s.solvedCount} solved, score:${s.rating}, streak:${s.streak} days`;
      case 'codechef':
        return `CodeChef: ${s.solvedCount} solved, rating:${s.rating} (max:${extra.maxRating||s.rating}), contests:${s.contestCount}`;
      case 'atcoder':
        return `AtCoder: rating:${s.rating} (max:${extra.maxRating||s.rating}), contests:${s.contestCount}`;
      default:
        return `${p}: ${s.solvedCount} solved, rating:${s.rating}`;
    }
  };

  const lines = [
    `Activity: ${activeDays30} active days in last 30 days, ${activeDays7} in last 7 days`,
    platform('leetcode'),
    platform('codeforces'),
    platform('github'),
    platform('gfg'),
    platform('codechef'),
    platform('atcoder'),
  ];

  return lines.join('\n');
};

// ─── OpenRouter / Qwen call ──────────────────────────────────────────────────

const callQwen = async (overview, history) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const statsContext = buildStatsContext(overview, history);

  const systemPrompt = `You are an expert coding coach for a developer analytics platform called Alvora.
Analyze the user's coding stats across multiple platforms and return exactly 4-6 concise, actionable insights.

Rules:
- Be specific and data-driven — reference actual numbers from the stats
- Each insight must be genuinely useful, not generic
- Vary the categories: consistency, platform-specific tips, weaknesses, achievements
- Severity must be one of: "success", "info", "warning", "tip"
- Icon must be a single relevant emoji
- Keep each message under 120 characters

Return ONLY valid JSON in this exact format, nothing else:
{
  "insights": [
    { "category": "string", "message": "string", "severity": "success|info|warning|tip", "icon": "emoji" }
  ]
}`;

  const userPrompt = `Here are the user's current coding stats:\n\n${statsContext}\n\nGenerate 4-6 actionable insights based on these stats.`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'qwen/qwen3-235b-a22b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alvora.app',
        'X-Title': 'Alvora',
      },
      timeout: 30000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content || '';

  // Strip Qwen3 thinking tags and markdown code fences
  const jsonStr = content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
  const parsed = JSON.parse(jsonStr);

  if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
    throw new Error('Invalid insights format from LLM');
  }

  return parsed.insights;
};

// ─── Rule-based fallback ─────────────────────────────────────────────────────

const ruleBasedInsights = (overview, history) => {
  const activeDays = getActiveDays(history, 30);
  const insights   = [];

  // Consistency
  if (activeDays >= 20)
    insights.push({ category: 'Consistency', message: `Outstanding — ${activeDays} active days this month!`, severity: 'success', icon: '🔥' });
  else if (activeDays >= 10)
    insights.push({ category: 'Consistency', message: `${activeDays} active days. Aim for 20+ for better retention.`, severity: 'info', icon: '📅' });
  else
    insights.push({ category: 'Consistency', message: `Only ${activeDays} active days in the last month. A daily habit matters.`, severity: 'warning', icon: '⚠️' });

  // LeetCode
  const lc = getSnap(overview, 'leetcode');
  if (!lc)
    insights.push({ category: 'LeetCode', message: 'Connect your LeetCode profile to get personalized insights.', severity: 'tip', icon: '💡' });
  else if (lc.streak >= 14)
    insights.push({ category: 'LeetCode', message: `${lc.streak}-day LeetCode streak — keep it going!`, severity: 'success', icon: '🔥' });

  // Codeforces
  const cf = getSnap(overview, 'codeforces');
  if (!cf)
    insights.push({ category: 'Codeforces', message: 'Connect your Codeforces profile to track competitive programming.', severity: 'tip', icon: '🏆' });
  else if (cf.rating > 0) {
    const next = cf.rating < 1200 ? 1200 : cf.rating < 1400 ? 1400 : cf.rating < 1600 ? 1600 : cf.rating < 1900 ? 1900 : 2100;
    insights.push({ category: 'Codeforces', message: `Rating ${cf.rating} — ${next - cf.rating} points to next milestone (${next}).`, severity: 'info', icon: '🎯' });
  }

  return insights;
};

// ─── Main Export ─────────────────────────────────────────────────────────────

const generateInsights = async (overview, history) => {
  const scores = calculateScores(overview, history);

  try {
    const insights = await callQwen(overview, history);
    return { insights, scores };
  } catch (err) {
    // Fall back to rule-based if LLM fails or key not set
    const insights = ruleBasedInsights(overview, history);
    return { insights, scores };
  }
};

module.exports = { generateInsights };
