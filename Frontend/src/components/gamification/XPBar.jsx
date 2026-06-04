import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const LEVEL_COLORS = {
  1: 'from-gray-500 to-gray-400',
  2: 'from-green-500 to-emerald-400',
  3: 'from-blue-500 to-cyan-400',
  4: 'from-violet-500 to-purple-400',
  5: 'from-orange-500 to-yellow-400',
  6: 'from-red-500 to-pink-400',
};

const XPBar = ({ totalXP, level, levelName, xpToNext, className = '' }) => {
  const nextLevelXP = totalXP + xpToNext;
  // XP within current level
  const levelStartXP = totalXP - (nextLevelXP - xpToNext - totalXP + totalXP); // simplified
  const pct = xpToNext === 0 ? 100 : Math.round(((nextLevelXP - xpToNext) / nextLevelXP) * 100);
  const fillPct = xpToNext === 0 ? 100 : Math.round((1 - xpToNext / nextLevelXP) * 100);

  const gradient = LEVEL_COLORS[level] || LEVEL_COLORS[1];

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Level {level}</p>
            <p className="text-xs text-gray-400">{levelName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white">{totalXP.toLocaleString()} XP</p>
          {xpToNext > 0 && <p className="text-xs text-gray-500">{xpToNext} to next level</p>}
        </div>
      </div>

      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
};

export default XPBar;
