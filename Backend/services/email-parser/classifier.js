/**
 * Rule-based email classification engine.
 *
 * Returns { status, confidence, matchedKeywords } so callers can threshold
 * on confidence and log which patterns fired. The interface is intentionally
 * stable so an AI/NLP layer can replace or augment this function later
 * without touching any call sites.
 *
 * Subject matches are weighted 2× body/snippet matches because subjects are
 * more intentional and less noisy than body text.
 *
 * Ghosted is NOT handled here — it requires time-based logic (absence of
 * communication for N days), not keyword detection.
 */

const STATUS_PATTERNS = {
  // Terminal negative — check before others to avoid mis-classifying
  Rejected: {
    subject: [
      /unfortunately/i,
      /not moving forward/i,
      /position has been filled/i,
      /we regret to inform/i,
      /unable to move forward/i,
      /not selected/i,
      /thank you for your interest.*no longer/i,
    ],
    body: [
      /not selected/i,
      /not a match/i,
      /keep your resume on file/i,
      /pursue other opportunities/i,
      /decided to move forward with other candidates/i,
      /we have filled this position/i,
      /no longer moving forward/i,
    ],
    weight: 10,
  },

  // Terminal positive
  Offer: {
    subject: [
      /offer letter/i,
      /job offer/i,
      /offer of employment/i,
      /pleased to offer/i,
      /formal offer/i,
      /employment offer/i,
    ],
    body: [
      /we are excited to offer/i,
      /compensation package/i,
      /start date/i,
      /accept the offer/i,
      /sign your offer/i,
      /total compensation/i,
    ],
    weight: 10,
  },

  Interview_Scheduled: {
    subject: [
      /interview invitation/i,
      /interview request/i,
      /schedule.*interview/i,
      /interview.*schedule/i,
      /invitation to interview/i,
      /technical interview/i,
      /phone screen/i,
    ],
    body: [
      /we.{0,10}like to invite you/i,
      /please select a time/i,
      /calendly/i,
      /zoom call/i,
      /phone screen/i,
      /technical interview/i,
      /schedule.*30 minutes/i,
      /schedule.*45 minutes/i,
      /schedule.*1 hour/i,
      /meet with our team/i,
    ],
    weight: 8,
  },

  OA_Received: {
    subject: [
      /online assessment/i,
      /coding challenge/i,
      /take.home/i,
      /technical assessment/i,
      /hackerrank/i,
      /codility/i,
      /codesignal/i,
      /coding test/i,
      /technical test/i,
    ],
    body: [
      /assessment link/i,
      /test link/i,
      /coding test/i,
      /complete the following assessment/i,
      /complete.*challenge/i,
      /assessment must be completed/i,
      /hackerrank/i,
      /codility/i,
      /codesignal/i,
    ],
    weight: 8,
  },

  Next_Round: {
    subject: [
      /move forward/i,
      /next round/i,
      /next stage/i,
      /advance to/i,
      /congratulations.*application/i,
      /pleased to inform/i,
    ],
    body: [
      /selected to proceed/i,
      /advance to the next/i,
      /second round/i,
      /final round/i,
      /next step in our process/i,
      /moving you forward/i,
    ],
    weight: 7,
  },

  Applied: {
    subject: [
      /application received/i,
      /thank you for applying/i,
      /application confirmation/i,
      /we received your application/i,
      /application submitted/i,
    ],
    body: [
      /successfully submitted/i,
      /application is under review/i,
      /will be in touch/i,
      /thank you for your interest in/i,
      /your application has been received/i,
    ],
    weight: 5,
  },
};

/**
 * Classify an email based on its subject and body/snippet text.
 * @param {string} subject - Email subject line
 * @param {string} bodySnippet - Email body preview or snippet
 * @returns {{ status: string|null, confidence: number, matchedKeywords: Array }}
 */
const classify = (subject = '', bodySnippet = '') => {
  const candidates = [];

  for (const [status, config] of Object.entries(STATUS_PATTERNS)) {
    const matched = [];
    let score = 0;

    for (const pattern of config.subject) {
      if (pattern.test(subject)) {
        matched.push({ field: 'subject', pattern: pattern.source });
        score += 2; // subject matches weighted 2×
      }
    }
    for (const pattern of config.body) {
      if (pattern.test(bodySnippet)) {
        matched.push({ field: 'body', pattern: pattern.source });
        score += 1;
      }
    }

    if (score > 0) {
      candidates.push({ status, score: score * config.weight, matchedKeywords: matched });
    }
  }

  if (candidates.length === 0) {
    return { status: null, confidence: 0, matchedKeywords: [] };
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  // Normalize to 0-100; a single high-weight subject match gives score=20 → confidence=100
  const confidence = Math.min(100, best.score * 5);

  return {
    status: best.status,
    confidence,
    matchedKeywords: best.matchedKeywords,
  };
};

module.exports = { classify };
