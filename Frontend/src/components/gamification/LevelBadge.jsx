import { motion } from 'framer-motion';

const LEVEL_CONFIG = {
  1: { gradient: 'from-gray-500 to-gray-400', glow: 'shadow-gray-500/20' },
  2: { gradient: 'from-green-500 to-emerald-400', glow: 'shadow-emerald-500/20' },
  3: { gradient: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/20' },
  4: { gradient: 'from-violet-500 to-purple-400', glow: 'shadow-violet-500/20' },
  5: { gradient: 'from-orange-500 to-yellow-400', glow: 'shadow-orange-500/20' },
  6: { gradient: 'from-red-500 to-pink-400', glow: 'shadow-red-500/20' },
};

const LevelBadge = ({ level = 1, levelName = 'Beginner', size = 'md', className = '' }) => {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const sizes = {
    sm: { outer: 'w-12 h-12', inner: 'text-lg', name: 'text-xs' },
    md: { outer: 'w-16 h-16', inner: 'text-2xl', name: 'text-sm' },
    lg: { outer: 'w-24 h-24', inner: 'text-4xl', name: 'text-base' },
  }[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05, rotate: 3 }}
        className={`${sizes.outer} rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg ${config.glow} relative`}
      >
        <span className={`${sizes.inner} font-bold text-white`}>{level}</span>
        <div className="absolute inset-0 rounded-2xl bg-white/10" />
      </motion.div>
      <div className="text-center">
        <p className={`${sizes.name} font-semibold text-white`}>{levelName}</p>
        <p className="text-[10px] text-gray-500">Level {level}</p>
      </div>
    </div>
  );
};

export default LevelBadge;
