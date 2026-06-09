import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime } from '../../utils/formatters';

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

  useEffect(() => {
    if (!isSyncing) { setMsgIndex(0); setProgress(0); return; }
    const msgTimer = setInterval(() => setMsgIndex((i) => (i + 1) % SYNC_MESSAGES.length), 3000);
    const progressTimer = setInterval(() => setProgress((p) => p >= 90 ? 90 : p + Math.random() * 8), 800);
    return () => { clearInterval(msgTimer); clearInterval(progressTimer); };
  }, [isSyncing]);

  useEffect(() => {
    if (!isSyncing && progress > 0) {
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 600);
      return () => clearTimeout(t);
    }
  }, [isSyncing]);

  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 group">
      {/* Gmail dot */}
      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
        {/* Gmail G icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 5.5H2v13h20V5.5z" fill="none"/>
          <path d="M2 5.5l10 8 10-8" stroke="none"/>
          <path d="M2 6.5l10 7.5 10-7.5V18.5H2V6.5z" fill="rgba(239,68,68,0.15)"/>
          <path d="M2 6.5L12 14l10-7.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M2 6.5v12h20v-12" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Email + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white truncate">{account.emailAddress}</span>
          {account.isActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={9} /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle size={9} /> Inactive
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Last synced: <span className="text-gray-400">{lastSync}</span></p>

        {/* Sync progress */}
        <AnimatePresence>
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <div className="w-full h-0.5 bg-white/6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <div className="h-3.5 mt-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] text-violet-400"
                  >
                    {SYNC_MESSAGES[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onSync(account._id)}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/6 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing…' : 'Sync'}
        </button>
        <button
          onClick={() => onDelete(account._id)}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/6 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={12} />
          Remove
        </button>
      </div>
    </div>
  );
};

export default EmailCard;
