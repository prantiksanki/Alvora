const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const JobDescription = require('../../models/JobDescription');
const logger = require('../../utils/logger');

const hashUrl = (url) => crypto.createHash('sha256').update(url).digest('hex').slice(0, 32);

/**
 * Detect if a URL is a Workday job and return parsed parts, or null.
 * Handles:
 *   https://{tenant}.{wdN}.myworkdayjobs.com/en-US/{boardId}/job/{slug}_{jobId}
 *   https://{tenant}.{wdN}.myworkdayjobs.com/{boardId}/job/{slug}_{jobId}
 */
const parseWorkdayUrl = (url) => {
  const m = url.match(/https?:\/\/([^.]+)\.(wd\d+)\.myworkdayjobs\.com\/(?:[^/]+\/)?([^/]+)\/job\/([^?#]+)/);
  if (!m) return null;
  const fullSlug = m[4]; // e.g. "EVP--COO--Salesforce-Platform_JR345543"
  // jobId is the last underscore-delimited segment
  const jobId = fullSlug.includes('_') ? fullSlug.split('_').pop() : fullSlug;
  return { tenant: m[1], wdInstance: m[2], boardId: m[3], fullSlug, jobId };
};

/**
 * Fetch a Workday job via their CXS list API (the only accessible endpoint).
 * The detail page is JS-rendered and has no public JSON API for the description,
 * so we use the job title + location as the "text" for AI extraction.
 */
const fetchWorkdayJobText = async (url) => {
  const parts = parseWorkdayUrl(url);
  if (!parts) return null;

  const { tenant, wdInstance, boardId, jobId } = parts;
  const listUrl = `https://${tenant}.${wdInstance}.myworkdayjobs.com/wday/cxs/${tenant}/${boardId}/jobs`;

  logger.info('jobScraper: using Workday list API', { listUrl, jobId });

  const { data } = await axios.post(
    listUrl,
    { limit: 1, offset: 0, searchText: jobId },
    {
      timeout: 15000,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }
  );

  const posting = (data?.jobPostings || [])[0];
  if (!posting) return null;

  const title   = posting.title || '';
  const location = posting.locationsText || '';
  const company  = tenant.charAt(0).toUpperCase() + tenant.slice(1);

  // Workday doesn't expose the description via API — synthesize a text block
  // so the AI can still extract structured requirements from the title
  const text = `Job Title: ${title}\nCompany: ${company}\nLocation: ${location}\nJob ID: ${jobId}\nSource: Workday career portal`;

  logger.info('jobScraper: Workday metadata fetched', { title, company });
  return { text, title, company };
};

const scrapeText = async (url) => {
  let html;
  try {
    const res = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      maxRedirects: 5,
    });
    html = res.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 403 || status === 429) {
      throw new Error(`This job board blocks automated access (HTTP ${status}). Try copying and pasting the job description text directly.`);
    }
    throw new Error(`Could not fetch the job page: ${err.message}`);
  }

  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, nav, header, footer, [aria-hidden="true"], .cookie-banner, #cookie-banner').remove();

  // Priority selectors — job boards tend to use these
  const prioritySelectors = [
    '[class*="job-description"]', '[class*="jobDescription"]',
    '[class*="job-detail"]',      '[class*="jobDetail"]',
    '[class*="description"]',     '[id*="description"]',
    '[class*="posting"]',         '[class*="job-content"]',
    'main article',               'main [role="main"]',
    '.job-view-layout',           '#job-details',
    '[data-automation="jobAdDetails"]',
  ];

  let text = '';
  for (const sel of prioritySelectors) {
    const el = $(sel).first();
    if (el.length) {
      text = el.text();
      break;
    }
  }

  // Fallback: entire main or body
  if (text.length < 200) text = $('main').text() || $('body').text();

  // Collapse whitespace
  return text.replace(/\s+/g, ' ').trim().slice(0, 6000);
};

const parseWithAI = async (rawText, url) => {
  const prompt = `Extract structured job posting information from this text. Respond with ONLY valid JSON, no markdown fences.

URL: ${url}
Job posting text:
${rawText.slice(0, 4000)}

Respond with ONLY this JSON structure:
{
  "company": "company name or empty string",
  "title": "job title",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "atsKeywords": ["keyword1", "keyword2"],
  "technologies": ["tech1", "tech2"],
  "roleType": "frontend|backend|fullstack|ml|devops|mobile|data|other",
  "seniorityLevel": "intern|junior|mid|senior|staff|principal|manager"
}

Rules:
- Only extract what is explicitly stated in the text
- atsKeywords: exact terms that ATS systems scan for (certifications, methodologies, tools)
- requiredSkills: explicitly listed as required/must have
- preferredSkills: listed as nice to have/preferred/bonus
- technologies: specific tech stack mentioned (languages, frameworks, databases, cloud)`;

  const { data } = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-2.5-flash-lite',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 600,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  let raw = data.choices?.[0]?.message?.content || '{}';
  raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    logger.warn('jobScraper: AI returned invalid JSON, using empty structure');
    return {};
  }
};

const scrapeJob = async (url) => {
  const urlHash = hashUrl(url);

  // Cache check — 24h TTL via MongoDB TTL index
  const cached = await JobDescription.findOne({ urlHash });
  if (cached) {
    logger.info('jobScraper: cache hit', { url });
    return cached;
  }

  logger.info('jobScraper: scraping', { url });

  let rawText, prefillTitle, prefillCompany;

  // Workday URLs: use their JSON API directly (HTML is JS-rendered, axios can't read it)
  const workdayResult = await fetchWorkdayJobText(url).catch((err) => {
    logger.warn('jobScraper: Workday API failed, falling back to HTML scrape', { error: err.message });
    return null;
  });

  if (workdayResult) {
    rawText       = workdayResult.text;
    prefillTitle   = workdayResult.title;
    prefillCompany = workdayResult.company;
  } else {
    rawText = await scrapeText(url);
  }

  if (!rawText || rawText.length < 100) throw new Error('Could not extract job description from this URL. Try pasting the description text manually.');

  const structured = await parseWithAI(rawText, url);

  const doc = await JobDescription.create({
    urlHash,
    url,
    company: structured.company || prefillCompany || '',
    title:   structured.title   || prefillTitle   || '',
    rawText,
    structured: {
      requiredSkills:  structured.requiredSkills  || [],
      preferredSkills: structured.preferredSkills || [],
      atsKeywords:     structured.atsKeywords     || [],
      technologies:    structured.technologies    || [],
      roleType:        structured.roleType        || '',
      seniorityLevel:  structured.seniorityLevel  || '',
    },
  });

  logger.info('jobScraper: complete', { company: doc.company, title: doc.title });
  return doc;
};

module.exports = { scrapeJob };
