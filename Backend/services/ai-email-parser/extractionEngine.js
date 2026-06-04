/**
 * Regex-based structured data extraction from email metadata.
 * Pure synchronous module — no async, no network calls, never throws.
 * All extractors return null when no confident match is found.
 */

const SYSTEM_SENDER_PATTERNS = /noreply|no-reply|donotreply|do-not-reply|automated|system|notifications?|alerts?/i;

const ATS_SUFFIXES = /\s+(recruiting|talent\s+acquisition|talent|careers?|hiring|hr|no\s*reply|team|notifications?)\s*$/i;

/**
 * Parse the human-readable display name from a sender string like
 * "Google Recruiting <recruiting@google.com>".
 * Returns null if the sender looks like an automated system.
 */
const extractRecruiterName = (senderStr = '') => {
  const displayMatch = senderStr.match(/^([^<]+)<[^>]+>/);
  if (!displayMatch) return null;

  const raw = displayMatch[1].trim().replace(/"/g, '');
  if (!raw || SYSTEM_SENDER_PATTERNS.test(raw)) return null;

  // Strip common ATS/recruiting suffixes
  const cleaned = raw.replace(ATS_SUFFIXES, '').trim();
  // If only one word remains and it looks like a company not a person, skip
  if (cleaned && cleaned.length > 1 && cleaned.length < 60) return cleaned;
  return null;
};

/** Extract the bare email address from a sender string. */
const extractRecruiterEmail = (senderStr = '') => {
  const m = senderStr.match(/<([^>]+@[^>]+)>/);
  if (m) return m[1].toLowerCase();
  const bare = senderStr.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bare) ? bare.toLowerCase() : null;
};

const MONTH_NAMES = 'January|February|March|April|May|June|July|August|September|October|November|December';
const MONTH_ABBR  = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
const ORDINAL     = '(?:st|nd|rd|th)?';

const DATE_PATTERNS = [
  // "January 15th, 2025" or "January 15, 2025"
  new RegExp(`\\b(${MONTH_NAMES})\\s+(\\d{1,2})${ORDINAL},?\\s+(\\d{4})\\b`, 'i'),
  // "Jan 15, 2025"
  new RegExp(`\\b(${MONTH_ABBR})\\.?\\s+(\\d{1,2})${ORDINAL},?\\s+(\\d{4})\\b`, 'i'),
  // "15 January 2025"
  new RegExp(`\\b(\\d{1,2})\\s+(${MONTH_NAMES})\\s+(\\d{4})\\b`, 'i'),
  // "2025-01-15" or "01/15/2025"
  /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/,
];

const tryParseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Find the first plausible interview/meeting date in the combined text.
 * Returns a Date object or null.
 */
const extractInterviewDate = (text = '') => {
  for (const pattern of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      const candidate = tryParseDate(m[0]);
      // Only accept future or very-recent dates (within last 7 days)
      if (candidate && candidate.getTime() > Date.now() - 7 * 86400000) {
        return candidate;
      }
    }
  }
  return null;
};

/** Match Zoom, Google Meet, or Microsoft Teams meeting links. */
const extractMeetingLink = (text = '') => {
  const m = text.match(
    /https?:\/\/(?:[\w-]+\.)?(?:zoom\.us\/j\/[\w?=&]+|meet\.google\.com\/[a-z\-]+|teams\.microsoft\.com\/l\/meetup-join\/[^\s"<>]+)/i
  );
  return m ? m[0] : null;
};

const DEADLINE_CONTEXT = new RegExp(
  `(?:due|deadline|complete by|submit(?:ted)? by|expires?|valid until|assessment (?:due|closes?))` +
  `[^.!?]{0,40}?` +
  `(\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}|(?:${MONTH_NAMES}|${MONTH_ABBR})\\.?\\s+\\d{1,2}(?:${ORDINAL})?(?:,?\\s+\\d{4})?)`,
  'i'
);

/** Find a deadline date mentioned in context of assessment/OA deadlines. */
const extractOADeadline = (text = '') => {
  const m = text.match(DEADLINE_CONTEXT);
  if (!m) return null;
  return tryParseDate(m[1]);
};

/** Find ATS or application portal links. */
const extractApplicationPortalLink = (text = '') => {
  const m = text.match(
    /https?:\/\/[\w.-]*(?:greenhouse\.io|lever\.co|workday\.com|taleo\.net|icims\.com|ashbyhq\.com|smartrecruiters\.com|myworkdayjobs\.com)\/[^\s"<>]*/i
  );
  return m ? m[0] : null;
};

/**
 * Main export. Takes email metadata and returns all extractable structured fields.
 * All fields are nullable. Never throws.
 */
const extractStructuredData = ({ subject = '', snippet = '', sender = '' }) => {
  const combinedText = `${subject} ${snippet}`;
  return {
    recruiterName:         extractRecruiterName(sender),
    recruiterEmail:        extractRecruiterEmail(sender),
    interviewDate:         extractInterviewDate(combinedText),
    meetingLink:           extractMeetingLink(combinedText),
    oaDeadline:            extractOADeadline(combinedText),
    applicationPortalLink: extractApplicationPortalLink(combinedText),
  };
};

module.exports = {
  extractStructuredData,
  extractRecruiterName,
  extractRecruiterEmail,
  extractInterviewDate,
  extractMeetingLink,
  extractOADeadline,
};
