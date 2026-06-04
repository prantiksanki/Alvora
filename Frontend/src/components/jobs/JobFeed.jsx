import { AnimatePresence, motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import LiveJobCard from './LiveJobCard';
import JobSkeleton from './JobSkeleton';

const JobFeed = ({
  jobs = [],
  isLoading = false,
  pagination,
  onPageChange,
  emptyMessage = 'No jobs found',
  realtimeJobs = [],
  appliedIds,
  onApplied,
}) => {
  // Merge realtime jobs (prepend, deduplicate by _id)
  const idsSeen = new Set();
  const allJobs = [];
  for (const job of [...realtimeJobs, ...jobs]) {
    if (!idsSeen.has(job._id)) {
      idsSeen.add(job._id);
      allJobs.push(job);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (allJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Search size={22} className="text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium">{emptyMessage}</p>
        <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or subscribe to more companies</p>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="popLayout" initial={false}>
        <div className="space-y-4">
          {allJobs.map((job, index) => (
            <LiveJobCard
              key={job._id}
              job={job}
              index={index}
              isNew={realtimeJobs.some((r) => r._id === job._id)}
              isApplied={appliedIds ? appliedIds.has(job._id) : false}
              onApplied={onApplied}
            />
          ))}
        </div>
      </AnimatePresence>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-6 pt-4 border-t border-white/8"
        >
          <p className="text-xs text-gray-500">
            {pagination.total} job{pagination.total !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-400 px-2">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default JobFeed;
