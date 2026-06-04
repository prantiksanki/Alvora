import { motion } from 'framer-motion';
import { GitBranch, Code2, Trophy, BookOpen, Flame } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import AnimatedCounter from '../ui/AnimatedCounter';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const PLATFORM_CONFIG = {
  github: {
    label: 'GitHub',
    icon: GitBranch,
    iconColor: 'text-gray-300',
    accentColor: 'bg-gray-500/15',
    borderColor: 'border-gray-500/20',
    badgeVariant: 'github',
    metrics: (s) => [
      { label: 'Repositories', value: s?.extraData?.publicRepos ?? 0 },
      { label: 'Stars', value: s?.extraData?.stars ?? 0 },
      { label: 'Followers', value: s?.extraData?.followers ?? 0 },
    ],
  },
  leetcode: {
    label: 'LeetCode',
    icon: Code2,
    iconColor: 'text-yellow-400',
    accentColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-500/20',
    badgeVariant: 'leetcode',
    metrics: (s) => [
      { label: 'Solved', value: s?.solvedCount ?? 0 },
      { label: 'Streak', value: s?.streak ?? 0 },
      { label: 'Contests', value: s?.contestCount ?? 0 },
    ],
  },
  codeforces: {
    label: 'Codeforces',
    icon: Trophy,
    iconColor: 'text-blue-400',
    accentColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/20',
    badgeVariant: 'codeforces',
    metrics: (s) => [
      { label: 'Rating', value: s?.rating ?? 0 },
      { label: 'Max Rating', value: s?.extraData?.maxRating ?? 0 },
      { label: 'Contests', value: s?.contestCount ?? 0 },
    ],
  },
  gfg: {
    label: 'GeeksForGeeks',
    icon: BookOpen,
    iconColor: 'text-green-400',
    accentColor: 'bg-green-500/15',
    borderColor: 'border-green-500/20',
    badgeVariant: 'gfg',
    metrics: (s) => [
      { label: 'Solved', value: s?.solvedCount ?? 0 },
      { label: 'Streak', value: s?.streak ?? 0 },
      { label: 'Score', value: s?.rating ?? 0 },
    ],
  },
  codechef: {
    label: 'CodeChef',
    icon: Flame,
    iconColor: 'text-orange-400',
    accentColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/20',
    badgeVariant: 'codechef',
    metrics: (s) => [
      { label: 'Solved', value: s?.solvedCount ?? 0 },
      { label: 'Rating', value: s?.rating ?? 0 },
      { label: 'Contests', value: s?.contestCount ?? 0 },
    ],
  },
  atcoder: {
    label: 'AtCoder',
    icon: Code2,
    iconColor: 'text-sky-300',
    accentColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/20',
    badgeVariant: 'atcoder',
    metrics: (s) => [
      { label: 'Rating', value: s?.rating ?? 0 },
      { label: 'Max Rating', value: s?.extraData?.maxRating ?? 0 },
      { label: 'Contests', value: s?.contestCount ?? 0 },
    ],
  },
};

const PlatformCard = ({ platform, snapshot, isLoading = false }) => {
  if (isLoading) return <LoadingSkeleton.Card />;

  const config = PLATFORM_CONFIG[platform];
  if (!config) return null;

  const { label, icon: Icon, iconColor, accentColor, borderColor, badgeVariant, metrics } = config;
  const metricList = metrics(snapshot);
  const isConnected = !!snapshot;

  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className={`h-full border ${borderColor}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${accentColor}`}>
              <Icon size={18} className={iconColor} />
            </div>
            <span className="font-semibold text-white text-sm">{label}</span>
          </div>
          <Badge variant={isConnected ? badgeVariant : 'inactive'}>
            {isConnected ? 'Active' : 'Not Connected'}
          </Badge>
        </div>

        {/* Metrics */}
        {isConnected ? (
          <div className="grid grid-cols-3 gap-2">
            {metricList.map(({ label: ml, value }) => (
              <div key={ml} className="bg-white/4 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-white">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">{ml}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-sm text-gray-500">
            Connect your {label} profile
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PlatformCard;
