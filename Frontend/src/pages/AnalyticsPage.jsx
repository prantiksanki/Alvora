import { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { analyticsService } from '../services/analyticsService';
import PageTransition from '../components/animations/PageTransition';
import { RatingChart, SolvedChart, HeatmapChart, PlatformComparisonChart } from '../components/charts';
import Card from '../components/ui/Card';

const PLATFORMS = ['all', 'leetcode', 'codeforces', 'github', 'gfg'];
const PLATFORM_LABELS = { all: 'All', leetcode: 'LeetCode', codeforces: 'Codeforces', github: 'GitHub', gfg: 'GFG' };
const DAYS_OPTIONS = [7, 30, 90, null];
const DAYS_LABELS = { 7: '7D', 30: '30D', 90: '90D', null: 'All' };

export default function AnalyticsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDays, setSelectedDays] = useState(90);
  const { overview, history, isLoading, refetch } = useAnalytics();
  const [heatmapHistory, setHeatmapHistory] = useState([]);

  useEffect(() => {
    analyticsService.getHistory(null, 365).then(setHeatmapHistory).catch(() => {});
  }, []);

  const handlePlatformChange = (p) => {
    setSelectedPlatform(p);
    refetch(p === 'all' ? null : p, selectedDays);
  };

  const handleDaysChange = (d) => {
    setSelectedDays(d);
    refetch(selectedPlatform === 'all' ? null : selectedPlatform, d);
  };

  // Derive daily activity counts from cumulative snapshots for the heatmap
  const heatmapData = useMemo(() => {
    const byPlatform = {};
    heatmapHistory.forEach((s) => {
      if (!byPlatform[s.platform]) byPlatform[s.platform] = [];
      byPlatform[s.platform].push(s);
    });
    const dateMap = {};
    Object.values(byPlatform).forEach((snaps) => {
      snaps.sort((a, b) => new Date(a.date) - new Date(b.date));
      snaps.forEach((snap, i) => {
        const dateStr = snap.date.split('T')[0];
        const prev = snaps[i - 1];
        const delta = prev ? Math.max(0, snap.solvedCount - prev.solvedCount) : snap.solvedCount;
        dateMap[dateStr] = (dateMap[dateStr] || 0) + delta;
      });
    });
    return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
  }, [heatmapHistory]);

  // Build chart data
  const ratingData = history
    .reduce((acc, s) => {
      const existing = acc.find((d) => d.date === s.date);
      if (existing) {
        if (s.platform === 'codeforces') existing.codeforces = s.rating;
        if (s.platform === 'leetcode') existing.leetcode = s.rating;
      } else {
        const entry = { date: s.date };
        if (s.platform === 'codeforces') entry.codeforces = s.rating;
        if (s.platform === 'leetcode') entry.leetcode = s.rating;
        acc.push(entry);
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const solvedData = history
    .filter((s) => s.platform === 'leetcode' || (selectedPlatform !== 'all' && s.platform === selectedPlatform))
    .map((s) => ({ date: s.date, count: s.solvedCount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header + filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">Detailed performance trends</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Platform tabs */}
            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedPlatform === p
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>

            {/* Days selector */}
            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={String(d)}
                  onClick={() => handleDaysChange(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedDays === d
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {DAYS_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rating over time */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4">Codeforces Rating Progression</p>
          <RatingChart data={ratingData} isLoading={isLoading} />
        </Card>

        {/* Solved trend */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4">Problems Solved Over Time</p>
          <SolvedChart data={solvedData} isLoading={isLoading} />
        </Card>

        {/* GitHub heatmap */}
        {(selectedPlatform === 'all' || selectedPlatform === 'github') && (
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Activity Heatmap</p>
            <HeatmapChart data={heatmapData} />
          </Card>
        )}

        {/* Comparison + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Platform Comparison</p>
            <PlatformComparisonChart overview={overview} isLoading={isLoading} />
          </Card>

          <Card>
            <p className="text-sm font-semibold text-white mb-4">Platform Summary</p>
            <div className="space-y-3">
              {overview.map((s) => (
                <div key={s.platform} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-gray-300 capitalize">{s.platform}</span>
                  <div className="flex gap-4 text-xs text-gray-400">
                    {s.solvedCount > 0 && <span><span className="text-white font-medium">{s.solvedCount}</span> solved</span>}
                    {s.rating > 0 && <span><span className="text-white font-medium">{s.rating}</span> rating</span>}
                    {s.streak > 0 && <span><span className="text-violet-400 font-medium">{s.streak}</span> streak</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
