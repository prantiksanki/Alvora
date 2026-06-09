import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, SlidersHorizontal, RefreshCw, TrendingUp, Building2, Wifi, X } from 'lucide-react';
import PageTransition from '../../components/animations/PageTransition';
import FilterSidebar from '../../components/jobs/FilterSidebar';
import JobFeed from '../../components/jobs/JobFeed';
import LiveJobCard from '../../components/jobs/LiveJobCard';
import LiveActivityTicker from '../../components/live-feed/LiveActivityTicker';
import { useJobs } from '../../hooks/useJobs';
import { useLiveJobs } from '../../hooks/useLiveJobs';
import { useSubscription } from '../../hooks/useSubscription';
import { useJobSocket } from '../../context/JobSocketContext';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';

export default function LiveJobsPage() {
  const { jobs, pagination, filters, isLoading, setFilter, setPage, clearFilters } = useJobs();
  const { jobs: liveJobs, isLoading: liveLoading, count: liveCount } = useLiveJobs();
  const { subscription } = useSubscription();
  const { socket, isConnected, liveJobs: socketJobs } = useJobSocket();
  const { appliedIds, markApplied } = useAppliedJobs();

  const [realtimeJobs, setRealtimeJobs] = useState([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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
    if (key === '__clear__') { clearFilters(); return; }
    setFilter(key, value);
  }, [setFilter, clearFilters]);

  const hasActiveFilters =
    !!(filters.company || filters.source || filters.employmentType || filters.remote || filters.region || filters.search);

  const allLiveJobs = [...socketJobs, ...liveJobs].filter(
    (job, idx, arr) => arr.findIndex((j) => j._id === job._id) === idx
  );
  const bannerJobs = allLiveJobs.slice(0, 3);
  const followedCount = subscription?.companies?.length || 0;

  return (
    <PageTransition>
      <div
        className="-m-4 md:-m-6 flex flex-col"
        style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)' }}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Zap size={16} className="text-violet-400" />
              {isConnected && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Job Intelligence</h2>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                    color: isConnected ? '#34d399' : '#6b7280',
                    border: `1px solid ${isConnected ? 'rgba(16,185,129,0.25)' : 'rgba(107,114,128,0.2)'}`,
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                    style={{ background: isConnected ? '#34d399' : '#6b7280' }} />
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Monitor openings in real-time. Be first to apply.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            {[
              { icon: Building2, label: 'Following', value: followedCount || '—', color: '#8b5cf6', rgb: '139,92,246' },
              { icon: TrendingUp, label: 'Live Jobs',  value: liveCount || '0',   color: '#10b981', rgb: '16,185,129' },
              { icon: Wifi,       label: 'Status',     value: isConnected ? 'Connected' : 'Offline',
                color: isConnected ? '#10b981' : '#6b7280', rgb: isConnected ? '16,185,129' : '107,114,128' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: `rgba(${s.rgb},0.06)`, border: `1px solid rgba(${s.rgb},0.15)` }}
              >
                <s.icon size={13} style={{ color: s.color }} />
                <div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider leading-none">{s.label}</p>
                  <p className="text-xs font-bold leading-tight mt-0.5" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recently Detected Banner ── */}
        <AnimatePresence>
          {bannerJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden shrink-0"
            >
              <div
                className="mx-8 mt-5 rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.04) 100%)',
                  border: '1px solid rgba(139,92,246,0.18)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                    <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-violet-300">
                    Recently Detected — {allLiveJobs.length} job{allLiveJobs.length !== 1 ? 's' : ''} in the last 24h
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bannerJobs.map((job, i) => (
                    <LiveJobCard
                      key={job._id} job={job} index={i} isNew compact
                      isApplied={appliedIds.has(job._id)} onApplied={markApplied}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main: filters | feed | right panel ── */}
        <div className="flex flex-1 min-h-0 gap-0">

          {/* Filter sidebar — left */}
          <div className="hidden md:block w-56 shrink-0 border-r border-white/6 px-5 py-5">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              hasActiveFilters={hasActiveFilters}
              inline
            />
          </div>

          {/* Feed */}
          <div className="flex-1 min-w-0 px-6 py-5">
            {/* Feed toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <SlidersHorizontal size={12} />
                  Filters
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                </button>
                {!isLoading && (
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-white">{pagination?.total || 0}</span>{' '}
                    job{pagination?.total !== 1 ? 's' : ''}
                    {hasActiveFilters ? ' matching filters' : ' available'}
                  </p>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={() => handleFilterChange('__clear__', null)}
                    className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={10} /> Clear filters
                  </button>
                )}
              </div>
              <button
                onClick={() => setFilter('page', 1)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
              >
                <RefreshCw size={12} />
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

          {/* Right panel */}
          <div className="hidden xl:flex flex-col gap-4 w-64 shrink-0 border-l border-white/6 px-5 py-5">
            <LiveActivityTicker jobs={allLiveJobs} />
          </div>
        </div>

        {/* Right panel on smaller screens */}
        <div className="xl:hidden px-8 pb-6">
          <LiveActivityTicker jobs={allLiveJobs} />
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filterDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 md:hidden"
                onClick={() => setFilterDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-72 z-50 overflow-y-auto p-5 md:hidden"
                style={{ background: '#111111', borderRight: '1px solid rgba(255,255,255,0.08)' }}
              >
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  isOpen={false}
                  onClose={() => setFilterDrawerOpen(false)}
                  hasActiveFilters={hasActiveFilters}
                  inline
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
