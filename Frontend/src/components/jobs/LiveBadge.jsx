import { motion } from 'framer-motion';

const getTimeLabel = (detectedAt) => {
  if (!detectedAt) return null;
  const now = Date.now();
  const diff = now - new Date(detectedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return { label: 'Just now', tier: 'new' };
  if (minutes < 30) return { label: `${minutes}m ago`, tier: 'new' };
  if (hours < 2) return { label: `${hours}h ago`, tier: 'recent' };
  if (hours < 24) return { label: `${hours}h ago`, tier: 'today' };
  return null;
};

const LiveBadge = ({ detectedAt, className = '' }) => {
  const time = getTimeLabel(detectedAt);
  if (!time) return null;

  if (time.tier === 'new') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="relative flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
          <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs font-semibold text-emerald-400"
        >
          {time.label}
        </motion.span>
      </div>
    );
  }

  if (time.tier === 'recent') {
    return (
      <span className={`text-xs font-medium text-violet-400 ${className}`}>
        {time.label}
      </span>
    );
  }

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      {time.label}
    </span>
  );
};

export default LiveBadge;
