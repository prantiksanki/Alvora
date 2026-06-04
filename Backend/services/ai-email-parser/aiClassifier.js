const axios = require('axios');
const { parseAndClassifyEmail } = require('../email-parser/emailParser');
const { extractStructuredData } = require('./extractionEngine');
const logger = require('../../utils/logger');

const VALID_STATUSES = new Set([
  'Applied', 'OA_Received', 'Interview_Scheduled', 'Next_Round',
  'Rejected', 'Offer', 'Withdrawn', 'Ghosted', 'Waitlist', 'Recruiter_Outreach',
]);

const AI_CONFIDENCE_THRESHOLD = 40;

/** Extract a header value from Gmail message metadata headers array. */
const getHeader = (headers = [], name) => {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
};

/**
 * Classify and extract structured data from a Gmail message using OpenRouter (Qwen).
 *
 * Falls back (throws) when:
 *  - OPENROUTER_API_KEY is not set
 *  - The API call fails or times out (4s hard limit)
 *  - The response cannot be parsed as valid JSON
 *  - The returned status is not in the known set
 *  - The returned confidence is below AI_CONFIDENCE_THRESHOLD
 *
 * Callers (syncService) catch the throw and fall back to the rule-based classifier.
 * Returns the same shape as parseAndClassifyEmail plus AI-specific fields.
 */
const aiParseAndClassify = async (gmailMessage) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const headers  = gmailMessage.payload?.headers || [];
  const subject  = getHeader(headers, 'Subject');
  const from     = getHeader(headers, 'From');
  const dateStr  = getHeader(headers, 'Date');
  const snippet  = gmailMessage.snippet || '';

  const systemPrompt = `You are a job application email classifier for a developer career tracker. Analyze the email and return ONLY valid JSON with no markdown formatting.

JSON format: {"status":"<STATUS>","confidence":<0-100>,"extractedCompany":"<string or null>","extractedRole":"<string or null>","recruiterName":"<string or null>","interviewDate":"<ISO date string or null>","meetingLink":"<URL or null>","oaDeadline":"<ISO date string or null>"}

Valid status values: Applied, OA_Received, Interview_Scheduled, Next_Round, Rejected, Offer, Withdrawn, Ghosted, Waitlist, Recruiter_Outreach

Guidelines:
- Applied: confirmation emails, "thank you for applying", "we received your application"
- OA_Received: online assessment, coding challenge, HackerRank, Codility, CoderSignal
- Interview_Scheduled: interview invitation, schedule interview, phone screen
- Next_Round: advancing to next stage, congratulations, second/final round
- Rejected: unfortunately, not moving forward, position filled, other candidates
- Offer: offer letter, job offer, pleased to offer, compensation package
- Waitlist: waitlisted, hold, pending decision, under consideration
- Recruiter_Outreach: recruiter reaching out, interested in your profile, cold outreach
- confidence: 0-100 based on how certain you are. Use 0 if not job-related.
- Return null for fields you cannot determine with confidence.

If this email is NOT job-related, return: {"status":null,"confidence":0,"extractedCompany":null,"extractedRole":null,"recruiterName":null,"interviewDate":null,"meetingLink":null,"oaDeadline":null}`;

  const userPrompt = `Subject: ${subject}\nFrom: ${from}\nSnippet: ${snippet}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'qwen/qwen3-235b-a22b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 250,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://alvora.app',
        'X-Title': 'Alvora',
      },
      timeout: 4000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content || '';

  // Strip markdown code fences (same pattern as insightsEngine.js)
  const jsonStr = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const aiResult = JSON.parse(jsonStr);

  // Validate the response has a recognizable status
  if (aiResult.status !== null && !VALID_STATUSES.has(aiResult.status)) {
    throw new Error(`AI returned unknown status: ${aiResult.status}`);
  }

  const confidence = typeof aiResult.confidence === 'number' ? aiResult.confidence : 0;

  // Not a job email or confidence too low — let rule-based handle it
  if (!aiResult.status || confidence < AI_CONFIDENCE_THRESHOLD) {
    throw new Error(`AI confidence too low (${confidence}) or no status detected`);
  }

  // Enrich with synchronous regex extraction (never throws)
  const extracted = extractStructuredData({ subject, snippet, sender: from });

  // Merge: AI fields take precedence, regex fills in what AI missed
  const recruiterName  = aiResult.recruiterName  || extracted.recruiterName  || null;
  const meetingLink    = aiResult.meetingLink     || extracted.meetingLink    || null;
  const interviewDate  = aiResult.interviewDate
    ? new Date(aiResult.interviewDate)
    : extracted.interviewDate || null;
  const oaDeadline     = aiResult.oaDeadline
    ? new Date(aiResult.oaDeadline)
    : extracted.oaDeadline || null;

  // Determine company from AI result, then fall back to regex extractor from emailParser
  const company = aiResult.extractedCompany || null;
  const role    = aiResult.extractedRole    || null;

  // If AI couldn't extract company, fall back to rule-based parser to get it
  if (!company) {
    // Throw so caller falls back entirely to parseAndClassifyEmail
    // (which has better company extraction logic from domain names)
    throw new Error('AI could not extract company name — falling back to rule-based');
  }

  const receivedAt = dateStr ? new Date(dateStr) : new Date();

  logger.debug('AI classifier succeeded', {
    status: aiResult.status,
    confidence,
    company,
    messageId: gmailMessage.id,
  });

  return {
    company,
    role:           role || 'Software Engineer',
    detectedStatus: aiResult.status,
    confidence,
    matchedKeywords: [],
    subject,
    sender:         from,
    sourceEmail:    extracted.recruiterEmail || from.match(/<([^>]+)>/)?.[1] || from.trim(),
    snippet,
    receivedAt:     isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
    // AI-specific fields
    extractedBy:    'ai',
    aiConfidence:   confidence,
    recruiterName,
    recruiterEmail: extracted.recruiterEmail,
    interviewDate,
    meetingLink,
    oaDeadline,
  };
};

module.exports = { aiParseAndClassify };
