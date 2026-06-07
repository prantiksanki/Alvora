import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, Settings, MapPin, GraduationCap, Mail, Link2, Globe,
  GitBranch, Code2, Trophy, BookOpen, Flame, Star, Zap,
  ExternalLink, AlertCircle, ChevronRight, Swords
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useInsights } from '../hooks/useInsights';
import { useGamification } from '../hooks/useGamification';
import { useJobSocket } from '../context/JobSocketContext';
import api from '../services/api';
import PageTransition from '../components/animations/PageTransition';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { HeatmapChart } from '../components/charts';

const PLATFORMS = ['leetcode', 'codeforces', 'github', 'gfg', 'codechef', 'atcoder'];

const PLATFORM_META = {
  leetcode:   { label: 'LeetCode',     icon: Code2,    color: 'text-yellow-400',  dot: 'bg-yellow-400' },
  codeforces: { label: 'Codeforces',   icon: Trophy,   color: 'text-blue-400',    dot: 'bg-blue-400' },
  github:     { label: 'GitHub',       icon: GitBranch,color: 'text-gray-300',    dot: 'bg-gray-300' },
  gfg:        { label: 'GeeksForGeeks',icon: BookOpen, color: 'text-green-400',   dot: 'bg-green-400' },
  codechef:   { label: 'CodeChef',     icon: Flame,    color: 'text-orange-400',  dot: 'bg-orange-400' },
  atcoder:    { label: 'AtCoder',      icon: Star,     color: 'text-sky-300',     dot: 'bg-sky-300' },
};

function DifficultyDonut({ easy = 0, medium = 0, hard = 0 }) {
  const total = easy + medium + hard || 1;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const eAngle = (easy / total) * circ;
  const mAngle = (medium / total) * circ;
  const hAngle = (hard / total) * circ;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#22c55e" strokeWidth="10"
            strokeDasharray={`${eAngle} ${circ}`} strokeLinecap="round" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f59e0b" strokeWidth="10"
            strokeDasharray={`${mAngle} ${circ}`}
            strokeDashoffset={-eAngle} strokeLinecap="round" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#ef4444" strokeWidth="10"
            strokeDasharray={`${hAngle} ${circ}`}
            strokeDashoffset={-(eAngle + mAngle)} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{easy + medium + hard}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-8">
          <span className="text-green-400 text-sm font-medium">Easy</span>
          <span className="text-white font-bold">{easy}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-yellow-400 text-sm font-medium">Medium</span>
          <span className="text-white font-bold">{medium}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-red-400 text-sm font-medium">Hard</span>
          <span className="text-white font-bold">{hard}</span>
        </div>
      </div>
    </div>
  );
}

function buildUnifiedHeatmap(overview, history) {
  const merged = {};

  // LeetCode: submissionCalendar is { unixTimestamp: count }
  const lcSnap = overview.find((s) => s.platform === 'leetcode');
  const lcCal = lcSnap?.extraData?.submissionCalendar || {};
  for (const [ts, count] of Object.entries(lcCal)) {
    const date = new Date(Number(ts) * 1000).toISOString().split('T')[0];
    merged[date] = (merged[date] || 0) + count;
  }

  // Codeforces + GitHub: activityCalendar is { "YYYY-MM-DD": count }
  for (const platform of ['codeforces', 'github']) {
    const snap = overview.find((s) => s.platform === platform);
    const cal = snap?.extraData?.activityCalendar || {};
    for (const [date, count] of Object.entries(cal)) {
      merged[date] = (merged[date] || 0) + count;
    }
  }

  // GFG, CodeChef, AtCoder: diff consecutive daily snapshots per platform
  for (const platform of ['gfg', 'codechef', 'atcoder']) {
    const platformSnaps = history
      .filter((s) => s.platform === platform)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 1; i < platformSnaps.length; i++) {
      const diff = (platformSnaps[i].solvedCount || 0) - (platformSnaps[i - 1].solvedCount || 0);
      if (diff > 0) {
        const date = new Date(platformSnaps[i].date).toISOString().split('T')[0];
        merged[date] = (merged[date] || 0) + diff;
      }
    }
  }

  return Object.entries(merged).map(([date, count]) => ({ date, count }));
}

function UnifiedHeatmap({ overview, history }) {
  const heatmapData = buildUnifiedHeatmap(overview, history);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const totalLast6m = heatmapData.reduce((sum, d) =>
    new Date(d.date) >= sixMonthsAgo ? sum + d.count : sum, 0);

  const maxStreak = Math.max(...overview.map((s) => s.streak || 0), 0);
  const currentStreak = maxStreak;

  return (
    <div>
      <div className="flex items-center gap-6 mb-4">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {totalLast6m} Submissions in past 6 months
        </span>
        <div className="ml-auto flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Max.Streak </span>
            <span className="text-white font-bold">{maxStreak}</span>
          </div>
          <div>
            <span className="text-gray-500">Current.Streak </span>
            <span className="text-white font-bold">{currentStreak}</span>
          </div>
        </div>
      </div>
      <HeatmapChart data={heatmapData} />
    </div>
  );
}

function PlatformRow({ platform, snapshot }) {
  const meta = PLATFORM_META[platform];
  if (!meta) return null;
  const Icon = meta.icon;
  const isConnected = !!snapshot;

  const getMainStat = () => {
    if (!snapshot) return { label: 'Not connected', value: null };
    if (platform === 'github') return { label: 'Repos', value: snapshot.extraData?.publicRepos ?? 0 };
    if (platform === 'codeforces' || platform === 'atcoder') return { label: 'Rating', value: snapshot.rating ?? 0 };
    return { label: 'Solved', value: snapshot.solvedCount ?? 0 };
  };

  const { label: statLabel, value: statValue } = getMainStat();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`shrink-0 ${meta.color}`}>
        <Icon size={16} />
      </div>
      <span className="text-sm text-gray-300 flex-1">{meta.label}</span>
      {isConnected ? (
        <>
          <span className="text-xs text-gray-500">{statLabel}</span>
          <span className="text-sm font-bold text-white w-12 text-right">
            <AnimatedCounter value={statValue} />
          </span>
          <div className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
        </>
      ) : (
        <span className="text-xs text-gray-600 italic">Not connected</span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, history, isLoading, error, refetch } = useAnalytics();
  const { insights } = useInsights();
  const { badges } = useGamification();
  const { lastSnapshotUpdate } = useJobSocket();
  const [contests, setContests] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    api.get('/contests/upcoming').then(({ data }) => setContests(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (lastSnapshotUpdate) {
      refetch();
      setIsSyncing(false);
    }
  }, [lastSnapshotUpdate, refetch]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await api.post('/profile/sync');
      toast.success('Syncing your stats…', { icon: '🔄', duration: 3000 });
    } catch {
      toast.error('Sync failed — check your platform profiles');
      setIsSyncing(false);
    }
    setTimeout(() => setIsSyncing(false), 15000);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const lcSnap = overview.find((s) => s.platform === 'leetcode');
  const cfSnap = overview.find((s) => s.platform === 'codeforces');
  const ghSnap = overview.find((s) => s.platform === 'github');

  const NON_SOLVING = ['github'];
  const totalSolved = overview.filter((s) => !NON_SOLVING.includes(s.platform))
    .reduce((sum, s) => sum + (s.solvedCount || 0), 0);
  const maxStreak = Math.max(...overview.map((s) => s.streak || 0), 0);

  const lcEasy = lcSnap?.extraData?.easySolved ?? 0;
  const lcMedium = lcSnap?.extraData?.mediumSolved ?? 0;
  const lcHard = lcSnap?.extraData?.hardSolved ?? 0;

  const connectedCount = PLATFORMS.filter((p) => overview.find((s) => s.platform === p)).length;

  return (
    <PageTransition>
      <div className="-m-4 md:-m-6 flex flex-row-reverse gap-0" style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)' }}>

        {/* RIGHT PANEL — Profile */}
        <div
          className="w-72 shrink-0 border-l border-white/6 flex flex-col"
        >
          {/* Public profile toggle row */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Globe size={12} /> Public Profile
            </span>
            <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>

          {/* Sync row */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="mx-5 my-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 text-xs text-gray-400 hover:text-gray-200 hover:border-white/15 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin text-violet-400' : ''} />
            {isSyncing ? 'Syncing…' : 'Refresh Now'}
          </button>

          {/* Avatar + name */}
          <div className="px-5 pb-5 flex flex-col items-center text-center border-b border-white/5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 mt-2 ring-2 ring-white/10" style={{ background: user?.avatarColor || '#2563eb' }}>
              {initials}
            </div>
            {/* Edit icon */}
            <div className="w-full flex justify-end mb-1">
              <Link to="/settings" className="text-gray-600 hover:text-gray-300 transition-colors">
                <Settings size={14} />
              </Link>
            </div>
            <h2 className="text-lg font-bold text-white">{user?.name || 'Developer'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">@{user?.username || user?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>

            <button className="mt-3 w-full py-2 px-4 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              Get your Profile Card
            </button>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              {user?.email && (
                <a href={`mailto:${user.email}`} className="text-gray-500 hover:text-gray-300 transition-colors">
                  <Mail size={16} />
                </a>
              )}
              <span className="text-gray-600 cursor-pointer hover:text-gray-300 transition-colors"><Link2 size={16} /></span>
              <span className="text-gray-600 cursor-pointer hover:text-gray-300 transition-colors"><Globe size={16} /></span>
              <span className="text-gray-600 cursor-pointer hover:text-gray-300 transition-colors"><BookOpen size={16} /></span>
            </div>

            {/* Location + education */}
            <div className="mt-4 w-full space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={13} className="text-gray-600 shrink-0" />
                <span>{user?.location || 'India'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <GraduationCap size={13} className="text-gray-600 shrink-0" />
                <span>{user?.college || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {user?.bio || 'No bio added yet. Connect your profiles to get started.'}
            </p>
          </div>

          {/* Problem Solving Stats */}
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Problem Solving Stats</p>

            {PLATFORMS.filter((p) => p !== 'github').map((platform) => (
              <PlatformRow key={platform} platform={platform} snapshot={overview.find((s) => s.platform === platform)} />
            ))}

            <Link to="/settings"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-dashed border-white/12 text-xs text-gray-500 hover:text-gray-300 hover:border-white/25 transition-all">
              + Add Platform
            </Link>
          </div>

          {/* Development Stats */}
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Development Stats</p>
            <PlatformRow platform="github" snapshot={overview.find((s) => s.platform === 'github')} />
          </div>

          {/* Leaderboard placeholder */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Leaderboard</p>
              <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                How It works? <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* LEFT PANEL — Stats */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Connect banner */}
          {connectedCount === 0 && (
            <div className="mx-6 mt-6 flex items-center gap-4 rounded-2xl px-6 py-5 overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
              <div className="flex-1">
                <p className="text-xl font-bold text-white">Showcase Your Problem-Solving Skills</p>
                <p className="text-sm text-orange-100 mt-1">Connect your DSA and competitive profiles to centralize your achievements and stats.</p>
              </div>
              <Link to="/settings">
                <button className="shrink-0 bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                  Connect
                </button>
              </Link>
              <div className="absolute right-32 top-0 bottom-0 flex items-center opacity-20 text-8xl">🦉</div>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 flex items-center gap-3 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Top stats row */}
          <div className="grid grid-cols-2 gap-px mx-6 mt-6 rounded-2xl overflow-hidden border border-white/6">
            {/* Total Questions */}
            <div className="bg-[#111111] px-8 py-6 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Questions</span>
              <span className="text-5xl font-black text-white mt-1">
                {isLoading ? '—' : <AnimatedCounter value={totalSolved} />}
              </span>
            </div>
            {/* Total Active Days */}
            <div className="bg-[#111111] px-8 py-6 flex flex-col gap-1 border-l border-white/6">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Active Days</span>
              <span className="text-5xl font-black text-white mt-1">
                {isLoading ? '—' : <AnimatedCounter value={maxStreak} />}
              </span>
            </div>
          </div>

          {/* Heatmap section */}
          <div className="mx-6 mt-4 bg-[#111111] border border-white/6 rounded-2xl px-6 py-5">
            <UnifiedHeatmap overview={overview} history={history} />
          </div>

          {/* Awards + Difficulty breakdown row */}
          <div className="grid grid-cols-2 gap-4 mx-6 mt-4">
            {/* Awards */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">Awards</p>
                <span className="text-xs text-gray-500">{badges.length}</span>
              </div>
              {badges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center">
                  <div className="text-4xl opacity-20 mb-2">🏅</div>
                  <p className="text-xs text-gray-600">No Badge found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((badge) => (
                    <div
                      key={badge.badgeId}
                      title={`${badge.name} — ${badge.description}`}
                      className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors text-center"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="text-[10px] text-gray-400 leading-tight truncate w-full text-center">{badge.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LeetCode difficulty breakdown */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-6 py-5">
              <p className="text-sm font-semibold text-white mb-4">LeetCode Breakdown</p>
              {isLoading ? (
                <div className="h-24 flex items-center justify-center text-gray-600 text-xs">Loading…</div>
              ) : lcSnap ? (
                <DifficultyDonut easy={lcEasy} medium={lcMedium} hard={lcHard} />
              ) : (
                <div className="h-24 flex items-center justify-center text-gray-600 text-xs">Connect LeetCode to see breakdown</div>
              )}
            </div>
          </div>

          {/* Platform overview inline rows */}
          <div className="mx-6 mt-4 bg-[#111111] border border-white/6 rounded-2xl px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Platform Overview</p>
              <Link to="/settings" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                Manage <ExternalLink size={10} />
              </Link>
            </div>

            <PlatformOverviewGrid overview={overview} />
          </div>

          {/* Bottom row: AI Insights + Upcoming Contests */}
          <div className="grid grid-cols-2 gap-4 mx-6 mt-4 mb-6">
            {/* AI Insights */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-violet-400" />
                <p className="text-sm font-semibold text-white">AI Insights</p>
                <Link to="/insights" className="ml-auto text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                  View all <ChevronRight size={10} />
                </Link>
              </div>
              {insights.length === 0 ? (
                <p className="text-xs text-gray-600 py-4">Insights will appear after syncing your platforms.</p>
              ) : (
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-sm shrink-0">{insight.icon}</span>
                      <p className="text-xs text-gray-400 leading-relaxed">{insight.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Contests */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Swords size={14} className="text-orange-400" />
                <p className="text-sm font-semibold text-white">Upcoming Contests</p>
                <Link to="/contests" className="ml-auto text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                  All <ChevronRight size={10} />
                </Link>
              </div>
              {contests.length === 0 ? (
                <p className="text-xs text-gray-600 py-4">No contests available right now.</p>
              ) : (
                <div className="space-y-3">
                  {contests.slice(0, 3).map((contest, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate font-medium">{contest.name}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{contest.platform}</p>
                      </div>
                      {contest.startTime && (
                        <span className="text-[10px] text-orange-400 font-medium shrink-0">
                          {new Date(contest.startTime).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const PLATFORM_STATS = {
  leetcode:   (s) => [{ label: 'Solved', value: s.solvedCount ?? 0 }, { label: 'Streak', value: s.streak ?? 0, suffix: ' d' }, { label: 'Contests', value: s.contestCount ?? 0 }],
  codeforces: (s) => [{ label: 'Rating', value: s.rating ?? 0 }, { label: 'Max', value: s.extraData?.maxRating ?? 0 }, { label: 'Contests', value: s.contestCount ?? 0 }],
  github:     (s) => [{ label: 'Repos', value: s.extraData?.publicRepos ?? 0 }, { label: 'Stars', value: s.extraData?.stars ?? 0 }, { label: 'Followers', value: s.extraData?.followers ?? 0 }],
  gfg:        (s) => [{ label: 'Solved', value: s.solvedCount ?? 0 }, { label: 'Streak', value: s.streak ?? 0, suffix: ' d' }, { label: 'Score', value: s.rating ?? 0 }],
  codechef:   (s) => [{ label: 'Solved', value: s.solvedCount ?? 0 }, { label: 'Rating', value: s.rating ?? 0 }, { label: 'Contests', value: s.contestCount ?? 0 }],
  atcoder:    (s) => [{ label: 'Rating', value: s.rating ?? 0 }, { label: 'Max', value: s.extraData?.maxRating ?? 0 }, { label: 'Contests', value: s.contestCount ?? 0 }],
};

function PlatformOverviewGrid({ overview }) {
  const connected = PLATFORMS
    .map((p) => ({ platform: p, snap: overview.find((s) => s.platform === p) }))
    .filter(({ snap }) => !!snap);

  if (connected.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-600">Connect your platforms in Settings to see stats here.</p>
        <Link to="/settings" className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          Go to Settings →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-6">
      {connected.map(({ platform, snap }) => {
        const meta = PLATFORM_META[platform];
        const Icon = meta.icon;
        const stats = PLATFORM_STATS[platform]?.(snap) ?? [];
        return (
          <div key={platform} className="space-y-1.5">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
              <Icon size={13} className={meta.color} />
              <span className="text-xs font-semibold text-gray-300">{meta.label}</span>
              <div className={`ml-auto w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            </div>
            {stats.map(({ label, value, suffix = '' }) => (
              <StatRow key={label} label={label} value={value} suffix={suffix} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function StatRow({ label, value, suffix = '' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-bold text-gray-200">
        <AnimatedCounter value={value} suffix={suffix} />
      </span>
    </div>
  );
}
