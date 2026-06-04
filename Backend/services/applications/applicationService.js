const JobApplication = require('../../models/JobApplication');

/**
 * Status priority used to decide whether an incoming email status
 * represents a progression from the current application status.
 * Higher number = further along in the pipeline.
 * Rejected and Offer are treated as terminal and always win.
 */
const STATUS_PRIORITY = {
  Ghosted: 0,
  Recruiter_Outreach: 0.5,
  Applied: 1,
  Waitlist: 1.5,
  OA_Received: 2,
  Interview_Scheduled: 3,
  Next_Round: 4,
  Rejected: 5,
  Offer: 6,
  Withdrawn: 7,
};

const isProgression = (currentStatus, incomingStatus) => {
  if (!incomingStatus) return false;
  if (incomingStatus === 'Rejected' || incomingStatus === 'Offer') return true;
  return (STATUS_PRIORITY[incomingStatus] || 0) > (STATUS_PRIORITY[currentStatus] || 0);
};

/** Escape special regex characters in a string for safe use in RegExp. */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Find an existing application for this user matching company + role
 * (case-insensitive), or create a new one.
 *
 * If an existing application is found and the new status is a progression,
 * the status and lastUpdated fields are updated.
 *
 * Returns { application, isNew }.
 */
const upsertApplication = async (userId, emailAccountId, parsed) => {
  const { company, role, detectedStatus, sourceEmail, receivedAt } = parsed;

  const existing = await JobApplication.findOne({
    userId,
    company: { $regex: new RegExp(`^${escapeRegex(company)}$`, 'i') },
    role: { $regex: new RegExp(`^${escapeRegex(role)}$`, 'i') },
  });

  if (existing) {
    if (isProgression(existing.status, detectedStatus)) {
      existing.status = detectedStatus;
      existing.lastUpdated = new Date();
      await existing.save();
    }
    return { application: existing, isNew: false };
  }

  const application = await JobApplication.create({
    userId,
    emailAccountId,
    company,
    role,
    status: detectedStatus || 'Applied',
    appliedDate: receivedAt || new Date(),
    lastUpdated: new Date(),
    sourceEmail,
    isManual: false,
    extractedBy: parsed.extractedBy || 'rule',
    aiConfidence: parsed.aiConfidence ?? null,
    recruiterName: parsed.recruiterName,
    recruiterEmail: parsed.recruiterEmail,
    interviewDate: parsed.interviewDate,
    meetingLink: parsed.meetingLink,
    oaDeadline: parsed.oaDeadline,
  });

  return { application, isNew: true };
};

module.exports = { upsertApplication };
