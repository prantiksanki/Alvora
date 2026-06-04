const crypto = require('crypto');

const makeHash = (...parts) =>
  crypto.createHash('sha256').update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 32);

const normalizeEmploymentType = (raw) => {
  const r = (raw || '').toLowerCase();
  if (r.includes('full')) return 'full_time';
  if (r.includes('part')) return 'part_time';
  if (r.includes('contract') || r.includes('freelance')) return 'contract';
  if (r.includes('intern')) return 'internship';
  return 'full_time';
};

const inferRemote = (locationStr) =>
  (locationStr || '').toLowerCase().includes('remote');

/**
 * Normalize a raw Greenhouse job object into the unified job format.
 * @param {object} raw - Raw job from Greenhouse boards API
 * @param {string} companySlug - Company identifier used in the API call
 */
const normalizeGreenhouseJob = (raw, companySlug) => {
  const locationName = raw.location?.name || null;
  const employmentRaw = raw.metadata?.find?.(m => m.name === 'Employment Type')?.value || '';

  // Extract tags from department and office fields
  const tags = [];
  if (raw.departments?.length) tags.push(...raw.departments.map(d => d.name).filter(Boolean));
  if (raw.offices?.length) tags.push(...raw.offices.map(o => o.name).filter(Boolean));

  return {
    company: companySlug.toLowerCase(),
    title: raw.title || '',
    location: locationName,
    employmentType: normalizeEmploymentType(employmentRaw),
    remote: inferRemote(locationName),
    source: 'greenhouse',
    externalJobId: raw.id.toString(),
    applyUrl: raw.absolute_url || null,
    description: raw.content || null,
    postedAt: raw.updated_at ? new Date(raw.updated_at) : null,
    detectedAt: new Date(),
    tags,
    contentHash: makeHash(raw.title, locationName, raw.content),
  };
};

/**
 * Normalize a raw Lever posting object into the unified job format.
 * @param {object} raw - Raw posting from Lever postings API
 * @param {string} companySlug - Company identifier used in the API call
 */
const normalizeLeverJob = (raw, companySlug) => {
  const locationStr = raw.categories?.location || null;
  const commitment = raw.categories?.commitment || '';
  const team = raw.categories?.team || null;

  const tags = [];
  if (team) tags.push(team);
  if (raw.tags?.length) tags.push(...raw.tags);

  const isRemote =
    raw.workplaceType === 'remote' || inferRemote(locationStr);

  return {
    company: companySlug.toLowerCase(),
    title: raw.text || '',
    location: locationStr,
    employmentType: normalizeEmploymentType(commitment),
    remote: isRemote,
    source: 'lever',
    externalJobId: raw.id,
    applyUrl: raw.hostedUrl || raw.applyUrl || null,
    description: raw.descriptionPlain || raw.description || null,
    postedAt: raw.createdAt ? new Date(raw.createdAt) : null,
    detectedAt: new Date(),
    tags,
    contentHash: makeHash(raw.text, locationStr, raw.descriptionPlain),
  };
};

module.exports = { normalizeGreenhouseJob, normalizeLeverJob, makeHash };
