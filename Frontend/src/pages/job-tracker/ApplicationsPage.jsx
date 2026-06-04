import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApplications } from '../../hooks/useApplications';
import ApplicationTable from '../../components/applications/ApplicationTable';
import ApplicationModal from '../../components/applications/ApplicationModal';
import ApplicationDrawer from '../../components/applications/ApplicationDrawer';
import PageTransition from '../../components/animations/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const STATUS_FILTERS = [
  { value: '',                    label: 'All'       },
  { value: 'Applied',             label: 'Applied'   },
  { value: 'OA_Received',         label: 'OA'        },
  { value: 'Interview_Scheduled', label: 'Interview' },
  { value: 'Next_Round',          label: 'Next Round'},
  { value: 'Offer',               label: 'Offer'     },
  { value: 'Rejected',            label: 'Rejected'  },
  { value: 'Ghosted',             label: 'Ghosted'   },
];

const SORT_OPTIONS = [
  { value: 'lastUpdated', label: 'Last Updated' },
  { value: 'appliedDate', label: 'Applied Date'  },
  { value: 'company',     label: 'Company'       },
  { value: 'status',      label: 'Status'        },
];

export default function ApplicationsPage() {
  const {
    applications, pagination, filters, isLoading, error,
    setFilter, setPage, createApplication, updateApplication, deleteApplication,
  } = useApplications();

  // Local search input for debouncing
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [drawerAppId, setDrawerAppId] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setFilter('search', searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput, setFilter]);

  const handleOpenAdd = () => { setEditingApp(null); setShowModal(true); };
  const handleOpenEdit = (app) => { setEditingApp(app); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditingApp(null); };

  const handleSave = async (data) => {
    if (editingApp) {
      await updateApplication(editingApp._id, data);
    } else {
      await createApplication(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteApplication(id);
    if (drawerAppId === id) setDrawerAppId(null);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || 'Sort';

  return (
    <PageTransition>
      <div className="space-y-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Applications</h2>
            {!isLoading && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                {pagination.total}
              </span>
            )}
          </div>
          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            Add Application
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Status pills — horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setFilter('status', sf.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  filters.status === sf.value
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5"
            >
              <SlidersHorizontal size={13} />
              {currentSortLabel}
            </Button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  onBlur={() => setSortOpen(false)}
                  className="absolute right-0 top-10 z-30 w-44 backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setFilter('sortBy', opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                        filters.sortBy === opt.value ? 'text-violet-400' : 'text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <Card padding="p-0">
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
        </Card>

        {/* Pagination */}
        {!isLoading && pagination.total > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} applications
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ApplicationModal
        isOpen={showModal}
        mode={editingApp ? 'edit' : 'add'}
        application={editingApp}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Detail Drawer */}
      <ApplicationDrawer
        applicationId={drawerAppId}
        onClose={() => setDrawerAppId(null)}
        onEdit={(app) => { setDrawerAppId(null); handleOpenEdit(app); }}
        onDelete={handleDelete}
      />
    </PageTransition>
  );
}
