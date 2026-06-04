import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Brain, Code2, Zap, GitBranch } from 'lucide-react';
import { useInsights } from '../hooks/useInsights';
import { useGamification } from '../hooks/useGamification';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import XPBar from '../components/gamification/XPBar';
import BadgeGrid from '../components/gamification/BadgeGrid';
import LevelBadge from '../components/gamification/LevelBadge';

const SEVERITY_STYLES = {
  success: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Great' },
  warning: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', label: 'Notice' },
  tip: { bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400', label: 'Tip' },
  info: { bg: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400', label: 'Info' },
};

const SCORE_CONFIG = [
  { key: 'dsaReadiness', label: 'DSA Readiness', icon: Code2, color: 'violet', desc: 'Based on problems solved, CF rating, and contest count' },
  { key: 'interviewReadiness', label: 'Interview Readiness', icon: Brain, color: 'cyan', desc: 'Combines DSA score with GitHub portfolio strength' },
  { key: 'consistencyScore', label: 'Consistency Score', icon: Zap, color: 'emerald', desc: 'Active days in the last 30 days' },
  { key: 'openSourceScore', label: 'Open Source Score', icon: GitBranch, color: 'yellow', desc: 'Based on GitHub stars, repos, and followers' },
];

const ScoreCard = ({ config, value = 0, isLoading }) => {
  const { key, label, icon: Icon, color, desc } = config;
  return (
    <Card gradient>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/15`}>
          <Icon size={16} className={`text-${color}-400`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-500 truncate">{desc}</p>
        </div>
        <div className="text-2xl font-bold text-white">{isLoading ? '—' : `${value}%`}</div>
      </div>
      <ProgressBar value={value} max={100} color={color} showPercent={false} height="h-2" />
    </Card>
  );
};

export default function InsightsPage() {
  const { insights, scores, isLoading, error, refresh } = useInsights();
  const gamification = useGamification();

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={24} className="text-violet-400" />
              AI Insights
            </h2>
            <p className="text-gray-400 text-sm mt-1">Personalized analysis of your coding journey</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-violet-300">
            {error}
          </div>
        )}

        {/* Readiness Scores */}
        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">Readiness Scores</p>
          <FadeIn stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCORE_CONFIG.map((config) => (
              <FadeIn.Item key={config.key}>
                <ScoreCard config={config} value={scores?.[config.key] || 0} isLoading={isLoading} />
              </FadeIn.Item>
            ))}
          </FadeIn>
        </div>

        {/* Insights + Gamification */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insights list */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-sm font-semibold text-gray-300">Personalized Insights</p>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-white/5 rounded-xl" />
              ))
            ) : (
              <FadeIn stagger={0.06} className="space-y-3">
                {insights.map((insight, i) => {
                  const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
                  return (
                    <FadeIn.Item key={i}>
                      <div className={`border rounded-xl px-4 py-3 flex items-start gap-3 ${style.bg}`}>
                        <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                              {insight.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed">{insight.message}</p>
                        </div>
                      </div>
                    </FadeIn.Item>
                  );
                })}
              </FadeIn>
            )}
          </div>

          {/* Gamification sidebar */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-300">Your Progress</p>

            <div className="flex justify-center">
              <LevelBadge level={gamification.level} levelName={gamification.levelName} size="lg" />
            </div>

            <XPBar
              totalXP={gamification.totalXP}
              level={gamification.level}
              levelName={gamification.levelName}
              xpToNext={gamification.xpToNext}
            />

            <Card>
              <p className="text-sm font-semibold text-white mb-3">
                Badges ({gamification.badgeCount})
              </p>
              <BadgeGrid badges={gamification.badges} showLocked={true} />
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
