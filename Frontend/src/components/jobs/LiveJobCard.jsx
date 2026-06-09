import { motion } from 'framer-motion';
import { MapPin, Wifi, Briefcase, ExternalLink, Clock } from 'lucide-react';
import ApplyButton from './ApplyButton';
import CompanyLogo from './CompanyLogo';

const SOURCE_STYLES = {
  greenhouse: { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  lever:      { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.2)'  },
  ashby:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',border: 'rgba(167,139,250,0.2)' },
  workday:    { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)'  },
  company_api:{ color: '#9ca3af', bg: 'rgba(156,163,175,0.1)',border: 'rgba(156,163,175,0.2)' },
};

const EMPLOYMENT_LABELS = {
  full_time: 'Full-time', part_time: 'Part-time',
  contract: 'Contract',   internship: 'Internship',
};

const GRADIENT_PAIRS = [
  ['#8b5cf6','#6d28d9'], ['#06b6d4','#0284c7'], ['#10b981','#047857'],
  ['#f59e0b','#d97706'], ['#ec4899','#be185d'], ['#6366f1','#4338ca'],
];

const getGradient = (company) => GRADIENT_PAIRS[(company?.charCodeAt(0) || 0) % GRADIENT_PAIRS.length];

function timeAgo(date) {
  if (!date) return '';
  const diff = (Date.now() - new Date(date).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

function stripHtml(str) {
  if (!str) return '';
  // Decode HTML entities first (handles double-encoded strings like &lt;div&gt;)
  const decoded = str
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ');
  // Strip all HTML tags, then collapse whitespace
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const LiveJobCard = ({ job, index = 0, isNew = false, isApplied = false, onApplied, compact = false }) => {
  const timeSinceDetected = job.detectedAt
    ? (Date.now() - new Date(job.detectedAt).getTime()) / 60000
    : Infinity;
  const showAsNew = isNew || timeSinceDetected < 30;

  const companyDisplay = job.company
    ? job.company.charAt(0).toUpperCase() + job.company.slice(1)
    : 'Unknown';

  const [g1, g2] = getGradient(job.company);
  const src = SOURCE_STYLES[job.source] || SOURCE_STYLES.company_api;
  const description = stripHtml(job.description);
  const detectedTime = timeAgo(job.detectedAt || job.postedAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.25) }}
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #141414 0%, #111111 100%)',
        border: showAsNew
          ? '1px solid rgba(139,92,246,0.25)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: showAsNew
          ? '0 4px 32px rgba(139,92,246,0.08), 0 1px 0 rgba(255,255,255,0.04) inset'
          : '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl"
        style={{ background: showAsNew ? '#8b5cf6' : `linear-gradient(180deg, ${g1}, ${g2})` }}
      />

      {/* Hover glow */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(90deg, rgba(139,92,246,0.04) 0%, transparent 100%)` }}
      />

      <div className={`px-5 py-4 pl-7 ${compact ? '' : ''}`}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Company initial bubble */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
            >
              {companyDisplay[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">{companyDisplay}</p>
              {job.source && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-0.5 inline-block"
                  style={{ color: src.color, background: src.bg, border: `1px solid ${src.border}` }}
                >
                  {job.source}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {showAsNew && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-400 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                New
              </span>
            )}
            {detectedTime && (
              <span className="flex items-center gap-1 text-[10px] text-gray-600">
                <Clock size={9} />{detectedTime}
              </span>
            )}
          </div>
        </div>

        {/* Job title */}
        <h3 className="text-[15px] font-bold text-white mb-2.5 leading-snug group-hover:text-violet-200 transition-colors line-clamp-2">
          {job.title}
        </h3>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {job.location && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-gray-400"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <MapPin size={9} className="shrink-0" />{job.location}
            </span>
          )}
          {job.employmentType && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-violet-400"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Briefcase size={9} className="shrink-0" />
              {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}
            </span>
          )}
          {job.remote && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-sky-400"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <Wifi size={9} className="shrink-0" />Remote
            </span>
          )}
          {job.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] text-gray-500"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Description — clean, no HTML entities */}
        {!compact && description && (
          <p className="text-[11px] text-gray-600 leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-white/5 mb-3" />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-600">
            {job.postedAt
              ? `Posted ${new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : ''}
          </span>
          <ApplyButton jobId={job._id} applyUrl={job.applyUrl} isApplied={isApplied} onApplied={onApplied} />
        </div>
      </div>
    </motion.div>
  );
};

export default LiveJobCard;
