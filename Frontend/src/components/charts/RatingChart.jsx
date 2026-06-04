import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatShortDate } from '../../utils/formatters';
import ChartTooltip from './ChartTooltip';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const RatingChart = ({ data = [], isLoading = false }) => {
  if (isLoading) return <LoadingSkeleton height="h-64" />;

  const hasData = data.some((d) => d.codeforces);
  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-500">
        <span className="text-3xl">📈</span>
        <p className="text-sm">Rating history will appear here as data accumulates over time.</p>
        <p className="text-xs text-gray-600">Connect your Codeforces profile and check back tomorrow.</p>
      </div>
    );
  }

  const sparse = data.length <= 3;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
          width={50}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 16 }} />
        <Line
          type="monotone"
          dataKey="codeforces"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={sparse ? { r: 4, fill: '#3b82f6', strokeWidth: 0 } : false}
          name="Codeforces"
          activeDot={{ r: 5, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RatingChart;
