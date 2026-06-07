import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Building2 } from 'lucide-react';

const formatTime = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const LiveActivityTicker = ({ jobs = [] }) => {
  const items = jobs.slice(0, 10);

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
          <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </div>
        <Zap size={13} className="text-emerald-400" />
        <span className="text-xs font-semibold text-white">Live Activity</span>
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-gray-600">Waiting for new jobs...</p>
          <p className="text-[10px] text-gray-700 mt-1">Subscribe to companies to see live updates</p>
        </div>
      ) : (
        <div className="space-y-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((job, index) => {
              const company = job.company
                ? job.company.charAt(0).toUpperCase() + job.company.slice(1)
                : 'Unknown';

              return (
                <motion.div
                  key={job._id || index}
                  layout
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 16, height: 0 }}
                  transition={{ duration: 0.25, delay: index === 0 ? 0 : 0 }}
                  className="border-b border-white/5 last:border-0 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5">
                      {(company[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 leading-snug truncate">
                        <span className="text-white font-medium">{company}</span>
                        {' '}posted{' '}
                        <span className="text-violet-300">{job.title}</span>
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{formatTime(job.detectedAt)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LiveActivityTicker;
