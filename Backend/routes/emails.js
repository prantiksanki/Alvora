const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const auditLogger = require('../middlewares/auditLogger');
const {
  connectGmail,
  gmailCallback,
  getConnectedEmails,
  disconnectEmail,
  triggerSync,
  getEmailBody,
} = require('../controllers/emailController');

// Returns OAuth consent URL — user must be logged in to initiate
router.get('/connect-gmail', protect, auditLogger('connect-gmail-initiate'), connectGmail);

// OAuth redirect target — NO protect middleware.
// The browser arrives here directly from Google with no Bearer token.
// userId is recovered from the base64-encoded `state` query param.
router.get('/callback', gmailCallback);

router.get('/', protect, getConnectedEmails);

router.delete(
  '/:id',
  protect,
  validate([param('id').isMongoId()]),
  auditLogger('disconnect-email'),
  disconnectEmail
);

router.post(
  '/:id/sync',
  protect,
  validate([param('id').isMongoId()]),
  triggerSync
);

// Fetch full body of a specific Gmail message (for timeline expand)
router.get(
  '/:accountId/message/:messageId',
  protect,
  validate([param('accountId').isMongoId()]),
  getEmailBody
);

module.exports = router;
