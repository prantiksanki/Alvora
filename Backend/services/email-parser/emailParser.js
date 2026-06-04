const { classify } = require('./classifier');

/** Extract a header value by name from the Gmail metadata headers array. */
const getHeader = (headers = [], name) => {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
};

/**
 * Extract company name from a sender string like:
 *   "Google Recruiting <recruiting@google.com>"  →  "Google"
 *   "noreply@greenhouse.io"                      →  "Greenhouse"
 */
// ATS/recruiting platforms that send on behalf of companies.
// For these, the company name must NOT come from the root ATS domain
// (e.g. "myworkday.com" → "Myworkday" is wrong — it's the ATS, not the company).
const ATS_DOMAINS = [
  'greenhouse', 'lever', 'workday', 'myworkday', 'taleo', 'icims',
  'smartrecruiters', 'ashby', 'rippling', 'jobvite', 'brassring',
  'successfactors', 'bamboohr', 'recruitee', 'jazz', 'pinpoint',
];

const isAtsDomain = (domain) => ATS_DOMAINS.some((a) => domain.includes(a));

// Words that appear as email usernames or subdomains but are NOT company names.
const GENERIC_IDENTIFIERS = new Set([
  'noreply', 'no-reply', 'noreply', 'donotreply', 'do-not-reply',
  'notification', 'notifications', 'alert', 'alerts', 'automated',
  'app', 'jobs', 'careers', 'info', 'admin', 'recruiting', 'recruitment',
  'hr', 'hello', 'support', 'workday', 'myworkday', 'apply', 'applications',
  'talent', 'team', 'hire', 'hiring', 'spgi', 'mail', 'email', 'system',
  'no', 'reply', 'bounce', 'mailer', 'service', 'contact',
]);

const isGeneric = (str) => GENERIC_IDENTIFIERS.has(str.toLowerCase().replace(/[^a-z0-9]/g, ''));

/**
 * Capitalize first letter of each word, respecting known acronyms.
 * "kaleris" → "Kaleris", "sp" → "Sp" (better than nothing)
 */
const toCompanyCase = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Extract the display name from a sender string like
 * "S&P Global <no-reply@myworkday.com>" → "S&P Global"
 * "Workday at S&P Global <spgi@myworkday.com>" → "S&P Global"
 */
const extractDisplayName = (senderStr = '') => {
  const m = senderStr.match(/^"?([^"<]+?)"?\s*</);
  if (!m) return null;
  let raw = m[1].trim();
  if (!raw || isGeneric(raw)) return null;

  // Strip "Workday at/for/with/@ CompanyName" → keep CompanyName
  raw = raw.replace(/^workday\s+(?:at|for|with|@)\s+/i, '').trim();

  // Strip trailing recruiter-noise suffixes
  raw = raw.replace(/\s+(recruiting|talent acquisition|talent|careers?|hr|hiring|notifications?|no.?reply|team|alert).*$/i, '').trim();

  return raw.length > 1 ? raw : null;
};

const extractCompanyFromSender = (senderStr = '', subject = '') => {
  const emailMatch = senderStr.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : senderStr.trim();
  const domainMatch = email.match(/@([\w.-]+)/);
  if (!domainMatch) return null;

  const domain = domainMatch[1].toLowerCase();

  if (isAtsDomain(domain)) {
    // Priority 1: display name in From field
    // "S&P Global <noreply@myworkday.com>" → "S&P Global"
    // "Workday at S&P Global <spgi@myworkday.com>" → "S&P Global"
    const display = extractDisplayName(senderStr);
    if (display) return display;

    // Priority 2: extract company from subject line
    // "Your application to Kaleris - Software Engineer Intern" → "Kaleris"
    const subjectPatterns = [
      /your application (?:to|at|with|for) (.+?)(?:\s*[-–:|,]|\s+is\s|\s+has\s|\s+for\s|$)/i,
      /application (?:to|at|for|with) (.+?)(?:\s*[-–:|,]|\s+is\s|\s+has\s|$)/i,
      /^(.+?)\s*[-–:|]\s*(?:your\s+)?(?:application|interview|offer|assessment)/i,
      /(?:interview|offer|assessment)\s+(?:at|with|from)\s+(.+?)(?:\s*[-–:|,]|$)/i,
      /thank you for (?:applying|your application) (?:to|at|with) (.+?)(?:\s*[-–:|,!.]|$)/i,
      /welcome to (.+?)(?:'s)?\s+(?:application|recruitment|hiring)/i,
    ];
    for (const p of subjectPatterns) {
      const m = subject.match(p);
      if (m) {
        const candidate = m[1].trim().replace(/[.,;!]$/, '').trim();
        if (candidate && candidate.length > 1 && candidate.length < 80 && !isGeneric(candidate)) {
          return candidate;
        }
      }
    }

    // Priority 3: company subdomain — "no-reply@kaleris.myworkday.com"
    // domain = "kaleris.myworkday.com" → parts = ['kaleris', 'myworkday', 'com']
    // Take the part immediately before the ATS keyword segment
    const parts = domain.split('.');
    const atsIndex = parts.findIndex((p) => ATS_DOMAINS.some((a) => p.includes(a)));
    if (atsIndex > 0) {
      const sub = parts[atsIndex - 1];
      if (sub && !isGeneric(sub) && sub.length > 2) {
        return toCompanyCase(sub);
      }
    }

    // Priority 4: username of ATS email — "kaleris@myworkday.com" → "kaleris" → "Kaleris"
    // "walmart@myworkday.com" → "walmart" → "Walmart"
    const username = email.split('@')[0];
    const usernameClean = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (usernameClean && !isGeneric(usernameClean) && usernameClean.length > 2) {
      return toCompanyCase(username.replace(/[^a-zA-Z0-9]/g, ''));
    }

    // Truly can't identify the company from this ATS email
    return null;
  }

  // Non-ATS email: derive company name from the email domain
  // "recruiting@google.com" → "Google"
  const domainParts = domain.split('.');
  const significant = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domainParts[0];
  return significant.charAt(0).toUpperCase() + significant.slice(1);
};

/**
 * Try to extract a job role from the subject line.
 * Returns null if no pattern matches — callers fall back to a default.
 */
const extractRoleFromSubject = (subject = '') => {
  const patterns = [
    /your application (?:for|to) (.+?)(?:\s+at\s|\s+-\s|\s*$)/i,
    /application for (.+?) (?:position|role|opening|opportunity)/i,
    /re:\s*(.+?) (?:interview|offer|assessment)\s/i,
    /interview for (.+?)(?:\s+at\s|\s+-\s|\s*$)/i,
    /(?:offer|opportunity) for (.+?)(?:\s+at\s|\s+-\s|\s*$)/i,
  ];
  for (const p of patterns) {
    const m = subject.match(p);
    if (m) return m[1].trim().replace(/\s+/g, ' ').substring(0, 100);
  }
  return null;
};

/**
 * Extract the bare email address from a sender string.
 *   "Google <jobs@google.com>"  →  "jobs@google.com"
 */
const extractEmail = (senderStr = '') => {
  const m = senderStr.match(/<([^>]+)>/);
  return m ? m[1] : senderStr.trim();
};

/**
 * Parse a Gmail message resource (metadata format) and classify it.
 *
 * Returns null when:
 *  - the email cannot be attributed to a company, OR
 *  - the classifier confidence is below the minimum threshold (20)
 *
 * @param {object} gmailMessage - Gmail API message resource (metadata format)
 * @returns {object|null} parsed email data
 */
const parseAndClassifyEmail = (gmailMessage) => {
  const headers = gmailMessage.payload?.headers || [];
  const subject = getHeader(headers, 'Subject');
  const from = getHeader(headers, 'From');
  const dateStr = getHeader(headers, 'Date');
  const snippet = gmailMessage.snippet || '';

  // Pass subject so ATS domains (Workday, Greenhouse etc.) can extract
  // the actual company name when the display name is missing or generic
  const company = extractCompanyFromSender(from, subject);
  if (!company) return null;

  const { status: detectedStatus, confidence, matchedKeywords } = classify(subject, snippet);

  // Ignore emails that don't meet the minimum confidence threshold
  if (!detectedStatus || confidence < 20) return null;

  const role = extractRoleFromSubject(subject) || 'Software Engineer';
  const receivedAt = dateStr ? new Date(dateStr) : new Date();

  return {
    company,
    role,
    detectedStatus,
    confidence,
    matchedKeywords,
    subject,
    sender: from,
    sourceEmail: extractEmail(from),
    snippet,
    receivedAt: isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
  };
};

module.exports = { parseAndClassifyEmail };
