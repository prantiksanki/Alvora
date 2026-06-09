import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Plus, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmails } from '../../hooks/useEmails';
import EmailCard from '../../components/emails/EmailCard';
import PageTransition from '../../components/animations/PageTransition';

export default function EmailsPage() {
  const { accounts, isLoading, syncingId, isConnecting, refetch, connectGmail, syncAccount, deleteAccount } = useEmails();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      toast.success('Gmail connected! Starting initial sync…');
      refetch();
      window.history.replaceState({}, '', '/job-tracker/emails');
    }
    if (searchParams.get('error')) {
      toast.error(`Gmail connection failed: ${searchParams.get('error')}`);
      window.history.replaceState({}, '', '/job-tracker/emails');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = (id) => syncAccount(id, {
    onComplete: () => { refetch(); navigate('/job-tracker'); },
  });

  const handleDelete = (id) => deleteAccount(id, {
    onComplete: () => navigate('/job-tracker'),
  });

  return (
    <PageTransition>
      <div className="max-w-2xl space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Email Accounts</h2>
            <p className="text-gray-500 text-sm mt-1">
              Connect Gmail to auto-track job applications from your inbox
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={connectGmail}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }}
          >
            {isConnecting
              ? <RefreshCw size={14} className="animate-spin" />
              : <Plus size={14} />}
            {isConnecting ? 'Connecting…' : 'Connect Gmail'}
          </motion.button>
        </div>

        {/* ── How it works strip ── */}
        <div className="flex items-start gap-3 py-3.5 border-y border-white/5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/12 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={13} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-0.5">How it works</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Alvora scans your inbox every 30 minutes, detects job-related emails, and updates your application tracker automatically — no manual entry needed.
            </p>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/5 rounded w-48" />
                  <div className="h-2.5 bg-white/4 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && accounts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Mail size={24} className="text-violet-400" />
            </div>
            <p className="text-base font-semibold text-white mb-1">No accounts connected</p>
            <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
              Connect your Gmail to start automatically tracking job applications from your inbox.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={connectGmail}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 16px rgba(139,92,246,0.25)' }}
            >
              <Plus size={14} />
              Connect Gmail
            </motion.button>
          </motion.div>
        )}

        {/* ── Account list ── */}
        {!isLoading && accounts.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Connected · {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </p>
            <div>
              {accounts.map((account, i) => (
                <motion.div
                  key={account._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <EmailCard
                    account={account}
                    onSync={handleSync}
                    onDelete={handleDelete}
                    isSyncing={syncingId === account._id}
                  />
                </motion.div>
              ))}
            </div>

            {/* Add another — inline row */}
            <button
              onClick={connectGmail}
              disabled={isConnecting}
              className="flex items-center gap-2 mt-2 py-3.5 w-full text-sm text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40 border-b border-white/5"
            >
              <div className="w-9 h-9 rounded-xl border border-dashed border-white/10 flex items-center justify-center shrink-0">
                <Plus size={14} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-500">Add another account</p>
                <p className="text-[10px] text-gray-700 mt-0.5">Connect a second Gmail for more coverage</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
