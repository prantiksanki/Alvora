import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mail, ArrowRight } from 'lucide-react';
import { useJobStats } from '../../hooks/useJobStats';
import { useApplications } from '../../hooks/useApplications';
import JobStatsGrid from '../../components/job-tracker/JobStatsGrid';
import RecentApplications from '../../components/job-tracker/RecentApplications';
import ApplicationFunnel from '../../components/job-tracker/ApplicationFunnel';
import ApplicationModal from '../../components/applications/ApplicationModal';
import ApplicationDrawer from '../../components/applications/ApplicationDrawer';
import PageTransition from '../../components/animations/PageTransition';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Job Tracker</h2>
            <p className="text-gray-400 text-sm mt-1">
              Track applications, monitor pipeline, and stay organized
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/job-tracker/emails">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <Mail size={14} />
                Connect Email
              </Button>
            </Link>
            <Button variant="primary" onClick={() => { setEditingApp(null); setShowModal(true); }}>
              <Plus size={16} />
              Add Application
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        <JobStatsGrid stats={stats} isLoading={statsLoading} />

        {/* Main 3-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent applications — takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentApplications
              applications={applications}
              isLoading={appsLoading}
              onRowClick={setDrawerAppId}
            />
          </div>

          {/* Pipeline funnel */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Pipeline</p>
            </div>
            <ApplicationFunnel stats={stats} isLoading={statsLoading} />
          </Card>
        </div>

        {/* Quick link to full table */}
        <Link to="/job-tracker/applications" className="block">
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/8 text-sm text-gray-500 hover:text-gray-300 hover:border-white/15 hover:bg-white/[0.02] transition-all">
            View all applications
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Modal */}
      <ApplicationModal
        isOpen={showModal}
        mode={editingApp ? 'edit' : 'add'}
        application={editingApp}
        onClose={() => { setShowModal(false); setEditingApp(null); }}
        onSave={handleSave}
      />

      {/* Drawer */}
      <ApplicationDrawer
        applicationId={drawerAppId}
        onClose={() => setDrawerAppId(null)}
        onEdit={(app) => { setDrawerAppId(null); setEditingApp(app); setShowModal(true); }}
        onDelete={handleDelete}
      />
    </PageTransition>
  );
}
