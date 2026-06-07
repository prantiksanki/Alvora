import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Plus, Mail, ArrowRight,
  Send, Clock, Users, PartyPopper, ChevronRight,
} from 'lucide-react';
import { useJobStats } from '../../hooks/useJobStats';
import { useApplications } from '../../hooks/useApplications';
import ApplicationModal from '../../components/applications/ApplicationModal';
import ApplicationDrawer from '../../components/applications/ApplicationDrawer';
import StatusBadge from '../../components/applications/StatusBadge';
import PageTransition from '../../components/animations/PageTransition';
import { formatRelativeTime } from '../../utils/formatters';

const FUNNEL_STAGES = [
  { key: 'Applied',             label: 'Applied',   color: '#60a5fa', rgb: '96,165,250'   },
  { key: 'OA_Received',         label: 'OA',        color: '#fbbf24', rgb: '251,191,36'   },
  { key: 'Interview_Scheduled', label: 'Interview', color: '#a78bfa', rgb: '167,139,250'  },
  { key: 'Next_Round',          label: 'Final',     color: '#22d3ee', rgb: '34,211,238'   },
  { key: 'Offer',               label: 'Offer',     color: '#34d399', rgb: '52,211,153'   },
];

function StatRow({ icon: Icon, label, value, color, rgb, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <span className="text-sm text-gray-400 flex-1">{label}</span>
      <span className="text-2xl font-black text-white tabular-nums">{value}</span>
    </motion.div>
  );
}

function FunnelBar({ stage, count, max, index }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className="flex items-center gap-3"
    >
      <span className="text-[11px] text-gray-500 w-14 shrink-0 text-right">{stage.label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5">
        <motion.div
          className="h-2 rounded-full"
          style={{ background: stage.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.06 }}
        />
      </div>
      <span className="text-[11px] font-semibold tabular-nums w-5 text-right" style={{ color: stage.color }}>
        {count}
      </span>
    </motion.div>
  );
}

export default function JobTrackerPage() {
  const { stats, isLoading: statsLoading } = useJobStats();
  const {
    applications, isLoading: appsLoading,
    createApplication, updateApplication, deleteApplication,
  } = useApplications({ limit: 8 });

  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [drawerAppId, setDrawerAppId] = useState(null);

  const handleSave = async (data) => {
    if (editingApp) await updateApplication(editingApp._id, data);
    else await createApplication(data);
  };

  const handleDelete = async (id) => {
    await deleteApplication(id);
    if (drawerAppId === id) setDrawerAppId(null);
  };

  // Build stats
  const total = stats?.total ?? 0;
  const getCount = (keys) =>
    (stats?.byStatus ?? []).filter((s) => keys.includes(s._id)).reduce((n, s) => n + s.count, 0);
  const inProgress = getCount(['Applied', 'OA_Received', 'Interview_Scheduled', 'Next_Round']);
  const interviews = getCount(['Interview_Scheduled', 'Next_Round']);
  const offers     = (stats?.byStatus ?? []).find((s) => s._id === 'Offer')?.count ?? 0;

  // Funnel data
  const funnelData = FUNNEL_STAGES.map((s) => ({
    ...s,
    count: (stats?.byStatus ?? []).find((b) => b._id === s.key)?.count ?? 0,
  }));
  const funnelMax = Math.max(...funnelData.map((d) => d.count), 1);

  // Success rate
  const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  return (
    <PageTransition>
      <div className="-m-4 md:-m-6 flex flex-col" style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Briefcase size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Job Tracker</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track applications, monitor pipeline, and stay organized</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/job-tracker/emails"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Mail size={12} />
              Connect Email
            </Link>
            <button
              onClick={() => { setEditingApp(null); setShowModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
            >
              <Plus size={13} />
              Add Application
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">

          {/* ── Left: Main content ── */}
          <div className="flex-1 min-w-0 px-8 py-6 space-y-6">

            {/* Stats row — flat inline, no cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/6">
              {[
                { icon: Send,        label: 'Total Applied', value: total,      color: '#8b5cf6', rgb: '139,92,246' },
                { icon: Clock,       label: 'In Progress',   value: inProgress, color: '#06b6d4', rgb: '6,182,212'  },
                { icon: Users,       label: 'Interviews',    value: interviews, color: '#eab308', rgb: '234,179,8'  },
                { icon: PartyPopper, label: 'Offers',        value: offers,     color: '#10b981', rgb: '16,185,129' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-[#111111] px-6 py-5 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `rgba(${s.rgb},0.1)`, border: `1px solid rgba(${s.rgb},0.2)` }}
                  >
                    <s.icon size={17} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
                    <p className="text-3xl font-black text-white tabular-nums leading-tight mt-0.5">
                      {statsLoading ? '—' : s.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Applications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">Recent Applications</p>
                <Link
                  to="/job-tracker/applications"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition-colors"
                >
                  View All <ArrowRight size={12} />
                </Link>
              </div>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {appsLoading ? (
                  <div className="divide-y divide-white/5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-white/8 rounded animate-pulse" />
                          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-3">
                      <Briefcase size={18} className="text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">No applications yet</p>
                    <p className="text-xs text-gray-600 mt-1">Add your first application to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {applications.slice(0, 8).map((app, i) => (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setDrawerAppId(app._id)}
                        className="group flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-white/2.5 transition-colors"
                      >
                        {/* Company initial */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: `rgba(139,92,246,0.15)`, border: '1px solid rgba(139,92,246,0.2)' }}
                        >
                          {app.company?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                            {app.company}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{app.role}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={app.status} size="sm" />
                          <span className="text-[11px] text-gray-600 hidden sm:block w-16 text-right">
                            {app.appliedDate ? formatRelativeTime(app.appliedDate) : ''}
                          </span>
                          <ChevronRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* View all link */}
              <Link to="/job-tracker/applications">
                <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs text-gray-600 hover:text-gray-300 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  View all applications <ArrowRight size={12} />
                </div>
              </Link>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-72 shrink-0 border-l border-white/6 px-6 py-6 space-y-6">

            {/* Pipeline funnel */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Pipeline</p>
              {statsLoading ? (
                <div className="space-y-3">
                  {FUNNEL_STAGES.map((s) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className="w-14 h-2 bg-white/5 rounded animate-pulse" />
                      <div className="flex-1 h-2 bg-white/5 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {funnelData.map((stage, i) => (
                    <FunnelBar key={stage.key} stage={stage} count={stage.count} max={funnelMax} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Quick stats */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Overview</p>
              <div className="space-y-3">
                {[
                  { label: 'Success Rate',    value: statsLoading ? '—' : `${successRate}%`,  color: '#10b981', rgb: '16,185,129'  },
                  { label: 'Response Rate',   value: statsLoading ? '—' : total > 0 ? `${Math.round((inProgress / total) * 100)}%` : '0%', color: '#06b6d4', rgb: '6,182,212' },
                  { label: 'Active Pipeline', value: statsLoading ? '—' : inProgress,         color: '#8b5cf6', rgb: '139,92,246'  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Status breakdown */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Status Breakdown</p>
              <div className="space-y-2">
                {(stats?.byStatus ?? [])
                  .filter((s) => s.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((s) => (
                    <div key={s._id} className="flex items-center justify-between">
                      <StatusBadge status={s._id} size="sm" />
                      <span className="text-xs font-semibold text-gray-400 tabular-nums">{s.count}</span>
                    </div>
                  ))}
                {!statsLoading && (stats?.byStatus ?? []).filter((s) => s.count > 0).length === 0 && (
                  <p className="text-xs text-gray-600">No data yet</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <ApplicationModal
        isOpen={showModal}
        mode={editingApp ? 'edit' : 'add'}
        application={editingApp}
        onClose={() => { setShowModal(false); setEditingApp(null); }}
        onSave={handleSave}
      />
      <ApplicationDrawer
        applicationId={drawerAppId}
        onClose={() => setDrawerAppId(null)}
        onEdit={(app) => { setDrawerAppId(null); setEditingApp(app); setShowModal(true); }}
        onDelete={handleDelete}
      />
    </PageTransition>
  );
}
