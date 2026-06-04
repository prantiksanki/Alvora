import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useInsights } from '../hooks/useInsights';
import { useJobSocket } from '../context/JobSocketContext';
import { getGreeting } from '../utils/formatters';
import api from '../services/api';
import PageTransition from '../components/animations/PageTransition';
import { OverviewGrid, PlatformCard, ActivityFeed, StreakWidget } from '../components/dashboard';
import InsightCard from '../components/dashboard/InsightCard';
import ContestCountdown from '../components/dashboard/ContestCountdown';
import { SolvedChart, PlatformComparisonChart } from '../components/charts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PLATFORMS = ['leetcode', 'codeforces', 'github', 'gfg', 'codechef', 'atcoder'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, history, isLoading, error, refetch } = useAnalytics();
  const { insights, isLoading: insightsLoading } = useInsights();
  const { lastSnapshotUpdate } = useJobSocket();
  const [contests, setContests] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    api.get('/contests/upcoming').then(({ data }) => setContests(data)).catch(() => {});
  }, []);

  // Auto-refetch when backend signals a snapshot was updated via Socket.IO
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
    // Fallback: if socket event never fires (no socket connection), stop spinner after 15s
    setTimeout(() => setIsSyncing(false), 15000);
  };

  // Build solved-over-time data for SolvedChart
  const solvedHistory = history
    .filter((s) => s.platform === 'leetcode')
    .map((s) => ({ date: s.date, count: s.solvedCount }));

  // Current streak across all platforms
  const maxStreak = Math.max(...overview.map((s) => s.streak || 0), 0);

  const weekActivity = [];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Developer'} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">Here&apos;s your progress overview.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sync Now button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSync}
              disabled={isSyncing}
              title="Sync your coding stats now"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 hover:border-white/20 transition-all duration-200 text-xs font-medium disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={isSyncing ? 'animate-spin text-violet-400' : ''}
              />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
            </motion.button>

            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings size={14} />
                Connect Profiles
              </Button>
            </Link>
          </div>
        </div>

        {/* Error/demo banner */}
        {error && (
          <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-violet-300">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Stats grid */}
        <OverviewGrid overview={overview} isLoading={isLoading} />

        {/* Platform cards + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Platform cards 2×2 */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const snap = overview.find((s) => s.platform === platform);
              return (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  snapshot={snap}
                  isLoading={isLoading}
                />
              );
            })}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <StreakWidget
              currentStreak={maxStreak}
              maxStreak={maxStreak + 8}
              weekActivity={weekActivity}
              isLoading={isLoading}
            />
            <InsightCard insights={insights} isLoading={insightsLoading} />
            <ContestCountdown contests={contests} />
            <ActivityFeed items={[]} isLoading={isLoading} />
          </div>
        </div>

        {/* Quick charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Problems Solved (Last 30 Days)</p>
            <SolvedChart data={solvedHistory.slice(-30)} isLoading={isLoading} />
          </Card>
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Platform Comparison</p>
            <PlatformComparisonChart overview={overview} isLoading={isLoading} />
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
