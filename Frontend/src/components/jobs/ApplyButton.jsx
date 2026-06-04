import { useState } from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { jobsService } from '../../services/jobsService';

/**
 * Props:
 *   jobId     — MongoDB _id of the JobPosting
 *   applyUrl  — external URL to open on apply
 *   isApplied — authoritative applied state from useAppliedJobs hook (DB-backed)
 *   onApplied — callback(jobId) called after successful apply
 */
const ApplyButton = ({ jobId, applyUrl, isApplied = false, onApplied }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Local optimistic state — flips to true immediately on click, before API resolves
  const [optimisticApplied, setOptimisticApplied] = useState(false);

  const applied = isApplied || optimisticApplied;

  const handleApply = async (e) => {
    e.stopPropagation();
    if (applied || isLoading) return;

    // Optimistic update — show "Applied" immediately
    setOptimisticApplied(true);
    setIsLoading(true);

    // Open the apply link right away so the user doesn't wait for the API
    if (applyUrl) window.open(applyUrl, '_blank', 'noopener,noreferrer');

    try {
      await jobsService.applyToJob(jobId);
      toast.success('Application recorded!');
      if (onApplied) onApplied(jobId);
    } catch {
      // API failed — keep the optimistic state anyway (user already opened the link)
      // Parent's useAppliedJobs will sync from DB on next mount/refetch
    } finally {
      setIsLoading(false);
    }
  };

  if (applied) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
      >
        <CheckCircle size={14} className="text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-400">Applied</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleApply}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-violet-500/20"
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <ExternalLink size={12} />
      )}
      {isLoading ? 'Saving...' : 'Apply Now'}
    </motion.button>
  );
};

export default ApplyButton;
