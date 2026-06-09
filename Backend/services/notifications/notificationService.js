const nodemailer = require('nodemailer');
const Notification = require('../../models/Notification');
const logger = require('../../utils/logger');

const createNotification = async (userId, type, title, message, link = null) => {
  try {
    return await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    logger.error('Failed to create notification', { userId, type, error: err.message });
    return null;
  }
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, read: false });
};

const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  );
};

const markAllRead = async (userId) => {
  return Notification.updateMany({ userId, read: false }, { $set: { read: true } });
};

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return _transporter;
};

const buildJobAlertHtml = (job) => {
  const company = job.company
    ? job.company.charAt(0).toUpperCase() + job.company.slice(1)
    : 'A company';
  const location = job.location || 'Remote / Unspecified';
  const type = job.employmentType ? job.employmentType.replace('_', ' ') : 'Full-time';
  const applyUrl = job.applyUrl || '#';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Job Alert — Alvora</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;max-width:560px;">

          <!-- Top bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:4px;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);width:28px;height:28px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="font-size:14px;color:#fff;font-weight:700;line-height:28px;">&#9650;</span>
                  </td>
                  <td style="padding-left:10px;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.04em;vertical-align:middle;">
                    alvora.app
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Label -->
          <tr>
            <td style="padding:0 32px 12px;">
              <span style="display:inline-block;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:#34d399;font-size:10px;font-weight:600;letter-spacing:0.08em;padding:4px 10px;border-radius:999px;text-transform:uppercase;">
                &#9679; New Job Detected
              </span>
            </td>
          </tr>

          <!-- Job card -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid rgba(139,92,246,0.2);border-radius:14px;overflow:hidden;">
                <!-- Company accent bar -->
                <tr>
                  <td style="background:linear-gradient(90deg,rgba(139,92,246,0.4),rgba(99,102,241,0.1));height:3px;"></td>
                </tr>
                <tr>
                  <td style="padding:20px 22px;">

                    <!-- Company name -->
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8b5cf6;">${company}</p>

                    <!-- Job title -->
                    <p style="margin:0 0 14px;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">${job.title || 'Software Engineer'}</p>

                    <!-- Meta row -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:16px;font-size:12px;color:#6b7280;">
                          &#128205; ${location}
                        </td>
                        <td style="font-size:12px;color:#6b7280;text-transform:capitalize;">
                          &#128188; ${type}
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
                      <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>
                    </table>

                    <!-- CTA -->
                    <a href="${applyUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#ffffff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(139,92,246,0.3);">
                      View &amp; Apply &#8594;
                    </a>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;font-size:11px;color:#374151;line-height:1.6;">
                You received this because you're following <strong style="color:#6b7280;">${company}</strong> on Alvora.<br/>
                To stop these alerts, update your notification preferences in
                <a href="${process.env.FRONTEND_URL || 'https://alvora.app'}/live-jobs" style="color:#8b5cf6;text-decoration:none;">Job Intelligence settings</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) {
    logger.debug('Email skipped — no SMTP config (set SMTP_HOST, SMTP_USER, SMTP_PASS)', { to, subject });
    return;
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'Alvora';
    const fromAddr = process.env.SMTP_USER;
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject });
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
  }
};

const sendJobAlertEmail = async (to, job) => {
  const company = job.company
    ? job.company.charAt(0).toUpperCase() + job.company.slice(1)
    : 'a company';
  const subject = `New job at ${company}: ${job.title || 'Open Position'}`;
  const html = buildJobAlertHtml(job);
  await sendEmail(to, subject, html);
};

module.exports = {
  createNotification,
  getUnreadCount,
  markAsRead,
  markAllRead,
  sendEmail,
  sendJobAlertEmail,
};
