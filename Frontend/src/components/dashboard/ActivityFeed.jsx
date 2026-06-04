import { GitBranch, Code2, Trophy, BookOpen } from 'lucide-react';
import Card from '../ui/Card';
import FadeIn from '../animations/FadeIn';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { formatRelativeTime, PLATFORM_COLORS } from '../../utils/formatters';

const PLATFORM_ICONS = {
  github: GitBranch,
  leetcode: Code2,
  codeforces: Trophy,
  gfg: BookOpen,
};

const ActivityFeed = ({ items = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <p className="text-sm font-semibold text-white mb-4">Recent Activity</p>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg animate-pulse bg-white/8 shrink-0" />
              <LoadingSkeleton.Text lines={2} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm font-semibold text-white mb-4">Recent Activity</p>
      <FadeIn stagger={0.05} className="space-y-1 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = PLATFORM_ICONS[item.platform] || Code2;
          const colors = PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.github;

          return (
            <FadeIn.Item key={item.id}>
              <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                <div className={`p-1.5 rounded-lg shrink-0 ${colors.bg}`}>
                  <Icon size={13} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(item.timestamp)}</p>
                </div>
                {item.value && (
                  <span className="text-xs font-medium text-violet-400 shrink-0">{item.value}</span>
                )}
              </div>
            </FadeIn.Item>
          );
        })}
      </FadeIn>
    </Card>
  );
};

export default ActivityFeed;
