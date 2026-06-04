import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';
import AnimatedCounter from '../ui/AnimatedCounter';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const ICON_COLORS = {
  violet: 'bg-violet-500/15 text-violet-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  yellow: 'bg-yellow-500/15 text-yellow-400',
  blue: 'bg-blue-500/15 text-blue-400',
  gray: 'bg-gray-500/15 text-gray-400',
};

const StatCard = ({
  title,
  value = 0,
  icon: Icon,
  trend = null,
  trendLabel = 'vs last week',
  iconColor = 'violet',
  isLoading = false,
  suffix = '',
  prefix = '',
}) => {
  if (isLoading) return <LoadingSkeleton.StatCard />;

  const iconColorClass = ICON_COLORS[iconColor] || ICON_COLORS.violet;
  const trendPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate">{title}</p>
            <div className="mt-2 text-3xl font-bold text-white">
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            </div>
            {trend !== null && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(trend)}% {trendLabel}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl shrink-0 ${iconColorClass}`}>
              <Icon size={20} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
