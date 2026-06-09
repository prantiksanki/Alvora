const axios = require('axios');
const GitHubAnalysis = require('../../models/GitHubAnalysis');
const logger = require('../../utils/logger');

const GH_API = 'https://api.github.com';
const MAX_REPOS = 10;

const ghHeaders = () => {
  const h = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
};

const safeGet = async (url) => {
  try {
    const { data } = await axios.get(url, { headers: ghHeaders(), timeout: 10000 });
    return data;
  } catch {
    return null;
  }
};

// Detect tech stack from file contents + README
const detectTechStack = (readme = '', pkgJson = null, reqTxt = null, dockerfile = null) => {
  const text = [readme, JSON.stringify(pkgJson || ''), reqTxt || '', dockerfile || ''].join(' ').toLowerCase();
  const checks = {
    // Frontend
    'React': /\breact\b/, 'Next.js': /next\.js|nextjs/, 'Vue': /\bvue\b/, 'Angular': /\bangular\b/,
    'Svelte': /\bsvelte\b/, 'Tailwind': /tailwindcss/, 'TypeScript': /typescript/,
    // Backend
    'Node.js': /node\.js|nodejs|express/, 'Express': /\bexpress\b/, 'FastAPI': /fastapi/,
    'Django': /\bdjango\b/, 'Flask': /\bflask\b/, 'Spring Boot': /spring.boot/,
    'NestJS': /nestjs/, 'GraphQL': /graphql/,
    // Databases
    'MongoDB': /mongodb|mongoose/, 'PostgreSQL': /postgres|pg\b/, 'MySQL': /\bmysql\b/,
    'Redis': /\bredis\b/, 'Supabase': /supabase/, 'Firebase': /firebase/,
    'Prisma': /\bprisma\b/, 'SQLite': /sqlite/,
    // AI/ML
    'PyTorch': /pytorch|torch/, 'TensorFlow': /tensorflow/, 'scikit-learn': /sklearn|scikit/,
    'OpenAI': /openai/, 'LangChain': /langchain/, 'Hugging Face': /transformers|hugging/,
    'Pandas': /\bpandas\b/, 'NumPy': /\bnumpy\b/,
    // DevOps/Infra
    'Docker': /\bdocker\b/, 'Kubernetes': /kubernetes|k8s/, 'AWS': /\baws\b|amazon web/,
    'GCP': /google cloud|gcp/, 'Azure': /\bazure\b/, 'GitHub Actions': /github.actions/,
    'Vercel': /\bvercel\b/, 'Nginx': /\bnginx\b/,
    // Languages (from README/deps)
    'Python': /\bpython\b/, 'Go': /\bgolang\b|\bgo\b/, 'Rust': /\brust\b/,
    'Java': /\bjava\b/, 'C++': /c\+\+|cpp/, 'Solidity': /solidity/,
  };
  return Object.entries(checks)
    .filter(([, re]) => re.test(text))
    .map(([tech]) => tech);
};

const categorizeRepo = (techStack, topics = [], readme = '') => {
  const all = [...techStack, ...topics, readme].join(' ').toLowerCase();
  if (/pytorch|tensorflow|sklearn|langchain|ml|machine.learn|ai\b|nlp|llm/.test(all)) return 'ml';
  if (/react|vue|angular|next|svelte|frontend|ui\b|web.app/.test(all)) return 'web';
  if (/cli|command.line|terminal|shell/.test(all)) return 'cli';
  if (/android|ios|flutter|react.native|mobile/.test(all)) return 'mobile';
  if (/docker|kubernetes|terraform|ansible|devops|infra/.test(all)) return 'infra';
  if (/api|backend|server|microservice|rest/.test(all)) return 'backend';
  return 'other';
};

// Call Gemini to generate a 2-sentence summary + skillTags for a repo
const summarizeRepo = async (repo) => {
  try {
    const prompt = `Analyze this GitHub repository and respond with ONLY valid JSON, no markdown.

Repository: ${repo.name}
Description: ${repo.description || 'No description'}
Languages: ${Object.keys(repo.languages || {}).join(', ')}
Topics: ${(repo.topics || []).join(', ')}
README excerpt: ${(repo.readme || '').slice(0, 800)}
Detected tech stack: ${(repo.techStack || []).join(', ')}

Respond with ONLY this JSON (no markdown fences):
{"summary":"2-sentence technical summary of what this project does and its technical highlights","skillTags":["skill1","skill2"]}

Rules:
- summary must be exactly 2 sentences, factual, based only on provided info
- skillTags: 3-8 specific technical skills demonstrated (frameworks, languages, patterns)
- No hallucination — only use what is in the input`;

    const { data } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash-lite',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    let raw = data.choices?.[0]?.message?.content || '{}';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    logger.warn('githubAnalyzer: summarizeRepo failed', { repo: repo.name, error: err.message });
    return { summary: repo.description || '', skillTags: repo.techStack || [] };
  }
};

const analyzeUserRepos = async (userId, username) => {
  // Check cache (7-day TTL via MongoDB TTL index)
  const cached = await GitHubAnalysis.findOne({ userId });
  if (cached && cached.expiresAt > new Date()) {
    logger.info('githubAnalyzer: cache hit', { username });
    return cached;
  }

  logger.info('githubAnalyzer: starting analysis', { username });

  // Fetch repo list
  const repos = await safeGet(`${GH_API}/users/${username}/repos?per_page=100&sort=pushed`);
  if (!repos || !Array.isArray(repos)) throw new Error('Could not fetch GitHub repositories');

  // Sort by stars desc, take top MAX_REPOS non-fork repos
  const topRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS);

  const analyzed = [];

  for (const repo of topRepos) {
    logger.debug('githubAnalyzer: analyzing repo', { repo: repo.name });

    // Fetch repo details in parallel
    const [langData, readmeData, pkgData, reqData, dockerData] = await Promise.all([
      safeGet(`${GH_API}/repos/${username}/${repo.name}/languages`),
      safeGet(`${GH_API}/repos/${username}/${repo.name}/readme`),
      safeGet(`${GH_API}/repos/${username}/${repo.name}/contents/package.json`),
      safeGet(`${GH_API}/repos/${username}/${repo.name}/contents/requirements.txt`),
      safeGet(`${GH_API}/repos/${username}/${repo.name}/contents/Dockerfile`),
    ]);

    const readme = readmeData?.content
      ? Buffer.from(readmeData.content, 'base64').toString('utf8').slice(0, 2000)
      : '';

    let pkgJson = null;
    try {
      if (pkgData?.content) pkgJson = JSON.parse(Buffer.from(pkgData.content, 'base64').toString('utf8'));
    } catch {}

    const reqTxt = reqData?.content ? Buffer.from(reqData.content, 'base64').toString('utf8') : null;
    const dockerfileContent = dockerData?.content ? Buffer.from(dockerData.content, 'base64').toString('utf8') : null;

    const techStack = detectTechStack(readme, pkgJson, reqTxt, dockerfileContent);
    const repoObj = {
      name: repo.name,
      description: repo.description || '',
      stars: repo.stargazers_count || 0,
      language: repo.language || '',
      languages: langData || {},
      topics: repo.topics || [],
      readme: readme.slice(0, 2000),
      techStack,
      githubUrl: repo.html_url,
    };

    // AI summary (runs per-repo)
    const { summary, skillTags } = await summarizeRepo(repoObj);
    repoObj.summary = summary;
    repoObj.skillTags = skillTags;
    repoObj.category = categorizeRepo(techStack, repo.topics, readme);

    analyzed.push(repoObj);
  }

  // Deduplicated union of all skills
  const allSkills = [...new Set(analyzed.flatMap((r) => r.skillTags))];

  const result = await GitHubAnalysis.findOneAndUpdate(
    { userId },
    {
      userId,
      username,
      repos: analyzed,
      allSkills,
      analyzedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  logger.info('githubAnalyzer: complete', { username, repos: analyzed.length, skills: allSkills.length });
  return result;
};

module.exports = { analyzeUserRepos };
