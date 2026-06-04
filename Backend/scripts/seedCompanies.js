/**
 * Seed Script: Initial Company Job Sync
 *
 * Runs a one-time sync for a curated set of companies to pre-populate
 * the JobPosting collection with real data on first setup.
 *
 * Usage:
 *   node scripts/seedCompanies.js                  # seed default starter set
 *   node scripts/seedCompanies.js --priority=high  # seed high-priority only
 *   node scripts/seedCompanies.js --company=stripe # seed a single company
 *   node scripts/seedCompanies.js --all            # seed all active companies (slow)
 *   node scripts/seedCompanies.js --dry-run        # print companies without syncing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { getCompaniesByPriority, getActiveCompanies, getRegistryStats, COMPANY_REGISTRY } = require('../config/companyRegistry');
const logger = require('../utils/logger');

const args = process.argv.slice(2);
const priorityArg  = args.find((a) => a.startsWith('--priority='))?.split('=')[1];
const companyArg   = args.find((a) => a.startsWith('--company='))?.split('=')[1];
const allFlag      = args.includes('--all');
const dryRun       = args.includes('--dry-run');
const concurrency  = parseInt(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1] || '3', 10);

/**
 * A curated starter set of companies that reliably have public ATS boards.
 * These are fetched on first run to give users immediate value.
 */
const STARTER_SET = [
  { provider: 'greenhouse', identifier: 'stripe' },
  { provider: 'greenhouse', identifier: 'airbnb' },
  { provider: 'greenhouse', identifier: 'shopify' },
  { provider: 'greenhouse', identifier: 'notion' },
  { provider: 'greenhouse', identifier: 'figma' },
  { provider: 'greenhouse', identifier: 'coinbase' },
  { provider: 'greenhouse', identifier: 'discord' },
  { provider: 'greenhouse', identifier: 'cloudflare' },
  { provider: 'greenhouse', identifier: 'datadog' },
  { provider: 'greenhouse', identifier: 'rippling' },
  { provider: 'greenhouse', identifier: 'deel' },
  { provider: 'greenhouse', identifier: 'ramp' },
  { provider: 'greenhouse', identifier: 'brex' },
  { provider: 'greenhouse', identifier: 'plaid' },
  { provider: 'greenhouse', identifier: 'databricks' },
  { provider: 'greenhouse', identifier: 'snowflake' },
  { provider: 'greenhouse', identifier: 'mongodb' },
  { provider: 'greenhouse', identifier: 'supabase' },
  { provider: 'greenhouse', identifier: 'duolingo' },
  { provider: 'greenhouse', identifier: 'canva' },
  { provider: 'lever',      identifier: 'atlassian' },
  { provider: 'lever',      identifier: 'netflix' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Run syncs with controlled concurrency to avoid hammering external APIs.
 */
const runWithConcurrency = async (items, fn, limit) => {
  const results = [];
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const item = items[index++];
      try {
        const result = await fn(item);
        results.push({ ...item, success: true, ...result });
      } catch (err) {
        results.push({ ...item, success: false, error: err.message });
        logger.warn('Seed sync failed', { provider: item.provider, identifier: item.identifier, error: err.message });
      }
      // Small delay between each request to be polite to external APIs
      await sleep(500);
    }
  };

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('MongoDB connected');

  const { runSync } = require('../services/job-monitor/monitoringEngine');
  const stats = getRegistryStats();

  logger.info('Company registry stats', stats);

  // Determine which companies to seed
  let companies;

  if (companyArg) {
    const entry = COMPANY_REGISTRY.find((c) => c.identifier === companyArg);
    if (!entry) {
      logger.error(`Company "${companyArg}" not found in registry`);
      process.exit(1);
    }
    companies = [{ provider: entry.provider, identifier: entry.identifier }];
  } else if (priorityArg) {
    companies = getCompaniesByPriority(priorityArg).map((c) => ({
      provider: c.provider, identifier: c.identifier,
    }));
  } else if (allFlag) {
    companies = getActiveCompanies().map((c) => ({
      provider: c.provider, identifier: c.identifier,
    }));
  } else {
    companies = STARTER_SET;
  }

  logger.info(`Seeding ${companies.length} companies (concurrency: ${concurrency})`, {
    dryRun,
    mode: companyArg ? 'single' : priorityArg ? `priority-${priorityArg}` : allFlag ? 'all' : 'starter-set',
  });

  if (dryRun) {
    console.log('\n── Dry run — companies that would be synced ──');
    companies.forEach((c, i) => console.log(`  ${i + 1}. [${c.provider}] ${c.identifier}`));
    console.log(`\nTotal: ${companies.length} companies`);
    await mongoose.disconnect();
    return;
  }

  const startTime = Date.now();
  const results = await runWithConcurrency(
    companies,
    ({ provider, identifier }) => runSync(provider, identifier),
    concurrency
  );

  const succeeded = results.filter((r) => r.success);
  const failed    = results.filter((r) => !r.success);
  const totalNew  = succeeded.reduce((sum, r) => sum + (r.newJobs || 0), 0);
  const elapsed   = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n── Seed Results ──────────────────────────────');
  console.log(`  Companies synced:  ${succeeded.length} / ${companies.length}`);
  console.log(`  New jobs inserted: ${totalNew}`);
  console.log(`  Failed:            ${failed.length}`);
  console.log(`  Time elapsed:      ${elapsed}s`);

  if (failed.length > 0) {
    console.log('\n── Failed companies ──');
    failed.forEach((r) => console.log(`  [${r.provider}] ${r.identifier}: ${r.error}`));
  }

  console.log('\n── Top companies by jobs found ──');
  succeeded
    .sort((a, b) => (b.newJobs || 0) - (a.newJobs || 0))
    .slice(0, 10)
    .forEach((r) => console.log(`  ${r.identifier}: ${r.newJobs} new jobs`));

  console.log('\nSeed complete. Run the server to start real-time monitoring.\n');

  await mongoose.disconnect();
};

main().catch((err) => {
  logger.error('Seed script failed', { error: err.message });
  console.error(err);
  process.exit(1);
});
