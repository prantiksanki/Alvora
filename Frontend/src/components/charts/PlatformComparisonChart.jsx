import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  github: 'GitHub',
  gfg: 'GFG',
};

const PLATFORM_BAR_COLORS = {
  leetcode: '#eab308',
  codeforces: '#3b82f6',
  github: '#9ca3af',
  gfg: '#22c55e',
};

const PlatformComparisonChart = ({ overview = [], isLoading = false }) => {
  if (isLoading) return <LoadingSkeleton height="h-64" />;

  const data = overview
    .filter((s) => s.solvedCount > 0)
    .map((s) => ({
      platform: PLATFORM_LABELS[s.platform] || s.platform,
      key: s.platform,
      solved: s.solvedCount,
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No solved count data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="platform"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="solved" name="Problems Solved" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.key}
              fill={PLATFORM_BAR_COLORS[entry.key] || '#8b5cf6'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlatformComparisonChart;
