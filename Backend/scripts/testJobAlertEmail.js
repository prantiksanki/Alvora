/**
 * One-shot script: send a demo Salesforce job alert email.
 * Usage: node scripts/testJobAlertEmail.js [recipient@email.com]
 *
 * If no recipient is given, finds the first user in the DB and uses their
 * alertEmail (or login email as fallback).
 */
require('dotenv').config();

const mongoose = require('mongoose');
const { sendJobAlertEmail } = require('../services/notifications/notificationService');

const DEMO_JOB = {
  company: 'salesforce',
  title: 'Senior Software Engineer — Platform',
  location: 'San Francisco, CA / Remote',
  employmentType: 'full_time',
  applyUrl: 'https://salesforce.wd12.myworkdayjobs.com/External_Career_Site',
  source: 'workday',
  detectedAt: new Date(),
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let recipient = process.argv[2];

  if (!recipient) {
    const User = require('../models/User');
    const user = await User.findOne().sort({ createdAt: 1 }).lean();
    if (!user) {
      console.error('No users found in DB. Pass a recipient email as argument.');
      process.exit(1);
    }
    recipient = user.alertEmail?.trim() || user.email;
    console.log(`Using first user: ${user.email}  →  sending to: ${recipient}`);
  }

  console.log(`Sending demo Salesforce job alert to: ${recipient}`);
  await sendJobAlertEmail(recipient, DEMO_JOB);
  console.log('Done! Check the inbox.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
