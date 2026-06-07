import { useState } from 'react';

/**
 * Maps company slugs (lowercase, from JobPosting.company) to their real domains.
 * Only needed for slugs that don't match the pattern {slug}.com
 */
const DOMAIN_OVERRIDES = {
  // Big Tech
  'google': 'google.com',
  'meta': 'meta.com',
  'netflix': 'netflix.com',
  'apple': 'apple.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com',

  // Dev Tools / Productivity
  'gitlab': 'gitlab.com',
  'github': 'github.com',
  'atlassian': 'atlassian.com',
  'figma': 'figma.com',
  'notion': 'notion.so',
  'vercel': 'vercel.com',
  'linear': 'linear.app',
  'miro': 'miro.com',
  'loom': 'loom.com',
  'airtable': 'airtable.com',
  'retool': 'retool.com',

  // AI
  'openai': 'openai.com',
  'anthropic': 'anthropic.com',
  'mistral': 'mistral.ai',
  'cohere': 'cohere.com',
  'scaleai': 'scale.com',
  'stabilityai': 'stability.ai',
  'perplexity': 'perplexity.ai',
  'togetherai': 'together.ai',
  'runwayml': 'runwayml.com',
  'runway': 'runwayml.com',
  'huggingface': 'huggingface.co',
  'wandb': 'wandb.ai',
  'glean': 'glean.com',
  'labelbox': 'labelbox.com',
  'roboflow': 'roboflow.com',

  // Cloud / Infra
  'cloudflare': 'cloudflare.com',
  'mongodb': 'mongodb.com',
  'snowflake': 'snowflake.com',
  'databricks': 'databricks.com',
  'datadog': 'datadoghq.com',
  'hashicorp': 'hashicorp.com',
  'confluent': 'confluent.io',
  'elastic': 'elastic.co',
  'grafanalabs': 'grafana.com',
  'pagerduty': 'pagerduty.com',
  'newrelic': 'newrelic.com',
  'supabase': 'supabase.com',
  'planetscale': 'planetscale.com',
  'temporal': 'temporal.io',
  'redpanda': 'redpanda.com',
  'goteleport': 'goteleport.com',
  'chainguard': 'chainguard.dev',

  // Fintech
  'stripe': 'stripe.com',
  'coinbase': 'coinbase.com',
  'robinhood': 'robinhood.com',
  'plaid': 'plaid.com',
  'brex': 'brex.com',
  'ramp': 'ramp.com',
  'chime': 'chime.com',
  'affirm': 'affirm.com',
  'klarna': 'klarna.com',
  'paypal': 'paypal.com',
  'block': 'block.xyz',
  'carta': 'carta.com',

  // HR Tech
  'rippling': 'rippling.com',
  'deel': 'deel.com',
  'lattice': 'lattice.com',
  'gusto': 'gusto.com',
  'workday': 'workday.com',
  'navan': 'navan.com',
  'checkr': 'checkr.com',

  // E-commerce / Marketplace
  'shopify': 'shopify.com',
  'airbnb': 'airbnb.com',
  'doordash': 'doordash.com',
  'instacart': 'instacart.com',
  'ebay': 'ebay.com',
  'faire': 'faire.com',

  // Mobility
  'uber': 'uber.com',
  'lyft': 'lyft.com',

  // SaaS
  'salesforce': 'salesforce.com',
  'hubspot': 'hubspot.com',
  'intercom': 'intercom.com',
  'zendesk': 'zendesk.com',
  'twilio': 'twilio.com',
  'segment': 'segment.com',
  'amplitude': 'amplitude.com',
  'mixpanel': 'mixpanel.com',
  'pendo': 'pendo.io',
  'fullstory': 'fullstory.com',
  'heap': 'heap.io',
  'launchdarkly': 'launchdarkly.com',
  'statsig': 'statsig.com',
  'coda': 'coda.io',

  // Security
  'crowdstrike': 'crowdstrike.com',
  'okta': 'okta.com',
  'snyk': 'snyk.io',
  'lacework': 'lacework.com',
  'stytch': 'stytch.com',
  'clerk': 'clerk.com',
  'chainalysis': 'chainalysis.com',

  // Social / Communication
  'discord': 'discord.com',
  'slack': 'slack.com',
  'zoom': 'zoom.us',
  'calendly': 'calendly.com',
  'reddit': 'reddit.com',
  'pinterest': 'pinterest.com',
  'snap': 'snap.com',
  'linkedin': 'linkedin.com',
  'angellist': 'angel.co',

  // Media / Streaming
  'spotify': 'spotify.com',
  'twitch': 'twitch.tv',

  // Gaming
  'roblox': 'roblox.com',
  'riotgames': 'riotgames.com',
  'unity': 'unity.com',

  // Data / Analytics
  'hex': 'hex.tech',
  'dbtlabs': 'getdbt.com',
  'airbyte': 'airbyte.com',
  'fivetran': 'fivetran.com',
  'singlestore': 'singlestore.com',
  'redhat': 'redhat.com',
  'canonical': 'canonical.com',
  'oracle': 'oracle.com',
  'adobe': 'adobe.com',

  // EdTech
  'duolingo': 'duolingo.com',
  'coursera': 'coursera.org',

  // Other
  'andurilindustries': 'anduril.com',
  'spacex': 'spacex.com',
  'palantir': 'palantir.com',
  'automattic': 'automattic.com',
  'buffer': 'buffer.com',
  'flexport': 'flexport.com',
  'opendoor': 'opendoor.com',
  'watershed': 'watershed.com',
  'alchemy': 'alchemy.com',
  'consensys': 'consensys.io',
  'postman': 'postman.com',
  'browserstack': 'browserstack.com',
  'razorpay': 'razorpay.com',
  'nvidia': 'nvidia.com',
  'greenhouse': 'greenhouse.io',
  'lever': 'lever.co',
  'ashby': 'ashbyhq.com',

  // Indian unicorns
  'cred': 'cred.club',
  'swiggy': 'swiggy.com',
  'zomato': 'zomato.com',
  'flipkart': 'flipkart.com',
  'meesho': 'meesho.com',
  'zepto': 'zeptonow.com',
  'phonepe': 'phonepe.com',
  'paytm': 'paytm.com',
  'ola': 'olacabs.com',
  'dream11': 'dream11.com',
  'inmobi': 'inmobi.com',
  'clevertap': 'clevertap.com',

  // Crypto/Web3
  'chainalysis': 'chainalysis.com',
  'arcadia': 'arcadia.com',

  // Workday companies
  'adobe': 'adobe.com',
  'nvidia-workday': 'nvidia.com',
};

/**
 * Get the Clearbit logo URL for a company slug.
 * Falls back to null if the domain can't be determined.
 */
const getLogoUrl = (companySlug) => {
  if (!companySlug) return null;
  const slug = companySlug.toLowerCase().trim();
  const domain = DOMAIN_OVERRIDES[slug] || `${slug}.com`;
  return `https://logo.clearbit.com/${domain}`;
};

/**
 * CompanyLogo — shows a real company logo via Clearbit.
 * Falls back to the gradient-initial avatar on load error.
 *
 * Props:
 *   company   — company slug from JobPosting (e.g. "stripe", "airbnb")
 *   size      — CSS size class (default "w-10 h-10")
 *   gradient  — Tailwind gradient classes for the fallback avatar
 */
const CompanyLogo = ({ company, size = 'w-10 h-10', gradient = 'from-violet-500 to-purple-600' }) => {
  const [imgError, setImgError] = useState(false);

  const logoUrl = getLogoUrl(company);
  const initials = (company || '?')
    .split(/[\s-]/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!imgError && logoUrl) {
    return (
      <div className={`${size} rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-lg`}>
        <img
          src={logoUrl}
          alt={company}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: gradient avatar with initials
  return (
    <div
      className={`${size} rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg`}
    >
      {initials}
    </div>
  );
};

export default CompanyLogo;
