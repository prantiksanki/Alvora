import { motion } from 'framer-motion';
import { MapPin, Wifi, Briefcase } from 'lucide-react';
import LiveBadge from './LiveBadge';
import ApplyButton from './ApplyButton';
import CompanyLogo from './CompanyLogo';

const SOURCE_COLORS = {
  greenhouse: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  lever: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  ashby: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  workday: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  company_api: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

const EMPLOYMENT_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

const GRADIENT_PAIRS = [
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-violet-600',
];

const getGradient = (company) => {
  const index = (company?.charCodeAt(0) || 0) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
};

const LiveJobCard = ({ job, index = 0, isNew = false, isApplied = false, onApplied }) => {
  const timeSinceDetected = job.detectedAt
    ? (Date.now() - new Date(job.detectedAt).getTime()) / 60000
    : Infinity;
  const showAsNew = isNew || timeSinceDetected < 30;

  const companyDisplay = job.company
    ? job.company.charAt(0).toUpperCase() + job.company.slice(1)
    : 'Unknown';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className={`relative backdrop-blur-md bg-white/5 border rounded-2xl p-5 transition-all duration-300 hover:bg-white/8 hover:border-white/20 group overflow-hidden ${
        showAsNew
          ? 'border-violet-500/30 shadow-lg shadow-violet-500/5'
          : 'border-white/10'
      }`}
    >
      {/* Gradient glow for new jobs */}
      {showAsNew && (
        <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-transparent pointer-events-none rounded-2xl" />
      )}

      {/* Top row: company + live badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <CompanyLogo
            company={job.company}
            gradient={getGradient(job.company)}
          />
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{companyDisplay}</p>
            {job.source && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium mt-0.5 ${SOURCE_COLORS[job.source] || SOURCE_COLORS.company_api}`}
              >
                {job.source}
              </span>
            )}
          </div>
        </div>
        <LiveBadge detectedAt={job.detectedAt} />
      </div>

      {/* Job title */}
      <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-violet-200 transition-colors">
        {job.title}
      </h3>

      {/* Meta tags row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {job.location && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
            <MapPin size={10} className="shrink-0" />
            {job.location}
          </span>
        )}
        {job.remote && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400">
            <Wifi size={10} className="shrink-0" />
            Remote
          </span>
        )}
        {job.employmentType && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400">
            <Briefcase size={10} className="shrink-0" />
            {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}
          </span>
        )}
        {job.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Description preview */}
      {job.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {job.description.replace(/<[^>]*>/g, '').trim()}
        </p>
      )}

      {/* Bottom row: time + apply */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-gray-600">
          {job.postedAt
            ? `Posted ${new Date(job.postedAt).toLocaleDateString()}`
            : job.detectedAt
            ? `Detected ${new Date(job.detectedAt).toLocaleDateString()}`
            : ''}
        </div>
        <ApplyButton jobId={job._id} applyUrl={job.applyUrl} isApplied={isApplied} onApplied={onApplied} />
      </div>
    </motion.div>
  );
};

export default LiveJobCard;
