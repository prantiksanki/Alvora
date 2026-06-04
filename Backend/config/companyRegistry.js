/**
 * Company Registry
 *
 * Canonical source of truth for all monitored companies.
 * Each entry describes how to fetch jobs from a company's ATS.
 *
 * Fields:
 *   name           — display name
 *   provider       — ATS provider: 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'smartrecruiters'
 *   identifier     — slug/ID used in the ATS API URL
 *   careerUrl      — public careers page (for reference / fallback)
 *   category       — company category for grouping/filtering
 *   priority       — 'high' (2 min) | 'medium' (5 min) | 'low' (15 min)
 *   active         — whether monitoring is enabled
 *
 * Priority intervals (configurable via env):
 *   high   → MONITOR_INTERVAL_HIGH   (default 2 min)
 *   medium → MONITOR_INTERVAL_MEDIUM (default 5 min)
 *   low    → MONITOR_INTERVAL_LOW    (default 15 min)
 */

const COMPANIES = [
  // ─── FAANG / Big Tech ────────────────────────────────────────────────────
  { name: 'Google',       provider: 'greenhouse',      identifier: 'google',        careerUrl: 'https://careers.google.com',          category: 'big-tech',   priority: 'high',   active: true  },
  { name: 'Meta',         provider: 'greenhouse',      identifier: 'meta',          careerUrl: 'https://www.metacareers.com',          category: 'big-tech',   priority: 'high',   active: true  },
  { name: 'Netflix',      provider: 'lever',           identifier: 'netflix',       careerUrl: 'https://jobs.netflix.com',            category: 'big-tech',   priority: 'high',   active: true  },
  { name: 'Apple',        provider: 'greenhouse',      identifier: 'apple',         careerUrl: 'https://www.apple.com/jobs',          category: 'big-tech',   priority: 'high',   active: true  },

  // ─── Cloud / Enterprise Tech ─────────────────────────────────────────────
  { name: 'Stripe',       provider: 'greenhouse',      identifier: 'stripe',        careerUrl: 'https://stripe.com/jobs',             category: 'fintech',    priority: 'high',   active: true  },
  { name: 'Cloudflare',   provider: 'greenhouse',      identifier: 'cloudflare',    careerUrl: 'https://www.cloudflare.com/careers',  category: 'infra',      priority: 'high',   active: true  },
  { name: 'MongoDB',      provider: 'greenhouse',      identifier: 'mongodb',       careerUrl: 'https://www.mongodb.com/careers',     category: 'data',       priority: 'high',   active: true  },
  { name: 'Snowflake',    provider: 'greenhouse',      identifier: 'snowflake',     careerUrl: 'https://careers.snowflake.com',       category: 'data',       priority: 'high',   active: true  },
  { name: 'Databricks',   provider: 'greenhouse',      identifier: 'databricks',    careerUrl: 'https://databricks.com/company/careers', category: 'data',    priority: 'high',   active: true  },
  { name: 'HashiCorp',    provider: 'greenhouse',      identifier: 'hashicorp',     careerUrl: 'https://www.hashicorp.com/jobs',      category: 'infra',      priority: 'medium', active: true  },
  { name: 'Confluent',    provider: 'greenhouse',      identifier: 'confluent',     careerUrl: 'https://www.confluent.io/careers',    category: 'data',       priority: 'medium', active: true  },
  { name: 'Elastic',      provider: 'greenhouse',      identifier: 'elastic',       careerUrl: 'https://www.elastic.co/careers',      category: 'data',       priority: 'medium', active: true  },
  { name: 'Grafana Labs',  provider: 'greenhouse',     identifier: 'grafanalabs',   careerUrl: 'https://grafana.com/about/careers',   category: 'infra',      priority: 'medium', active: true  },
  { name: 'PagerDuty',    provider: 'greenhouse',      identifier: 'pagerduty',     careerUrl: 'https://www.pagerduty.com/careers',   category: 'infra',      priority: 'low',    active: true  },

  // ─── Developer Tools / Productivity ──────────────────────────────────────
  { name: 'Atlassian',    provider: 'lever',           identifier: 'atlassian',     careerUrl: 'https://www.atlassian.com/company/careers', category: 'dev-tools', priority: 'high', active: true },
  { name: 'GitHub',       provider: 'greenhouse',      identifier: 'github',        careerUrl: 'https://github.com/about/careers',    category: 'dev-tools',  priority: 'high',   active: true  },
  { name: 'GitLab',       provider: 'greenhouse',      identifier: 'gitlab',        careerUrl: 'https://about.gitlab.com/jobs',       category: 'dev-tools',  priority: 'high',   active: true  },
  { name: 'Vercel',       provider: 'greenhouse',      identifier: 'vercel',        careerUrl: 'https://vercel.com/careers',          category: 'dev-tools',  priority: 'high',   active: true  },
  { name: 'Linear',       provider: 'ashby',           identifier: 'linear',        careerUrl: 'https://linear.app/careers',          category: 'dev-tools',  priority: 'high',   active: true  },
  { name: 'Notion',       provider: 'greenhouse',      identifier: 'notion',        careerUrl: 'https://www.notion.so/careers',       category: 'productivity', priority: 'high', active: true  },
  { name: 'Figma',        provider: 'greenhouse',      identifier: 'figma',         careerUrl: 'https://www.figma.com/careers',       category: 'design',     priority: 'high',   active: true  },
  { name: 'Canva',        provider: 'greenhouse',      identifier: 'canva',         careerUrl: 'https://www.canva.com/careers',       category: 'design',     priority: 'high',   active: true  },
  { name: 'Miro',         provider: 'greenhouse',      identifier: 'miro',          careerUrl: 'https://miro.com/careers',            category: 'productivity', priority: 'medium', active: true },
  { name: 'Loom',         provider: 'greenhouse',      identifier: 'loom',          careerUrl: 'https://www.loom.com/careers',        category: 'productivity', priority: 'low',  active: true  },
  { name: 'Airtable',     provider: 'greenhouse',      identifier: 'airtable',      careerUrl: 'https://airtable.com/careers',        category: 'productivity', priority: 'medium', active: true },
  { name: 'Retool',       provider: 'greenhouse',      identifier: 'retool',        careerUrl: 'https://retool.com/careers',          category: 'dev-tools',  priority: 'medium', active: true  },

  // ─── AI / ML ──────────────────────────────────────────────────────────────
  { name: 'OpenAI',       provider: 'greenhouse',      identifier: 'openai',        careerUrl: 'https://openai.com/careers',          category: 'ai',         priority: 'high',   active: true  },
  { name: 'Anthropic',    provider: 'greenhouse',      identifier: 'anthropic',     careerUrl: 'https://www.anthropic.com/careers',   category: 'ai',         priority: 'high',   active: true  },
  { name: 'Hugging Face', provider: 'greenhouse',      identifier: 'huggingface',   careerUrl: 'https://huggingface.co/jobs',         category: 'ai',         priority: 'high',   active: true  },
  { name: 'Mistral AI',   provider: 'greenhouse',      identifier: 'mistral',       careerUrl: 'https://mistral.ai/careers',          category: 'ai',         priority: 'high',   active: true  },
  { name: 'Cohere',       provider: 'greenhouse',      identifier: 'cohere',        careerUrl: 'https://cohere.com/careers',          category: 'ai',         priority: 'high',   active: true  },
  { name: 'Scale AI',     provider: 'greenhouse',      identifier: 'scaleai',       careerUrl: 'https://scale.com/careers',           category: 'ai',         priority: 'high',   active: true  },
  { name: 'Stability AI', provider: 'greenhouse',      identifier: 'stabilityai',   careerUrl: 'https://stability.ai/careers',        category: 'ai',         priority: 'medium', active: true  },
  { name: 'Perplexity',   provider: 'greenhouse',      identifier: 'perplexity',    careerUrl: 'https://www.perplexity.ai/careers',   category: 'ai',         priority: 'high',   active: true  },
  { name: 'Together AI',  provider: 'greenhouse',      identifier: 'togetherai',    careerUrl: 'https://www.together.ai/careers',     category: 'ai',         priority: 'medium', active: true  },
  { name: 'Runway',       provider: 'greenhouse',      identifier: 'runwayml',      careerUrl: 'https://runwayml.com/careers',        category: 'ai',         priority: 'medium', active: true  },
  { name: 'Weights & Biases', provider: 'greenhouse', identifier: 'wandb',         careerUrl: 'https://wandb.ai/site/careers',       category: 'ai',         priority: 'medium', active: true  },
  { name: 'Replicate',    provider: 'greenhouse',      identifier: 'replicate',     careerUrl: 'https://replicate.com/careers',       category: 'ai',         priority: 'medium', active: true  },

  // ─── NVIDIA / Chip/Hardware ───────────────────────────────────────────────
  { name: 'NVIDIA',       provider: 'greenhouse',      identifier: 'nvidia',        careerUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers', category: 'hardware', priority: 'high', active: true },

  // ─── Fintech ──────────────────────────────────────────────────────────────
  { name: 'Coinbase',     provider: 'greenhouse',      identifier: 'coinbase',      careerUrl: 'https://www.coinbase.com/careers',    category: 'fintech',    priority: 'high',   active: true  },
  { name: 'Robinhood',    provider: 'greenhouse',      identifier: 'robinhood',     careerUrl: 'https://careers.robinhood.com',       category: 'fintech',    priority: 'high',   active: true  },
  { name: 'Plaid',        provider: 'greenhouse',      identifier: 'plaid',         careerUrl: 'https://plaid.com/careers',           category: 'fintech',    priority: 'high',   active: true  },
  { name: 'Brex',         provider: 'greenhouse',      identifier: 'brex',          careerUrl: 'https://www.brex.com/careers',        category: 'fintech',    priority: 'high',   active: true  },
  { name: 'Ramp',         provider: 'greenhouse',      identifier: 'ramp',          careerUrl: 'https://ramp.com/careers',            category: 'fintech',    priority: 'high',   active: true  },
  { name: 'Chime',        provider: 'greenhouse',      identifier: 'chime',         careerUrl: 'https://www.chime.com/careers',       category: 'fintech',    priority: 'medium', active: true  },
  { name: 'Affirm',       provider: 'greenhouse',      identifier: 'affirm',        careerUrl: 'https://www.affirm.com/careers',      category: 'fintech',    priority: 'medium', active: true  },
  { name: 'Klarna',       provider: 'greenhouse',      identifier: 'klarna',        careerUrl: 'https://www.klarna.com/careers',      category: 'fintech',    priority: 'medium', active: true  },
  { name: 'PayPal',       provider: 'greenhouse',      identifier: 'paypal',        careerUrl: 'https://careers.paypal.com',          category: 'fintech',    priority: 'medium', active: true  },
  { name: 'Block',        provider: 'greenhouse',      identifier: 'block',         careerUrl: 'https://block.xyz/careers',           category: 'fintech',    priority: 'medium', active: true  },

  // ─── HR / People Tech ─────────────────────────────────────────────────────
  { name: 'Rippling',     provider: 'greenhouse',      identifier: 'rippling',      careerUrl: 'https://www.rippling.com/careers',    category: 'hr-tech',    priority: 'high',   active: true  },
  { name: 'Deel',         provider: 'greenhouse',      identifier: 'deel',          careerUrl: 'https://www.deel.com/careers',        category: 'hr-tech',    priority: 'high',   active: true  },
  { name: 'Lattice',      provider: 'greenhouse',      identifier: 'lattice',       careerUrl: 'https://lattice.com/careers',         category: 'hr-tech',    priority: 'medium', active: true  },
  { name: 'Gusto',        provider: 'greenhouse',      identifier: 'gusto',         careerUrl: 'https://gusto.com/about/careers',     category: 'hr-tech',    priority: 'medium', active: true  },
  { name: 'Workday',      provider: 'greenhouse',      identifier: 'workday',       careerUrl: 'https://www.workday.com/en-us/company/careers.html', category: 'hr-tech', priority: 'low', active: true },

  // ─── E-commerce / Marketplace ─────────────────────────────────────────────
  { name: 'Shopify',      provider: 'greenhouse',      identifier: 'shopify',       careerUrl: 'https://www.shopify.com/careers',     category: 'ecommerce',  priority: 'high',   active: true  },
  { name: 'Airbnb',       provider: 'greenhouse',      identifier: 'airbnb',        careerUrl: 'https://careers.airbnb.com',          category: 'marketplace',priority: 'high',   active: true  },
  { name: 'DoorDash',     provider: 'greenhouse',      identifier: 'doordash',      careerUrl: 'https://careers.doordash.com',        category: 'marketplace',priority: 'high',   active: true  },
  { name: 'Instacart',    provider: 'greenhouse',      identifier: 'instacart',     careerUrl: 'https://instacart.careers',           category: 'marketplace',priority: 'medium', active: true  },
  { name: 'eBay',         provider: 'greenhouse',      identifier: 'ebay',          careerUrl: 'https://jobs.ebayinc.com',            category: 'ecommerce',  priority: 'low',    active: true  },

  // ─── Ride / Mobility ──────────────────────────────────────────────────────
  { name: 'Uber',         provider: 'greenhouse',      identifier: 'uber',          careerUrl: 'https://www.uber.com/us/en/careers',  category: 'mobility',   priority: 'high',   active: true  },
  { name: 'Lyft',         provider: 'greenhouse',      identifier: 'lyft',          careerUrl: 'https://www.lyft.com/careers',        category: 'mobility',   priority: 'high',   active: true  },

  // ─── CRM / Sales / Marketing Tech ────────────────────────────────────────
  { name: 'Salesforce',   provider: 'greenhouse',      identifier: 'salesforce',    careerUrl: 'https://careers.salesforce.com',      category: 'enterprise', priority: 'medium', active: true  },
  { name: 'HubSpot',      provider: 'greenhouse',      identifier: 'hubspot',       careerUrl: 'https://www.hubspot.com/careers',     category: 'saas',       priority: 'medium', active: true  },
  { name: 'Intercom',     provider: 'greenhouse',      identifier: 'intercom',      careerUrl: 'https://www.intercom.com/careers',    category: 'saas',       priority: 'medium', active: true  },
  { name: 'Zendesk',      provider: 'greenhouse',      identifier: 'zendesk',       careerUrl: 'https://www.zendesk.com/jobs',        category: 'saas',       priority: 'low',    active: true  },
  { name: 'Twilio',       provider: 'greenhouse',      identifier: 'twilio',        careerUrl: 'https://www.twilio.com/en-us/company/jobs', category: 'saas', priority: 'medium', active: true  },
  { name: 'Segment',      provider: 'greenhouse',      identifier: 'segment',       careerUrl: 'https://segment.com/jobs',            category: 'data',       priority: 'low',    active: true  },
  { name: 'Amplitude',    provider: 'greenhouse',      identifier: 'amplitude',     careerUrl: 'https://amplitude.com/careers',       category: 'data',       priority: 'medium', active: true  },
  { name: 'Mixpanel',     provider: 'greenhouse',      identifier: 'mixpanel',      careerUrl: 'https://mixpanel.com/jobs',           category: 'data',       priority: 'low',    active: true  },

  // ─── Security ────────────────────────────────────────────────────────────
  { name: 'CrowdStrike',  provider: 'greenhouse',      identifier: 'crowdstrike',   careerUrl: 'https://www.crowdstrike.com/careers', category: 'security',   priority: 'medium', active: true  },
  { name: 'Okta',         provider: 'greenhouse',      identifier: 'okta',          careerUrl: 'https://www.okta.com/company/careers', category: 'security',  priority: 'medium', active: true  },
  { name: 'Snyk',         provider: 'greenhouse',      identifier: 'snyk',          careerUrl: 'https://snyk.io/careers',             category: 'security',   priority: 'medium', active: true  },
  { name: 'Lacework',     provider: 'greenhouse',      identifier: 'lacework',      careerUrl: 'https://www.lacework.com/careers',    category: 'security',   priority: 'low',    active: true  },

  // ─── Communication / Social ────────────────────────────────────────────
  { name: 'Discord',      provider: 'greenhouse',      identifier: 'discord',       careerUrl: 'https://discord.com/jobs',            category: 'social',     priority: 'high',   active: true  },
  { name: 'Slack',        provider: 'greenhouse',      identifier: 'slack',         careerUrl: 'https://slack.com/careers',           category: 'productivity', priority: 'medium', active: true },
  { name: 'Zoom',         provider: 'greenhouse',      identifier: 'zoom',          careerUrl: 'https://careers.zoom.us',             category: 'communication', priority: 'medium', active: true },
  { name: 'Calendly',     provider: 'greenhouse',      identifier: 'calendly',      careerUrl: 'https://calendly.com/jobs',           category: 'productivity', priority: 'low',  active: true  },

  // ─── Media / Streaming ────────────────────────────────────────────────────
  { name: 'Spotify',      provider: 'greenhouse',      identifier: 'spotify',       careerUrl: 'https://www.lifeatspotify.com',       category: 'media',      priority: 'high',   active: true  },
  { name: 'Twitch',       provider: 'greenhouse',      identifier: 'twitch',        careerUrl: 'https://www.twitch.tv/jobs',          category: 'media',      priority: 'medium', active: true  },
  { name: 'Reddit',       provider: 'greenhouse',      identifier: 'reddit',        careerUrl: 'https://www.redditinc.com/careers',   category: 'social',     priority: 'medium', active: true  },
  { name: 'Pinterest',    provider: 'greenhouse',      identifier: 'pinterest',     careerUrl: 'https://careers.pinterest.com',       category: 'social',     priority: 'medium', active: true  },
  { name: 'Snap',         provider: 'greenhouse',      identifier: 'snap',          careerUrl: 'https://careers.snap.com',            category: 'social',     priority: 'medium', active: true  },

  // ─── Gaming ───────────────────────────────────────────────────────────────
  { name: 'Roblox',       provider: 'greenhouse',      identifier: 'roblox',        careerUrl: 'https://corp.roblox.com/careers',     category: 'gaming',     priority: 'medium', active: true  },
  { name: 'Riot Games',   provider: 'greenhouse',      identifier: 'riotgames',     careerUrl: 'https://www.riotgames.com/en/work-with-us', category: 'gaming', priority: 'medium', active: true },
  { name: 'Unity',        provider: 'greenhouse',      identifier: 'unity',         careerUrl: 'https://careers.unity.com',           category: 'gaming',     priority: 'low',    active: true  },

  // ─── HealthTech ───────────────────────────────────────────────────────────
  { name: 'Oscar Health', provider: 'greenhouse',      identifier: 'oscar',         careerUrl: 'https://www.hioscar.com/careers',     category: 'healthtech', priority: 'medium', active: true  },
  { name: 'Devoted Health', provider: 'greenhouse',   identifier: 'devoted',       careerUrl: 'https://www.devoted.com/careers',     category: 'healthtech', priority: 'low',    active: true  },
  { name: 'Headspace',    provider: 'greenhouse',      identifier: 'headspace',     careerUrl: 'https://www.headspace.com/careers',   category: 'healthtech', priority: 'low',    active: true  },

  // ─── EdTech ───────────────────────────────────────────────────────────────
  { name: 'Duolingo',     provider: 'greenhouse',      identifier: 'duolingo',      careerUrl: 'https://careers.duolingo.com',        category: 'edtech',     priority: 'medium', active: true  },
  { name: 'Coursera',     provider: 'greenhouse',      identifier: 'coursera',      careerUrl: 'https://careers.coursera.org',        category: 'edtech',     priority: 'low',    active: true  },

  // ─── PropTech / Real Estate ───────────────────────────────────────────────
  { name: 'Opendoor',     provider: 'greenhouse',      identifier: 'opendoor',      careerUrl: 'https://www.opendoor.com/w/careers',  category: 'proptech',   priority: 'low',    active: true  },

  // ─── Logistics / Supply Chain ─────────────────────────────────────────────
  { name: 'Flexport',     provider: 'greenhouse',      identifier: 'flexport',      careerUrl: 'https://www.flexport.com/careers',    category: 'logistics',  priority: 'medium', active: true  },

  // ─── Space / Deep Tech ────────────────────────────────────────────────────
  { name: 'SpaceX',       provider: 'greenhouse',      identifier: 'spacex',        careerUrl: 'https://www.spacex.com/careers',      category: 'deeptech',   priority: 'medium', active: true  },

  // ─── Consulting / Services ────────────────────────────────────────────────
  { name: 'Palantir',     provider: 'greenhouse',      identifier: 'palantir',      careerUrl: 'https://www.palantir.com/careers',    category: 'enterprise', priority: 'high',   active: true  },

  // ─── Remote-First / Distributed ──────────────────────────────────────────
  { name: 'Automattic',   provider: 'greenhouse',      identifier: 'automattic',    careerUrl: 'https://automattic.com/work-with-us', category: 'remote-first', priority: 'medium', active: true },
  { name: 'Basecamp',     provider: 'lever',           identifier: 'basecamp',      careerUrl: 'https://basecamp.com/jobs',           category: 'remote-first', priority: 'low',  active: true  },
  { name: 'Buffer',       provider: 'greenhouse',      identifier: 'buffer',        careerUrl: 'https://buffer.com/journey',          category: 'remote-first', priority: 'low',  active: true  },
  { name: 'Doist',        provider: 'lever',           identifier: 'doist',         careerUrl: 'https://doist.com/careers',           category: 'remote-first', priority: 'low',  active: true  },

  // ─── Infrastructure / Cloud Native ───────────────────────────────────────
  { name: 'Fastly',       provider: 'greenhouse',      identifier: 'fastly',        careerUrl: 'https://www.fastly.com/about/careers', category: 'infra',     priority: 'low',    active: true  },
  { name: 'Datadog',      provider: 'greenhouse',      identifier: 'datadog',       careerUrl: 'https://www.datadoghq.com/careers',   category: 'infra',      priority: 'high',   active: true  },
  { name: 'New Relic',    provider: 'greenhouse',      identifier: 'newrelic',      careerUrl: 'https://newrelic.com/about/careers',  category: 'infra',      priority: 'low',    active: true  },
  { name: 'Supabase',     provider: 'greenhouse',      identifier: 'supabase',      careerUrl: 'https://supabase.com/careers',        category: 'dev-tools',  priority: 'high',   active: true  },
  { name: 'PlanetScale',  provider: 'greenhouse',      identifier: 'planetscale',   careerUrl: 'https://planetscale.com/careers',     category: 'dev-tools',  priority: 'medium', active: true  },
  { name: 'Neon',         provider: 'greenhouse',      identifier: 'neondatabase',  careerUrl: 'https://neon.tech/careers',           category: 'dev-tools',  priority: 'medium', active: true  },

  // ─── Indian Tech Unicorns ─────────────────────────────────────────────────
  { name: 'Razorpay',     provider: 'lever',           identifier: 'razorpay',      careerUrl: 'https://razorpay.com/jobs',           category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'CRED',         provider: 'lever',           identifier: 'cred',          careerUrl: 'https://careers.cred.club',           category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'Swiggy',       provider: 'lever',           identifier: 'swiggy',        careerUrl: 'https://careers.swiggy.com',          category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'Zomato',       provider: 'lever',           identifier: 'zomato',        careerUrl: 'https://www.zomato.com/careers',      category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'Flipkart',     provider: 'lever',           identifier: 'flipkart',      careerUrl: 'https://www.flipkartcareers.com',     category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'Meesho',       provider: 'greenhouse',      identifier: 'meesho',        careerUrl: 'https://meesho.io/jobs',              category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'Zepto',        provider: 'greenhouse',      identifier: 'zepto',         careerUrl: 'https://www.zeptonow.com/careers',    category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'PhonePe',      provider: 'lever',           identifier: 'phonepe',       careerUrl: 'https://careers.phonepe.com',         category: 'india-unicorn', priority: 'high', active: true  },
  { name: 'Paytm',        provider: 'greenhouse',      identifier: 'paytm',         careerUrl: 'https://paytm.com/care/career',       category: 'india-unicorn', priority: 'medium', active: true },
  { name: 'Ola',          provider: 'lever',           identifier: 'ola',           careerUrl: 'https://ola.careers',                 category: 'india-unicorn', priority: 'medium', active: true },
  { name: 'Dream11',      provider: 'greenhouse',      identifier: 'dream11',       careerUrl: 'https://dream11.com/careers',         category: 'india-unicorn', priority: 'medium', active: true },
  { name: 'BrowserStack', provider: 'greenhouse',      identifier: 'browserstack',  careerUrl: 'https://www.browserstack.com/careers', category: 'india-unicorn', priority: 'medium', active: true },
  { name: 'Postman',      provider: 'greenhouse',      identifier: 'postman',       careerUrl: 'https://www.postman.com/careers',     category: 'dev-tools',  priority: 'high',   active: true  },
  { name: 'CleverTap',    provider: 'greenhouse',      identifier: 'clevertap',     careerUrl: 'https://clevertap.com/careers',       category: 'india-unicorn', priority: 'low',  active: true  },
  { name: 'InMobi',       provider: 'greenhouse',      identifier: 'inmobi',        careerUrl: 'https://www.inmobi.com/careers',      category: 'india-unicorn', priority: 'low',  active: true  },

  // ─── Unicorns & High-Growth Startups ─────────────────────────────────────
  { name: 'Figma',        provider: 'greenhouse',      identifier: 'figma',         careerUrl: 'https://www.figma.com/careers',       category: 'design',     priority: 'high',   active: true  },
  { name: 'Airtable',     provider: 'greenhouse',      identifier: 'airtable',      careerUrl: 'https://airtable.com/careers',        category: 'productivity', priority: 'medium', active: true },
  { name: 'Scale AI',     provider: 'greenhouse',      identifier: 'scaleai',       careerUrl: 'https://scale.com/careers',           category: 'ai',         priority: 'high',   active: true  },
  { name: 'Anduril',      provider: 'greenhouse',      identifier: 'anduril',       careerUrl: 'https://www.anduril.com/careers',     category: 'deeptech',   priority: 'medium', active: true  },
  { name: 'Navan',        provider: 'greenhouse',      identifier: 'navan',         careerUrl: 'https://navan.com/careers',           category: 'hr-tech',    priority: 'medium', active: true  },
  { name: 'Carta',        provider: 'greenhouse',      identifier: 'carta',         careerUrl: 'https://carta.com/careers',           category: 'fintech',    priority: 'medium', active: true  },
  { name: 'Faire',        provider: 'greenhouse',      identifier: 'faire',         careerUrl: 'https://www.faire.com/careers',       category: 'ecommerce',  priority: 'medium', active: true  },
  { name: 'Checkr',       provider: 'greenhouse',      identifier: 'checkr',        careerUrl: 'https://checkr.com/careers',          category: 'hr-tech',    priority: 'low',    active: true  },
  { name: 'Coda',         provider: 'greenhouse',      identifier: 'coda',          careerUrl: 'https://coda.io/careers',             category: 'productivity', priority: 'low',  active: true  },
  { name: 'Weights & Biases', provider: 'greenhouse', identifier: 'wandb',         careerUrl: 'https://wandb.ai/site/careers',       category: 'ai',         priority: 'medium', active: true  },
  { name: 'Labelbox',     provider: 'greenhouse',      identifier: 'labelbox',      careerUrl: 'https://labelbox.com/careers',        category: 'ai',         priority: 'low',    active: true  },
  { name: 'Roboflow',     provider: 'greenhouse',      identifier: 'roboflow',      careerUrl: 'https://roboflow.com/careers',        category: 'ai',         priority: 'low',    active: true  },

  // ─── Adobe / Creative ────────────────────────────────────────────────────
  { name: 'Adobe',        provider: 'greenhouse',      identifier: 'adobe',         careerUrl: 'https://www.adobe.com/careers.html',  category: 'enterprise', priority: 'medium', active: true  },

  // ─── Oracle / SAP / Enterprise ───────────────────────────────────────────
  { name: 'Oracle',       provider: 'greenhouse',      identifier: 'oracle',        careerUrl: 'https://www.oracle.com/corporate/careers', category: 'enterprise', priority: 'low', active: true },

  // ─── Open Source / OSS-driven ────────────────────────────────────────────
  { name: 'Red Hat',      provider: 'greenhouse',      identifier: 'redhat',        careerUrl: 'https://www.redhat.com/en/jobs',      category: 'enterprise', priority: 'low',    active: true  },
  { name: 'Canonical',    provider: 'greenhouse',      identifier: 'canonical',     careerUrl: 'https://canonical.com/careers',       category: 'infra',      priority: 'low',    active: true  },

  // ─── VC-backed Breakouts ─────────────────────────────────────────────────
  { name: 'Glean',        provider: 'greenhouse',      identifier: 'glean',         careerUrl: 'https://glean.com/careers',           category: 'ai',         priority: 'high',   active: true  },
  { name: 'Hex',          provider: 'greenhouse',      identifier: 'hex',           careerUrl: 'https://hex.tech/careers',            category: 'data',       priority: 'medium', active: true  },
  { name: 'dbt Labs',     provider: 'greenhouse',      identifier: 'dbtlabs',       careerUrl: 'https://www.getdbt.com/careers',      category: 'data',       priority: 'medium', active: true  },
  { name: 'Airbyte',      provider: 'greenhouse',      identifier: 'airbyte',       careerUrl: 'https://airbyte.com/careers',         category: 'data',       priority: 'medium', active: true  },
  { name: 'Fivetran',     provider: 'greenhouse',      identifier: 'fivetran',      careerUrl: 'https://www.fivetran.com/careers',    category: 'data',       priority: 'medium', active: true  },
  { name: 'Stytch',       provider: 'greenhouse',      identifier: 'stytch',        careerUrl: 'https://stytch.com/careers',          category: 'security',   priority: 'medium', active: true  },
  { name: 'Clerk',        provider: 'greenhouse',      identifier: 'clerk',         careerUrl: 'https://clerk.com/careers',           category: 'security',   priority: 'medium', active: true  },
  { name: 'Temporal',     provider: 'greenhouse',      identifier: 'temporal',      careerUrl: 'https://temporal.io/careers',         category: 'infra',      priority: 'medium', active: true  },
  { name: 'Redpanda',     provider: 'greenhouse',      identifier: 'redpanda',      careerUrl: 'https://redpanda.com/careers',        category: 'infra',      priority: 'low',    active: true  },
  { name: 'SingleStore',  provider: 'greenhouse',      identifier: 'singlestore',   careerUrl: 'https://www.singlestore.com/careers', category: 'data',       priority: 'low',    active: true  },
  { name: 'Chainguard',   provider: 'greenhouse',      identifier: 'chainguard',    careerUrl: 'https://www.chainguard.dev/careers',  category: 'security',   priority: 'low',    active: true  },
  { name: 'Teleport',     provider: 'greenhouse',      identifier: 'goteleport',    careerUrl: 'https://goteleport.com/careers',      category: 'security',   priority: 'low',    active: true  },

  // ─── Crypto / Web3 ───────────────────────────────────────────────────────
  { name: 'Alchemy',      provider: 'greenhouse',      identifier: 'alchemy',       careerUrl: 'https://www.alchemy.com/careers',     category: 'web3',       priority: 'medium', active: true  },
  { name: 'Consensys',    provider: 'greenhouse',      identifier: 'consensys',     careerUrl: 'https://consensys.io/careers',        category: 'web3',       priority: 'low',    active: true  },
  { name: 'Chainalysis',  provider: 'greenhouse',      identifier: 'chainalysis',   careerUrl: 'https://www.chainalysis.com/careers', category: 'web3',       priority: 'low',    active: true  },

  // ─── Climate / Sustainability ────────────────────────────────────────────
  { name: 'Watershed',    provider: 'greenhouse',      identifier: 'watershed',     careerUrl: 'https://watershed.com/careers',       category: 'climate',    priority: 'medium', active: true  },
  { name: 'Arcadia',      provider: 'greenhouse',      identifier: 'arcadia',       careerUrl: 'https://www.arcadia.com/careers',     category: 'climate',    priority: 'low',    active: true  },

  // ─── Professional Networks / Recruiting ──────────────────────────────────
  { name: 'LinkedIn',     provider: 'greenhouse',      identifier: 'linkedin',      careerUrl: 'https://careers.linkedin.com',        category: 'social',     priority: 'medium', active: true  },
  { name: 'AngelList',    provider: 'greenhouse',      identifier: 'angellist',     careerUrl: 'https://angel.co/company/angellist/jobs', category: 'recruiting', priority: 'low', active: true },
  { name: 'Greenhouse',   provider: 'greenhouse',      identifier: 'greenhouse',    careerUrl: 'https://www.greenhouse.io/careers',   category: 'hr-tech',    priority: 'low',    active: true  },
  { name: 'Lever',        provider: 'lever',           identifier: 'lever',         careerUrl: 'https://www.lever.co/careers',        category: 'hr-tech',    priority: 'low',    active: true  },
  { name: 'Ashby',        provider: 'ashby',           identifier: 'ashby',         careerUrl: 'https://www.ashbyhq.com/careers',     category: 'hr-tech',    priority: 'low',    active: true  },

  // ─── Additional High-Demand ───────────────────────────────────────────────
  { name: 'Pendo',        provider: 'greenhouse',      identifier: 'pendo',         careerUrl: 'https://www.pendo.io/careers',        category: 'saas',       priority: 'low',    active: true  },
  { name: 'FullStory',    provider: 'greenhouse',      identifier: 'fullstory',     careerUrl: 'https://www.fullstory.com/careers',   category: 'saas',       priority: 'low',    active: true  },
  { name: 'Heap',         provider: 'greenhouse',      identifier: 'heap',          careerUrl: 'https://heap.io/careers',             category: 'data',       priority: 'low',    active: true  },
  { name: 'LaunchDarkly', provider: 'greenhouse',      identifier: 'launchdarkly',  careerUrl: 'https://launchdarkly.com/careers',    category: 'dev-tools',  priority: 'medium', active: true  },
  { name: 'Split',        provider: 'greenhouse',      identifier: 'split',         careerUrl: 'https://www.split.io/careers',        category: 'dev-tools',  priority: 'low',    active: true  },
  { name: 'Statsig',      provider: 'greenhouse',      identifier: 'statsig',       careerUrl: 'https://www.statsig.com/careers',     category: 'dev-tools',  priority: 'medium', active: true  },
];

// ─── Dedup by identifier+provider to guard against copy-paste duplicates ────
const seen = new Set();
const COMPANY_REGISTRY = COMPANIES.filter((c) => {
  const key = `${c.provider}:${c.identifier}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// ─── Priority interval map (minutes) ─────────────────────────────────────────
const PRIORITY_INTERVALS = {
  high:   parseInt(process.env.MONITOR_INTERVAL_HIGH   || '2',  10),
  medium: parseInt(process.env.MONITOR_INTERVAL_MEDIUM || '5',  10),
  low:    parseInt(process.env.MONITOR_INTERVAL_LOW    || '15', 10),
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** All active companies */
const getActiveCompanies = () => COMPANY_REGISTRY.filter((c) => c.active);

/** Active companies by priority tier */
const getCompaniesByPriority = (priority) =>
  COMPANY_REGISTRY.filter((c) => c.active && c.priority === priority);

/** Active companies by ATS provider */
const getCompaniesByProvider = (provider) =>
  COMPANY_REGISTRY.filter((c) => c.active && c.provider === provider);

/** Active companies by category */
const getCompaniesByCategory = (category) =>
  COMPANY_REGISTRY.filter((c) => c.active && c.category === category);

/** Look up a single company by provider + identifier */
const getCompany = (provider, identifier) =>
  COMPANY_REGISTRY.find((c) => c.provider === provider && c.identifier === identifier) || null;

/** Summary stats */
const getRegistryStats = () => ({
  total: COMPANY_REGISTRY.length,
  active: COMPANY_REGISTRY.filter((c) => c.active).length,
  byPriority: {
    high:   COMPANY_REGISTRY.filter((c) => c.active && c.priority === 'high').length,
    medium: COMPANY_REGISTRY.filter((c) => c.active && c.priority === 'medium').length,
    low:    COMPANY_REGISTRY.filter((c) => c.active && c.priority === 'low').length,
  },
  byProvider: {
    greenhouse: COMPANY_REGISTRY.filter((c) => c.active && c.provider === 'greenhouse').length,
    lever:      COMPANY_REGISTRY.filter((c) => c.active && c.provider === 'lever').length,
    ashby:      COMPANY_REGISTRY.filter((c) => c.active && c.provider === 'ashby').length,
  },
  byCategory: COMPANY_REGISTRY.reduce((acc, c) => {
    if (!c.active) return acc;
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {}),
});

module.exports = {
  COMPANY_REGISTRY,
  PRIORITY_INTERVALS,
  getActiveCompanies,
  getCompaniesByPriority,
  getCompaniesByProvider,
  getCompaniesByCategory,
  getCompany,
  getRegistryStats,
};
