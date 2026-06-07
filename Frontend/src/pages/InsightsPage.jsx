import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Swords, Briefcase, Flame, GitMerge, ShieldCheck, Lock, TrendingUp } from 'lucide-react';
import { useInsights } from '../hooks/useInsights';
import { useGamification } from '../hooks/useGamification';
import PageTransition from '../components/animations/PageTransition';

const SCORE_CONFIG = [
  { key: 'dsaReadiness',       label: 'DSA Readiness',      icon: Swords,    color: '#8b5cf6', trackRgb: '139,92,246',  desc: 'Based on problems solved, CF rating & contest count' },
  { key: 'interviewReadiness', label: 'Interview Readiness', icon: Briefcase, color: '#06b6d4', trackRgb: '6,182,212',   desc: 'Combines DSA score with GitHub portfolio strength' },
  { key: 'consistencyScore',   label: 'Consistency Score',   icon: Flame,     color: '#10b981', trackRgb: '16,185,129',  desc: 'Active days in the last 30 days' },
  { key: 'openSourceScore',    label: 'Open Source Score',   icon: GitMerge,  color: '#eab308', trackRgb: '234,179,8',   desc: 'Based on GitHub stars, repos & followers' },
];

const SEVERITY = {
  success: { labelCls: 'text-emerald-400', accent: 'bg-emerald-500', icon: ShieldCheck, iconColor: '#10b981', iconBg: '16,185,129' },
  warning: { labelCls: 'text-yellow-400',  accent: 'bg-yellow-500',  icon: TrendingUp,  iconColor: '#eab308', iconBg: '234,179,8'  },
  tip:     { labelCls: 'text-cyan-400',    accent: 'bg-cyan-500',    icon: Sparkles,    iconColor: '#06b6d4', iconBg: '6,182,212'  },
  info:    { labelCls: 'text-violet-400',  accent: 'bg-violet-500',  icon: Swords,      iconColor: '#8b5cf6', iconBg: '139,92,246' },
};

const LEVEL_COLORS = {
  1: '#6b7280', 2: '#10b981', 3: '#3b82f6',
  4: '#8b5cf6', 5: '#f97316', 6: '#ef4444',
};

function ScoreRow({ config, value = 0, isLoading }) {
  const { label, icon: Icon, color, trackRgb, desc } = config;
  const pct = Math.min(100, Math.round(value));
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `rgba(${trackRgb},0.12)` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          <span className="text-sm font-bold text-white tabular-nums">
            {isLoading ? '—' : `${pct}%`}
          </span>
        </div>
        <div className="h-1.5 rounded-full w-full bg-white/6">
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: isLoading ? '0%' : `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
        <p className="text-[10px] text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function InsightRow({ insight, index }) {
  const s = SEVERITY[insight.severity] || SEVERITY.info;
  const Icon = s.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="flex items-start gap-3 py-4 border-b border-white/5 last:border-0"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `rgba(${s.iconBg},0.12)` }}
      >
        <Icon size={15} style={{ color: s.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${s.labelCls}`}>
          {insight.category}
        </span>
        <p className="text-sm text-gray-300 leading-relaxed mt-0.5">{insight.message}</p>
      </div>
    </motion.div>
  );
}

export default function InsightsPage() {
  const { insights, scores, isLoading, error, refresh } = useInsights();
  const { totalXP, level, levelName, xpToNext, badges, badgeCount } = useGamification();

  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[1];
  // XP fill: what fraction of the way to next level
  const fillPct = xpToNext === 0 ? 100 : totalXP === 0 ? 0
    : Math.round((totalXP / (totalXP + xpToNext)) * 100);

  return (
    <PageTransition>
      {/* Break out of the layout padding, same as Dashboard */}
      <div className="-m-4 md:-m-6 flex flex-col" style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)', paddingBottom: '80px' }}>

        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-violet-400" />
            <div>
              <h2 className="text-base font-bold text-white">AI Insights</h2>
              <p className="text-xs text-gray-500 mt-0.5">Personalized analysis of your coding journey</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 px-8 py-6 space-y-5">

            {error && (
              <div className="border border-yellow-500/20 rounded-xl px-4 py-3 text-xs text-yellow-400 bg-yellow-500/5">
                {error}
              </div>
            )}

            {/* Readiness Scores */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-6 py-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Readiness Scores
              </p>
              {SCORE_CONFIG.map((cfg) => (
                <ScoreRow
                  key={cfg.key}
                  config={cfg}
                  value={scores?.[cfg.key] ?? 0}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* Personalized Insights */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-6 py-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Personalized Insights
              </p>
              {isLoading ? (
                <div className="space-y-3 mt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-white/4" />
                  ))}
                </div>
              ) : insights.length === 0 ? (
                <p className="text-sm text-gray-600 py-8 text-center">
                  No insights yet — sync your platforms to generate analysis.
                </p>
              ) : (
                insights.map((insight, i) => (
                  <InsightRow key={i} insight={insight} index={i} />
                ))
              )}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-64 shrink-0 border-l border-white/6 px-5 py-6 space-y-5">

            {/* Level */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Your Progress
              </p>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white"
                  style={{
                    background: `${levelColor}22`,
                    border: `2px solid ${levelColor}55`,
                  }}
                >
                  {level}
                </div>
                <p className="text-sm font-bold text-white">{levelName}</p>
                <p className="text-xs text-gray-600">Level {level}</p>
              </div>
            </div>

            {/* XP bar */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: `${levelColor}22` }}
                  >
                    <TrendingUp size={12} style={{ color: levelColor }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Level {level}</p>
                    <p className="text-[10px] text-gray-500">{levelName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{totalXP.toLocaleString()} XP</p>
                  {xpToNext > 0 && (
                    <p className="text-[10px] text-gray-600">{xpToNext} to next</p>
                  )}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/6">
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{ background: levelColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="bg-[#111111] border border-white/6 rounded-2xl px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Badges
                </p>
                <span className="text-xs text-gray-600">{badgeCount}</span>
              </div>

              {badgeCount === 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 py-2 opacity-20">
                      <Lock size={16} className="text-gray-500" />
                      <p className="text-[9px] text-gray-600">???</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {badges.map((badge, i) => (
                    <motion.div
                      key={badge.badgeId}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      title={`${badge.name} — ${badge.description}`}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-white/4 transition-colors"
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <p className="text-[9px] text-gray-500 text-center leading-tight truncate w-full">
                        {badge.name}
                      </p>
                    </motion.div>
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
