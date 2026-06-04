import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, SlidersHorizontal, RefreshCw, TrendingUp, Building2, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../../components/animations/PageTransition';
import FilterSidebar from '../../components/jobs/FilterSidebar';
import JobFeed from '../../components/jobs/JobFeed';
import LiveJobCard from '../../components/jobs/LiveJobCard';
import SubscriptionCard from '../../components/subscriptions/SubscriptionCard';
import LiveActivityTicker from '../../components/live-feed/LiveActivityTicker';
import { useJobs } from '../../hooks/useJobs';
import { useLiveJobs } from '../../hooks/useLiveJobs';
import { useSubscription } from '../../hooks/useSubscription';
import { useJobSocket } from '../../context/JobSocketContext';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';

const StatPill = ({ icon: Icon, label, value, color = 'violet' }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
    <Icon size={13} className={`text-${color}-400 shrink-0`} />
    <div>
      <p className="text-[10px] text-gray-500 leading-none">{label}</p>
      <p className="text-sm font-semibold text-white leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

export default function LiveJobsPage() {
  const { jobs, pagination, filters, isLoading, setFilter, setPage, clearFilters } = useJobs();
  const { jobs: liveJobs, isLoading: liveLoading, count: liveCount } = useLiveJobs();
  const { subscription, saveSubscription, isSaving } = useSubscription();
  const { socket, isConnected, liveJobs: socketJobs } = useJobSocket();
  const { appliedIds, markApplied } = useAppliedJobs();

  const [realtimeJobs, setRealtimeJobs] = useState([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Listen for live socket events and prepend to the feed
  useEffect(() => {
    if (!socket) return;

    const handleNewJob = ({ job }) => {
      if (!job) return;
      setRealtimeJobs((prev) => {
        const exists = prev.some((j) => j._id === job._id);
        if (exists) return prev;
        return [job, ...prev].slice(0, 20);
      });
    };

    socket.on('new-job-detected', handleNewJob);
    return () => socket.off('new-job-detected', handleNewJob);
  }, [socket]);

  const handleFilterChange = useCallback((key, value) => {
    if (key === '__clear__') {
      clearFilters();
      return;
    }
    setFilter(key, value);
  }, [setFilter, clearFilters]);

  const hasActiveFilters =
    !!(filters.company || filters.source || filters.employmentType || filters.remote || filters.search);

  // Merge socket jobs with live REST jobs for the "recently detected" banner
  const allLiveJobs = [...socketJobs, ...liveJobs].filter(
    (job, idx, arr) => arr.findIndex((j) => j._id === job._id) === idx
  );

  // Top 3 most recent for the banner strip
  const bannerJobs = allLiveJobs.slice(0, 3);

  // Stats derived from data
  const followedCount = subscription?.companies?.length || 0;

  return (
    <PageTransition>
      <div className="space-y-5 max-w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-2xl font-bold text-white">Job Intelligence</h2>
              {/* Live connection indicator */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-500 ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-gray-500/10 border-gray-500/20 text-gray-500'
              }`}>
                <div className="relative flex items-center justify-center">
                  <span className={`w-1.5 h-1.5 rounded-full block ${isConnected ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                  {isConnected && (
                    <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  )}
                </div>
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Monitor openings in real-time. Be first to apply.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatPill icon={Building2} label="Following" value={followedCount || '—'} color="violet" />
            <StatPill icon={TrendingUp} label="Live jobs" value={liveCount || '0'} color="emerald" />
            <StatPill icon={Wifi} label="Status" value={isConnected ? 'Connected' : 'Offline'} color={isConnected ? 'emerald' : 'gray'} />
          </div>
        </div>

        {/* "Recently Detected" banner strip — shows if there are any live jobs */}
        <AnimatePresence>
          {bannerJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/8 to-transparent border border-violet-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                    <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-violet-300">
                    Recently Detected — {allLiveJobs.length} job{allLiveJobs.length !== 1 ? 's' : ''} in the last 24h
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bannerJobs.map((job, i) => (
                    <LiveJobCard
                      key={job._id}
                      job={job}
                      index={i}
                      isNew={true}
                      isApplied={appliedIds.has(job._id)}
                      onApplied={markApplied}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content: filter | feed | right panel */}
        <div className="flex gap-5 items-start">

          {/* Filter sidebar (desktop: sticky, mobile: drawer) */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isOpen={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Job feed */}
          <div className="flex-1 min-w-0">
            {/* Feed header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {/* Mobile filter trigger */}
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                >
                  <SlidersHorizontal size={13} />
                  Filters
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                </button>
                {!isLoading && (
                  <p className="text-sm text-gray-500 hidden md:block">
                    {pagination?.total || 0} job{pagination?.total !== 1 ? 's' : ''}
                    {hasActiveFilters ? ' matching filters' : ' available'}
                  </p>
                )}
              </div>

              <button
                onClick={() => { setLastRefresh(new Date()); setFilter('page', 1); }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                title="Refresh"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <JobFeed
              jobs={jobs}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={setPage}
              realtimeJobs={realtimeJobs}
              emptyMessage={hasActiveFilters ? 'No jobs match your filters' : 'No jobs found yet'}
              appliedIds={appliedIds}
              onApplied={markApplied}
            />
          </div>

          {/* Right panel — visible on xl screens */}
          <div className="hidden xl:flex flex-col gap-4 w-64 shrink-0">
            <SubscriptionCard
              subscription={subscription}
              onSave={saveSubscription}
              isSaving={isSaving}
            />
            <LiveActivityTicker jobs={allLiveJobs} />
          </div>
        </div>

        {/* Right panel — shown below on smaller screens */}
        <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SubscriptionCard
            subscription={subscription}
            onSave={saveSubscription}
            isSaving={isSaving}
          />
          <LiveActivityTicker jobs={allLiveJobs} />
        </div>

      </div>
    </PageTransition>
  );
}
