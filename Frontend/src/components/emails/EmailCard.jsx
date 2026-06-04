import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatRelativeTime } from '../../utils/formatters';

// Messages that cycle while syncing to show progress
const SYNC_MESSAGES = [
  'Connecting to Gmail...',
  'Scanning your inbox...',
  'Fetching job emails...',
  'Processing emails...',
  'Detecting applications...',
  'Extracting company info...',
  'Updating applications...',
  'Almost done...',
];

const EmailCard = ({ account, onSync, onDelete, isSyncing }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const lastSync = account.lastSyncedAt
    ? formatRelativeTime(account.lastSyncedAt)
    : 'Never synced';

  // Cycle through status messages and animate progress bar while syncing
  useEffect(() => {
    if (!isSyncing) {
      setMsgIndex(0);
      setProgress(0);
      return;
    }

    // Cycle message every 3 seconds
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % SYNC_MESSAGES.length);
    }, 3000);

    // Smoothly grow progress bar — stops at 90% until sync completes
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        return p + Math.random() * 8;
      });
    }, 800);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, [isSyncing]);

  // Briefly flash to 100% when sync finishes
  useEffect(() => {
    if (!isSyncing && progress > 0) {
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 600);
      return () => clearTimeout(t);
    }
  }, [isSyncing]);

  return (
    <Card hover>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-red-500/10 shrink-0">
            <Mail size={18} className="text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{account.emailAddress}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{account.provider}</p>
          </div>
        </div>

        {/* Status chip */}
        {account.isActive ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 shrink-0">
            <CheckCircle size={10} />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-red-400/15 text-red-400 border border-red-400/20 shrink-0">
            <AlertCircle size={10} />
            Inactive
          </span>
        )}
      </div>

      {/* Last sync info */}
      <p className="text-xs text-gray-500 mt-3">
        Last synced: <span className="text-gray-400">{lastSync}</span>
      </p>

      {/* Sync progress bar + status message */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              {/* Progress bar */}
              <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              {/* Cycling status message */}
              <div className="h-4 mt-1.5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-[10px] text-violet-400"
                  >
                    {SYNC_MESSAGES[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSync(account._id)}
          disabled={isSyncing}
          className="flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(account._id)}
          disabled={isSyncing}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={13} />
          Remove
        </motion.button>
      </div>
    </Card>
  );
};

export default EmailCard;
