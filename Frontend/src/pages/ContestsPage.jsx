import { useState, useEffect } from 'react';
import { Swords, ExternalLink, Clock, Trophy, Code2, CalendarDays, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import PageTransition from '../components/animations/PageTransition';

const useCountdown = (targetDate) => {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return { timeLeft: { d: 0, h: 0, m: 0 }, isPast: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { timeLeft: { d, h, m }, isPast: false };
  };

  const [state, setState] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setState(calc()), 30000);
    return () => clearInterval(t);
  }, [targetDate]);

  return state;
};

const PLATFORM = {
  codeforces: {
    label: 'Codeforces',
    icon: Trophy,
    color: '#3b82f6',
    rgb: '59,130,246',
    badgeCls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  leetcode: {
    label: 'LeetCode',
    icon: Code2,
    color: '#f59e0b',
    rgb: '245,158,11',
    badgeCls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
};

function CountdownBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-black text-white tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-gray-600 uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="text-gray-700 font-bold text-lg leading-none mb-2">:</span>;
}

const ContestCard = ({ contest, index }) => {
  const { timeLeft, isPast } = useCountdown(contest.startTime);
  const isRunning = contest.status === 'running';
  const meta = PLATFORM[contest.platform] || PLATFORM.codeforces;
  const Icon = meta.icon;
  const durationHr = contest.duration > 0 ? Math.round(contest.duration / 3600) : null;

  const startDate = new Date(contest.startTime);
  const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, #141414 0%, #111111 100%)`,
        borderColor: isRunning ? 'rgba(16,185,129,0.35)' : `rgba(${meta.rgb},0.12)`,
        boxShadow: isRunning
          ? '0 0 0 1px rgba(16,185,129,0.1), 0 4px 24px rgba(0,0,0,0.4)'
          : `0 4px 24px rgba(0,0,0,0.35)`,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl"
        style={{ background: isRunning ? '#10b981' : meta.color }}
      />

      {/* Subtle glow behind icon */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, rgba(${meta.rgb},0.06) 0%, transparent 100%)` }}
      />

      <div className="flex items-center gap-5 px-6 py-5 pl-8">
        {/* Platform icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `rgba(${meta.rgb},0.1)`, border: `1px solid rgba(${meta.rgb},0.2)` }}
        >
          <Icon size={18} style={{ color: meta.color }} />
        </div>

        {/* Contest info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: meta.color, background: `rgba(${meta.rgb},0.08)`, borderColor: `rgba(${meta.rgb},0.2)` }}
            >
              {meta.label}
            </span>
            {isRunning && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white leading-snug truncate pr-4">{contest.name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <CalendarDays size={10} />
              {dateStr}, {timeStr}
            </span>
            {durationHr && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Clock size={10} />
                {durationHr}h
              </span>
            )}
          </div>
        </div>

        {/* Countdown + link */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {isPast || isRunning ? (
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
              <Zap size={14} />
              {isRunning ? 'Running' : 'Started'}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {timeLeft.d > 0 && (
                <>
                  <CountdownBlock value={timeLeft.d} label="day" />
                  <Divider />
                </>
              )}
              <CountdownBlock value={timeLeft.h} label="hr" />
              <Divider />
              <CountdownBlock value={timeLeft.m} label="min" />
            </div>
          )}

          {contest.url && (
            <a
              href={contest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-white transition-colors"
            >
              Open <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MOCK_CONTESTS = [
  { contestId: '1', platform: 'codeforces', name: 'Educational Codeforces Round 191 (Rated for Div. 2)', startTime: new Date(Date.now() + 1.5 * 86400000), duration: 7200, url: 'https://codeforces.com', status: 'upcoming' },
  { contestId: '2', platform: 'leetcode',   name: 'Weekly Contest 506', startTime: new Date(Date.now() + 6 * 86400000), duration: 5400, url: 'https://leetcode.com/contest', status: 'upcoming' },
  { contestId: '3', platform: 'codeforces', name: 'Codeforces Round 1000 (Div. 1 + Div. 2)', startTime: new Date(Date.now() + 9 * 86400000), duration: 10800, url: 'https://codeforces.com', status: 'upcoming' },
  { contestId: '4', platform: 'leetcode',   name: 'Biweekly Contest 160', startTime: new Date(Date.now() + 13 * 86400000), duration: 5400, url: 'https://leetcode.com/contest', status: 'upcoming' },
];

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/contests/upcoming')
      .then(({ data }) => setContests(data.length > 0 ? data : MOCK_CONTESTS))
      .catch(() => setContests(MOCK_CONTESTS))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === 'all' ? contests : contests.filter((c) => c.platform === filter);

  return (
    <PageTransition>
      <div className="-m-4 md:-m-6" style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Swords size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Contests</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upcoming competitive programming contests</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
            {['all', 'codeforces', 'leetcode'].map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  filter === p
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {p === 'all' ? 'All' : p === 'codeforces' ? 'Codeforces' : 'LeetCode'}
              </button>
            ))}
          </div>
        </div>

        {/* Contest list */}
        <div className="px-8 py-6 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-white/4 rounded-2xl" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
                <Swords size={22} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">No upcoming {filter !== 'all' ? filter : ''} contests found</p>
            </div>
          ) : (
            filtered.map((contest, i) => (
              <ContestCard key={`${contest.platform}-${contest.contestId}`} contest={contest} index={i} />
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
