import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmails } from '../../hooks/useEmails';
import EmailCard from '../../components/emails/EmailCard';
import ConnectEmailButton from '../../components/emails/ConnectEmailButton';
import PageTransition from '../../components/animations/PageTransition';
import FadeIn from '../../components/animations/FadeIn';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Card from '../../components/ui/Card';

export default function EmailsPage() {
  const { accounts, isLoading, syncingId, isConnecting, refetch, connectGmail, syncAccount, deleteAccount } = useEmails();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle OAuth callback redirect
  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      toast.success('Gmail connected successfully! Starting initial sync...');
      refetch();
      window.history.replaceState({}, '', '/job-tracker/emails');
    }
    if (searchParams.get('error')) {
      toast.error(`Gmail connection failed: ${searchParams.get('error')}`);
      window.history.replaceState({}, '', '/job-tracker/emails');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Email Accounts</h2>
            <p className="text-gray-400 text-sm mt-1">
              Connect your Gmail to automatically track job applications
            </p>
          </div>
          <ConnectEmailButton onClick={connectGmail} isLoading={isConnecting} />
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/8 border border-violet-500/20">
          <div className="p-1.5 rounded-lg bg-violet-500/15 shrink-0 mt-0.5">
            <Mail size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-violet-300">How it works</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Connect your Gmail account and Alvora will automatically scan your inbox every 30 minutes,
              detect job-related emails, and update your application tracker — no manual entry needed.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => <LoadingSkeleton.Card key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && accounts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="p-5 rounded-2xl bg-violet-500/10 mb-5">
              <Mail size={36} className="text-violet-400" />
            </div>
            <p className="text-white font-semibold text-lg mb-1">No email accounts connected</p>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Connect your Gmail to start tracking job applications automatically from your inbox.
            </p>
            <ConnectEmailButton onClick={connectGmail} isLoading={isConnecting} />
          </motion.div>
        )}

        {/* Account cards */}
        {!isLoading && accounts.length > 0 && (
          <FadeIn stagger={0.06} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <FadeIn.Item key={account._id}>
                <EmailCard
                  account={account}
                  onSync={(id) =>
                    syncAccount(id, {
                      onComplete: () => {
                        refetch();              // refresh card to show updated lastSyncedAt
                        navigate('/job-tracker'); // dashboard re-fetches fresh data on mount
                      },
                    })
                  }
                  onDelete={(id) =>
                    deleteAccount(id, {
                      onComplete: () => navigate('/job-tracker'),
                    })
                  }
                  isSyncing={syncingId === account._id}
                />
              </FadeIn.Item>
            ))}
          </FadeIn>
        )}

        {/* "Connect another" card (when accounts exist) */}
        {!isLoading && accounts.length > 0 && (
          <Card
            hover
            onClick={connectGmail}
            className="border-dashed cursor-pointer flex flex-col items-center justify-center py-8 gap-3"
          >
            <div className="p-3 rounded-xl bg-white/5">
              <Mail size={20} className="text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Connect another account</p>
              <p className="text-xs text-gray-600 mt-0.5">Add a second Gmail for more coverage</p>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
