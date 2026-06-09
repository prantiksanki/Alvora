const axios = require('axios');
const logger = require('../../utils/logger');

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

// ─── Scoring ─────────────────────────────────────────────────────────────────

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
  const cfSolved    = cf?.solvedCount || 0;
  const atSolved    = at?.solvedCount || 0;
  const totalSolved = lcSolved + gfgSolved + ccSolved + cfSolved + atSolved;

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

// ─── Build detailed prompt context from real coding profile data ──────────────

const buildStatsContext = (overview, history) => {
  const activeDays30 = getActiveDays(history, 30);
  const activeDays7  = getActiveDays(history, 7);
  const activeDays14 = getActiveDays(history, 14);

  const connectedPlatforms = overview.map((s) => s.platform);

  const platform = (p) => {
    const s = getSnap(overview, p);
    if (!s) return null;
    const extra = s.extraData || {};
    switch (p) {
      case 'leetcode':
        return [
          `LeetCode:`,
          `  - Total solved: ${s.solvedCount}`,
          `  - Easy: ${extra.easySolved || 0}, Medium: ${extra.mediumSolved || 0}, Hard: ${extra.hardSolved || 0}`,
          `  - Current streak: ${s.streak || 0} days`,
          `  - Ranking: ${extra.ranking || 'N/A'}`,
          `  - Acceptance rate: ${extra.acceptanceRate || 'N/A'}`,
        ].join('\n');

      case 'codeforces':
        return [
          `Codeforces:`,
          `  - Current rating: ${s.rating || 'unrated'}`,
          `  - Max rating: ${extra.maxRating || s.rating || 'N/A'}`,
          `  - Rank: ${extra.rank || 'unrated'}`,
          `  - Contests participated: ${s.contestCount || 0}`,
          `  - Problems solved: ${s.solvedCount || 0}`,
        ].join('\n');

      case 'github':
        return [
          `GitHub:`,
          `  - Public repositories: ${extra.publicRepos || 0}`,
          `  - Total stars: ${extra.stars || 0}`,
          `  - Followers: ${extra.followers || 0}`,
          `  - Following: ${extra.following || 0}`,
          `  - Total contributions: ${extra.totalContributions || 0}`,
          `  - Top languages: ${Object.keys(extra.topLanguages || {}).slice(0, 5).join(', ') || 'none'}`,
        ].join('\n');

      case 'gfg':
        return [
          `GeeksForGeeks:`,
          `  - Problems solved: ${s.solvedCount || 0}`,
          `  - Coding score: ${s.rating || 0}`,
          `  - Current streak: ${s.streak || 0} days`,
          `  - School: ${extra.school || 0}, Basic: ${extra.basic || 0}, Easy: ${extra.easy || 0}, Medium: ${extra.medium || 0}, Hard: ${extra.hard || 0}`,
        ].join('\n');

      case 'codechef':
        return [
          `CodeChef:`,
          `  - Problems solved: ${s.solvedCount || 0}`,
          `  - Current rating: ${s.rating || 0}`,
          `  - Max rating: ${extra.maxRating || s.rating || 0}`,
          `  - Stars: ${extra.stars || 'N/A'}`,
          `  - Contests participated: ${s.contestCount || 0}`,
        ].join('\n');

      case 'atcoder':
        return [
          `AtCoder:`,
          `  - Current rating: ${s.rating || 0}`,
          `  - Max rating: ${extra.maxRating || s.rating || 0}`,
          `  - Contests participated: ${s.contestCount || 0}`,
        ].join('\n');

      default:
        return `${p}: ${s.solvedCount || 0} solved, rating: ${s.rating || 0}`;
    }
  };

  const platformLines = ['leetcode', 'codeforces', 'github', 'gfg', 'codechef', 'atcoder']
    .map((p) => platform(p))
    .filter(Boolean);

  const scores = calculateScores(overview, history);

  const context = [
    `=== ACTIVITY SUMMARY ===`,
    `Connected platforms: ${connectedPlatforms.join(', ') || 'none'}`,
    `Active days (last 7 days): ${activeDays7}`,
    `Active days (last 14 days): ${activeDays14}`,
    `Active days (last 30 days): ${activeDays30}`,
    ``,
    `=== PLATFORM STATS (fetched live from coding profiles) ===`,
    ...platformLines,
    ``,
    `=== COMPUTED SCORES ===`,
    `DSA Readiness: ${scores.dsaReadiness}/100`,
    `Interview Readiness: ${scores.interviewReadiness}/100`,
    `Consistency Score: ${scores.consistencyScore}/100`,
    `Open Source Score: ${scores.openSourceScore}/100`,
  ].join('\n');

  return context;
};

// ─── OpenRouter / Gemini call ─────────────────────────────────────────────────

const callGemini = async (overview, history) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const statsContext = buildStatsContext(overview, history);

  logger.info('Calling Gemini via OpenRouter with stats context', {
    platforms: overview.map((s) => s.platform),
    contextLength: statsContext.length,
  });

  const systemPrompt = `You are an expert coding coach and career advisor for a developer analytics platform called Alvora.

You will receive REAL, LIVE data fetched directly from the user's coding profiles on LeetCode, Codeforces, GitHub, GeeksForGeeks, CodeChef, and AtCoder.

Your job is to analyze these real stats and generate 5-7 highly specific, actionable insights. Each insight MUST:
- Reference ACTUAL numbers from the provided stats (e.g., "You've solved 145 LeetCode problems...")
- Be specific to THIS user's data — never give generic advice that could apply to anyone
- Highlight strengths, weaknesses, and next concrete steps
- Be direct and motivating

Severity meanings:
- "success": celebrating a real achievement from their data
- "info": neutral observation or fact about their stats
- "warning": a gap or weakness that needs attention
- "tip": a specific actionable next step

Return ONLY valid JSON, no markdown, no explanation:
{
  "insights": [
    { "category": "string", "message": "string (max 130 chars)", "severity": "success|info|warning|tip", "icon": "single emoji" }
  ]
}`;

  const userPrompt = `Here is this user's REAL coding profile data, fetched live from their connected accounts:\n\n${statsContext}\n\nGenerate 5-7 personalized, data-driven insights for THIS specific user based on their actual numbers above.`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1200,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alvora.app',
        'X-Title': 'Alvora',
      },
      timeout: 45000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content || '';

  logger.info('Gemini raw response received', { contentLength: content.length });

  // Strip any markdown code fences or thinking tags
  const jsonStr = content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseErr) {
    logger.error('Failed to parse Gemini JSON response', { jsonStr, parseErr: parseErr.message });
    throw new Error(`JSON parse failed: ${parseErr.message}`);
  }

  if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
    throw new Error('Invalid insights format from LLM');
  }

  return parsed.insights;
};

// ─── Rule-based fallback ─────────────────────────────────────────────────────

const ruleBasedInsights = (overview, history) => {
  const activeDays = getActiveDays(history, 30);
  const insights   = [];

  if (activeDays >= 20)
    insights.push({ category: 'Consistency', message: `Outstanding — ${activeDays} active days this month!`, severity: 'success', icon: '🔥' });
  else if (activeDays >= 10)
    insights.push({ category: 'Consistency', message: `${activeDays} active days. Aim for 20+ for better retention.`, severity: 'info', icon: '📅' });
  else
    insights.push({ category: 'Consistency', message: `Only ${activeDays} active days in the last month. A daily habit matters.`, severity: 'warning', icon: '⚠️' });

  const lc = getSnap(overview, 'leetcode');
  if (!lc)
    insights.push({ category: 'LeetCode', message: 'Connect your LeetCode profile to get personalized insights.', severity: 'tip', icon: '💡' });
  else {
    const extra = lc.extraData || {};
    const total = lc.solvedCount || 0;
    const hard  = extra.hardSolved || 0;
    insights.push({ category: 'LeetCode', message: `${total} problems solved (${hard} Hard). ${hard < 10 ? 'Try more Hard problems to boost interview prep.' : 'Strong Hard problem count!'}`, severity: hard < 10 ? 'tip' : 'success', icon: hard < 10 ? '⬆️' : '💪' });
    if (lc.streak >= 7)
      insights.push({ category: 'LeetCode', message: `${lc.streak}-day streak — keep it going!`, severity: 'success', icon: '🔥' });
  }

  const cf = getSnap(overview, 'codeforces');
  if (cf && cf.rating > 0) {
    const next = cf.rating < 1200 ? 1200 : cf.rating < 1400 ? 1400 : cf.rating < 1600 ? 1600 : cf.rating < 1900 ? 1900 : 2100;
    insights.push({ category: 'Codeforces', message: `Rating ${cf.rating} — ${next - cf.rating} points to next milestone (${next}).`, severity: 'info', icon: '🎯' });
  }

  const gh = getSnap(overview, 'github');
  if (gh) {
    const repos = gh.extraData?.publicRepos || 0;
    const stars = gh.extraData?.stars || 0;
    insights.push({ category: 'GitHub', message: `${repos} public repos with ${stars} stars. ${stars === 0 ? 'Share your work to build visibility.' : 'Good open source presence!'}`, severity: stars === 0 ? 'tip' : 'info', icon: '⭐' });
  }

  return insights;
};

// ─── Main Export ─────────────────────────────────────────────────────────────

const generateInsights = async (overview, history) => {
  const scores = calculateScores(overview, history);

  logger.info('Generating insights', {
    platforms: overview.map((s) => s.platform),
    historyCount: history.length,
  });

  try {
    const insights = await callGemini(overview, history);
    logger.info('AI insights generated successfully via Gemini', { count: insights.length });
    return { insights, scores };
  } catch (err) {
    logger.error('Gemini insight generation failed, falling back to rule-based', {
      error: err.message,
      stack: err.stack,
    });
    const insights = ruleBasedInsights(overview, history);
    return { insights, scores };
  }
};

module.exports = { generateInsights };
