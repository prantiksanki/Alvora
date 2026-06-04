import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ExternalLink, RefreshCw, Tag, Target,
  Percent, CheckCircle, Star, Zap, Code2, Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/animations/PageTransition';
import Card from '../components/ui/Card';
import { usePotd } from '../hooks/usePotd';
import { potdService } from '../services/potdService';

// ─── Platform config ─────────────────────────────────────────────────────────
const PLATFORM_META = {
  leetcode: {
    label: 'LeetCode',
    icon: Code2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    accent: 'from-yellow-500/20 to-orange-500/10',
    dot: 'bg-yellow-400',
  },
  gfg: {
    label: 'GeeksForGeeks',
    icon: BookOpen,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    accent: 'from-green-500/20 to-emerald-500/10',
    dot: 'bg-green-400',
  },
  codeforces: {
    label: 'Codeforces',
    icon: Trophy,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    accent: 'from-blue-500/20 to-cyan-500/10',
    dot: 'bg-blue-400',
  },
  codechef: {
    label: 'CodeChef',
    icon: Star,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    accent: 'from-orange-500/20 to-amber-500/10',
    dot: 'bg-orange-400',
  },
};

// ─── Difficulty badge ─────────────────────────────────────────────────────────
const DIFF_STYLES = {
  easy:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-yellow-500/10  text-yellow-400  border border-yellow-500/20',
  hard:   'bg-red-500/10     text-red-400     border border-red-500/20',
};

const DiffBadge = ({ difficulty }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${DIFF_STYLES[difficulty] || DIFF_STYLES.medium}`}>
    {difficulty}
  </span>
);

// ─── Single POTD card ─────────────────────────────────────────────────────────
const PotdCard = ({ problem, index }) => {
  const [solved, setSolved] = useState(() =>
    localStorage.getItem(`alvora:potd:solved:${problem.platform}:${problem.date}`) === 'true'
  );

  const meta = PLATFORM_META[problem.platform] || PLATFORM_META.leetcode;
  const Icon = meta.icon;

  const handleSolve = (e) => {
    e.preventDefault();
    setSolved(true);
    localStorage.setItem(`alvora:potd:solved:${problem.platform}:${problem.date}`, 'true');
    toast.success(`Marked as solved — great work! 🎉`, { duration: 2500 });
  };

  const handleOpen = () => {
    window.open(problem.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`relative backdrop-blur-md bg-white/5 border rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/8 hover:border-white/20 group ${meta.border}`}
    >
      {/* Gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${meta.accent}`} />

      {/* Solved overlay */}
      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 right-3 z-10"
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full">
              <CheckCircle size={11} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400">Solved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Platform header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`p-2 rounded-xl ${meta.bg} shrink-0`}>
            <Icon size={16} className={meta.color} />
          </div>
          <div>
            <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>
            <p className="text-[10px] text-gray-600">Problem of the Day</p>
          </div>
          <div className={`ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full ${meta.bg} border ${meta.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
            <span className={`text-[10px] font-medium ${meta.color}`}>
              {problem.date}
            </span>
          </div>
        </div>

        {/* Problem title */}
        <h3 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-violet-200 transition-colors line-clamp-2">
          {problem.title}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DiffBadge difficulty={problem.difficulty} />

          {problem.rating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400">
              <Zap size={9} />
              {problem.rating} rating
            </span>
          )}

          {problem.accuracy != null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">
              <Percent size={9} />
              {problem.accuracy}% acceptance
            </span>
          )}
        </div>

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-[10px] text-gray-500"
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
            {problem.tags.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-[10px] text-gray-600">
                +{problem.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleOpen}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${meta.bg} ${meta.color} border ${meta.border} hover:brightness-110`}
          >
            <ExternalLink size={12} />
            Solve Now
          </motion.button>

          {!solved && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSolve}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200"
              title="Mark as solved"
            >
              <Target size={12} />
              Mark Solved
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const PotdSkeleton = () => (
  <div className="animate-pulse backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-white/10" />
      <div className="space-y-1.5">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-2 w-16 bg-white/8 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-4/5 bg-white/10 rounded" />
      <div className="h-4 w-2/3 bg-white/8 rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 w-14 bg-white/8 rounded-full" />
      <div className="h-5 w-20 bg-white/8 rounded-full" />
    </div>
    <div className="h-9 bg-white/8 rounded-xl" />
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
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

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen size={22} className="text-violet-400" />
              Daily Problems
            </h2>
            <p className="text-gray-400 text-sm mt-1">{today}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 transition-all text-xs font-medium disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-violet-400' : ''} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
          </motion.button>
        </div>

        {/* Info banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/15 text-sm text-violet-300">
          <Zap size={15} className="shrink-0 text-violet-400" />
          <span>
            Solve today&apos;s problems across platforms to maintain your streaks.
            {lastRefreshed && (
              <span className="text-violet-500 ml-1.5 text-xs">
                Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </span>
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <Card className="text-center py-10">
            <BookOpen size={28} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Couldn&apos;t load daily problems</p>
            <p className="text-gray-600 text-sm mt-1">
              Make sure the backend server is running and try refreshing.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={refetch}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-all"
            >
              Try Again
            </motion.button>
          </Card>
        )}

        {/* Problem grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <PotdSkeleton key={i} />)
            : problems.map((p, i) => (
                <PotdCard key={`${p.platform}-${p.date}`} problem={p} index={i} />
              ))}
        </div>

        {/* Empty state */}
        {!isLoading && !error && problems.length === 0 && (
          <Card className="text-center py-14">
            <BookOpen size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No problems loaded yet</p>
            <p className="text-gray-600 text-sm mt-1">Click Refresh to fetch today&apos;s problems.</p>
          </Card>
        )}

        {/* Solved count strip */}
        {!isLoading && problems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 py-3 px-5 rounded-2xl bg-white/3 border border-white/8"
          >
            {problems.map((p) => {
              const meta = PLATFORM_META[p.platform];
              const isSolved = localStorage.getItem(
                `alvora:potd:solved:${p.platform}:${p.date}`
              ) === 'true';
              return (
                <div key={p.platform} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isSolved ? 'bg-emerald-400' : meta?.dot || 'bg-gray-600'}`} />
                  <span className={`text-xs font-medium ${isSolved ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {meta?.label || p.platform}
                  </span>
                  {isSolved && <CheckCircle size={11} className="text-emerald-400" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
