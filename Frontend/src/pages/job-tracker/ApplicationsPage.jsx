import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Briefcase, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplications } from '../../hooks/useApplications';
import ApplicationTable from '../../components/applications/ApplicationTable';
import ApplicationModal from '../../components/applications/ApplicationModal';
import ApplicationDrawer from '../../components/applications/ApplicationDrawer';
import PageTransition from '../../components/animations/PageTransition';

const STATUS_FILTERS = [
  { value: '',                    label: 'All'        },
  { value: 'Applied',             label: 'Applied'    },
  { value: 'OA_Received',         label: 'OA'         },
  { value: 'Interview_Scheduled', label: 'Interview'  },
  { value: 'Next_Round',          label: 'Next Round' },
  { value: 'Offer',               label: 'Offer'      },
  { value: 'Rejected',            label: 'Rejected'   },
  { value: 'Ghosted',             label: 'Ghosted'    },
];

const SORT_OPTIONS = [
  { value: 'lastUpdated', label: 'Last Updated' },
  { value: 'appliedDate', label: 'Applied Date'  },
  { value: 'company',     label: 'Company'       },
  { value: 'status',      label: 'Status'        },
];

const STATUS_COLORS = {
  '':                    { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
  Applied:               { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)'  },
  OA_Received:           { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
  Interview_Scheduled:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',border: 'rgba(167,139,250,0.2)' },
  Next_Round:            { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.2)'  },
  Offer:                 { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  Rejected:              { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
  Ghosted:              { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
};

export default function ApplicationsPage() {
  const {
    applications, pagination, filters, isLoading, error,
    setFilter, setPage, createApplication, updateApplication, deleteApplication,
  } = useApplications();

  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editingApp, setEditingApp]   = useState(null);
  const [drawerAppId, setDrawerAppId] = useState(null);
  const [sortOpen, setSortOpen]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilter('search', searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput, setFilter]);

  const handleOpenAdd  = () => { setEditingApp(null); setShowModal(true); };
  const handleOpenEdit = (app) => { setEditingApp(app); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditingApp(null); };

  const handleSave = async (data) => {
    if (editingApp) await updateApplication(editingApp._id, data);
    else await createApplication(data);
  };

  const handleDelete = async (id) => {
    await deleteApplication(id);
    if (drawerAppId === id) setDrawerAppId(null);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || 'Sort';
  const activeStatus = STATUS_COLORS[filters.status] || STATUS_COLORS[''];

  return (
    <PageTransition>
      <div className="-m-4 md:-m-6 flex flex-col" style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 64px)' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Briefcase size={16} className="text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Applications</h2>
                {!isLoading && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    {pagination.total}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Page {pagination.page} of {pagination.pages || 1}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
          >
            <Plus size={13} />
            Add Application
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-8 py-3 border-b border-white/5 shrink-0">
          {/* Search */}
          <div className="relative w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search company or role…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
            {STATUS_FILTERS.map((sf) => {
              const sc = STATUS_COLORS[sf.value] || STATUS_COLORS[''];
              const isActive = filters.status === sf.value;
              return (
                <button
                  key={sf.value}
                  onClick={() => setFilter('status', sf.value)}
                  className="shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: isActive ? sc.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? sc.border : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? sc.color : '#6b7280',
                  }}
                >
                  {sf.label}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <SlidersHorizontal size={12} />
              {currentSortLabel}
              <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-9 z-30 w-44 rounded-xl shadow-2xl overflow-hidden"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setFilter('sortBy', opt.value); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5"
                      style={{ color: filters.sortBy === opt.value ? '#a78bfa' : '#9ca3af' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mx-8 mt-4 px-4 py-3 rounded-xl text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* ── Table ── */}
        <div className="flex-1 px-8 py-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ApplicationTable
              applications={applications}
              isLoading={isLoading}
              onRowClick={setDrawerAppId}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={(key, order) => { setFilter('sortBy', key); setFilter('sortOrder', order); }}
            />
          </div>
        </div>

        {/* ── Pagination ── */}
        {!isLoading && pagination.total > 0 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-white/6 shrink-0">
            <span className="text-xs text-gray-600">
              {pagination.total} applications · page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ApplicationModal
        isOpen={showModal}
        mode={editingApp ? 'edit' : 'add'}
        application={editingApp}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
      <ApplicationDrawer
        applicationId={drawerAppId}
        onClose={() => setDrawerAppId(null)}
        onEdit={(app) => { setDrawerAppId(null); handleOpenEdit(app); }}
        onDelete={handleDelete}
      />
    </PageTransition>
  );
}
