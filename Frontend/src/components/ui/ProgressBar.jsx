import { motion } from 'framer-motion';

const COLOR_MAP = {
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'violet',
  label,
  showPercent = true,
  height = 'h-2',
  className = '',
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = COLOR_MAP[color] || COLOR_MAP.violet;

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-gray-300">{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-white/8 rounded-full ${height} overflow-hidden`}>
        <motion.div
          className={`${barColor} ${height} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
