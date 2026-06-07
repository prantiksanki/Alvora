import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ExternalLink, RefreshCw, Tag,
  Percent, CheckCircle2, Star, Zap, Code2, Trophy, CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/animations/PageTransition';
import { usePotd } from '../hooks/usePotd';
import { potdService } from '../services/potdService';

const PLATFORM_META = {
  leetcode: {
    label: 'LeetCode',    icon: Code2,    color: '#f59e0b', rgb: '245,158,11',
  },
  gfg: {
    label: 'GeeksForGeeks', icon: BookOpen, color: '#22c55e', rgb: '34,197,94',
  },
  codeforces: {
    label: 'Codeforces',  icon: Trophy,   color: '#3b82f6', rgb: '59,130,246',
  },
  codechef: {
    label: 'CodeChef',    icon: Star,     color: '#f97316', rgb: '249,115,22',
  },
};

function DiffTag({ difficulty }) {
  const map = {
    easy:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
    medium: { color: '#eab308', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.25)'  },
    hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
  };
  const s = map[difficulty?.toLowerCase()] || map.medium;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {difficulty}
    </span>
  );
}

const PotdCard = ({ problem, index }) => {
  const [solved, setSolved] = useState(
    () => localStorage.getItem(`alvora:potd:solved:${problem.platform}:${problem.date}`) === 'true'
  );

  const meta = PLATFORM_META[problem.platform] || PLATFORM_META.leetcode;
  const Icon = meta.icon;

  const handleSolve = () => {
    setSolved(true);
    localStorage.setItem(`alvora:potd:solved:${problem.platform}:${problem.date}`, 'true');
    toast.success('Marked as solved — great work!', { duration: 2500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: solved
          ? 'linear-gradient(135deg, #0d1a12 0%, #111111 100%)'
          : 'linear-gradient(135deg, #141414 0%, #111111 100%)',
        border: solved
          ? '1px solid rgba(16,185,129,0.25)'
          : `1px solid rgba(${meta.rgb},0.14)`,
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl transition-all duration-300"
        style={{ background: solved ? '#10b981' : meta.color }}
      />

      {/* Hover glow */}
      <div
        className="absolute left-0 top-0 bottom-0 w-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(90deg, rgba(${meta.rgb},0.05) 0%, transparent 100%)` }}
      />

      <div className="px-6 py-5 pl-8">

        {/* Platform row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `rgba(${meta.rgb},0.1)`, border: `1px solid rgba(${meta.rgb},0.2)` }}
            >
              <Icon size={16} style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p>
              <p className="text-[10px] text-gray-600">Problem of the Day</p>
            </div>
          </div>

          <AnimatePresence>
            {solved ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25"
              >
                <CheckCircle2 size={11} className="text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-400">Solved</span>
              </motion.div>
            ) : (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: `rgba(${meta.rgb},0.08)`, border: `1px solid rgba(${meta.rgb},0.2)` }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.color }} />
                <span className="text-[10px] font-medium" style={{ color: meta.color }}>{problem.date}</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-white leading-snug mb-3 line-clamp-2 group-hover:text-gray-100 transition-colors">
          {problem.title}
        </h3>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DiffTag difficulty={problem.difficulty} />

          {problem.rating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-400"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Zap size={9} />
              {problem.rating} rating
            </span>
          )}

          {problem.accuracy != null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-400"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Percent size={9} />
              {problem.accuracy}% acceptance
            </span>
          )}
        </div>

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-gray-500"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
            {problem.tags.length > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] text-gray-600"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                +{problem.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/5 mb-4" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open(problem.url, '_blank', 'noopener,noreferrer')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: `rgba(${meta.rgb},0.1)`,
              border: `1px solid rgba(${meta.rgb},0.2)`,
              color: meta.color,
            }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${meta.rgb},0.18)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(${meta.rgb},0.1)`}
          >
            <ExternalLink size={12} />
            Solve Now
          </motion.button>

          {!solved && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSolve}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 transition-all duration-200"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
            >
              <CheckCheck size={13} />
              Done
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl p-6 space-y-4"
    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/8" />
      <div className="space-y-1.5">
        <div className="h-3 w-20 bg-white/8 rounded" />
        <div className="h-2 w-14 bg-white/5 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-5/6 bg-white/8 rounded" />
      <div className="h-4 w-3/5 bg-white/5 rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-14 bg-white/8 rounded-full" />
      <div className="h-5 w-20 bg-white/5 rounded-full" />
    </div>
    <div className="h-px bg-white/5" />
    <div className="h-9 bg-white/8 rounded-xl" />
  </div>
);

export default function DailyProblemsPage() {
  const { problems, isLoading, error, lastRefreshed, refetch } = usePotd();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await potdService.refresh();
      toast.success('Fetching fresh problems…');
      setTimeout(() => { refetch(); setIsRefreshing(false); }, 2000);
    } catch {
      toast.error('Refresh failed');
      setIsRefreshing(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const solvedCount = problems.filter((p) =>
    localStorage.getItem(`alvora:potd:solved:${p.platform}:${p.date}`) === 'true'
  ).length;

  return (
    <PageTransition>
      <div className="-m-4 md:-m-6" style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BookOpen size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daily Problems</h2>
              <p className="text-xs text-gray-500 mt-0.5">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Solved pill */}
            {!isLoading && problems.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/20">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  {solvedCount}/{problems.length} solved
                </span>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-violet-400' : ''} />
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </motion.button>
          </div>
        </div>

        {/* Streak banner */}
        <div className="mx-8 mt-5 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
          <Zap size={14} className="text-violet-400 shrink-0" />
          <span className="text-sm text-violet-300">
            Solve today&apos;s problems across platforms to maintain your streaks.
          </span>
          {lastRefreshed && (
            <span className="ml-auto text-[10px] text-violet-600 shrink-0">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Problem grid */}
        <div className="px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
            : error && problems.length === 0
            ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
                  <BookOpen size={22} className="text-gray-600" />
                </div>
                <p className="text-sm text-gray-400 font-medium mb-1">Couldn&apos;t load daily problems</p>
                <p className="text-xs text-gray-600 mb-4">Make sure the backend is running and try again.</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-violet-400 transition-all"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  Try Again
                </button>
              </div>
            )
            : problems.length === 0
            ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
                  <BookOpen size={22} className="text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">No problems loaded yet — click Refresh.</p>
              </div>
            )
            : problems.map((p, i) => (
              <PotdCard key={`${p.platform}-${p.date}`} problem={p} index={i} />
            ))
          }
        </div>

        {/* Bottom platform status strip */}
        {!isLoading && problems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-8 mb-6 flex items-center justify-center gap-6 py-3 px-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {problems.map((p) => {
              const meta = PLATFORM_META[p.platform];
              const isSolved = localStorage.getItem(`alvora:potd:solved:${p.platform}:${p.date}`) === 'true';
              return (
                <div key={p.platform} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: isSolved ? '#10b981' : meta?.color || '#6b7280' }}
                  />
                  <span className="text-xs font-medium" style={{ color: isSolved ? '#10b981' : '#6b7280' }}>
                    {meta?.label || p.platform}
                  </span>
                  {isSolved && <CheckCircle2 size={11} className="text-emerald-400" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
