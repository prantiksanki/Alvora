import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const PLATFORM_COLORS = {
  leetcode: 'border-yellow-500/30 bg-yellow-500/5',
  codeforces: 'border-blue-500/30 bg-blue-500/5',
  github: 'border-gray-500/30 bg-gray-500/5',
  gfg: 'border-green-500/30 bg-green-500/5',
  general: 'border-violet-500/30 bg-violet-500/5',
};

const BadgeCard = ({ badge, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ y: -2 }}
    className={`border rounded-xl p-3 text-center ${PLATFORM_COLORS[badge.platform] || PLATFORM_COLORS.general}`}
  >
    <div className="text-3xl mb-2">{badge.icon}</div>
    <p className="text-xs font-semibold text-white leading-tight">{badge.name}</p>
    <p className="text-[10px] text-gray-500 mt-1">{formatRelativeTime(badge.unlockedAt)}</p>
  </motion.div>
);

const LockedBadge = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.03 }}
    className="border border-white/5 rounded-xl p-3 text-center opacity-30"
  >
    <div className="flex items-center justify-center h-8 mb-2">
      <Lock size={20} className="text-gray-600" />
    </div>
    <p className="text-xs text-gray-600">???</p>
  </motion.div>
);

const BadgeGrid = ({ badges = [], totalPossible = 17, showLocked = true, className = '' }) => {
  const lockedCount = Math.max(0, totalPossible - badges.length);

  return (
    <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 ${className}`}>
      {badges.map((badge, i) => (
        <BadgeCard key={badge.badgeId} badge={badge} index={i} />
      ))}
      {showLocked && Array.from({ length: Math.min(lockedCount, 6) }).map((_, i) => (
        <LockedBadge key={`locked-${i}`} index={badges.length + i} />
      ))}
    </div>
  );
};

export default BadgeGrid;
