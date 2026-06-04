import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatShortDate } from '../../utils/formatters';
import ChartTooltip from './ChartTooltip';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const SolvedChart = ({ data = [], isLoading = false }) => {
  if (isLoading) return <LoadingSkeleton height="h-64" />;

  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-500">
        <span className="text-3xl">🧩</span>
        <p className="text-sm">Problem-solving history will appear here over time.</p>
        <p className="text-xs text-gray-600">Keep solving — data accumulates with each daily sync.</p>
      </div>
    );
  }

  const sparse = data.length <= 3;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#solvedGrad)"
          name="Problems Solved"
          dot={sparse ? { r: 4, fill: '#8b5cf6', strokeWidth: 0 } : false}
          activeDot={{ r: 5, fill: '#8b5cf6' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SolvedChart;
