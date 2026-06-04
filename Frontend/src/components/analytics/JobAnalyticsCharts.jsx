import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import ChartTooltip from '../charts/ChartTooltip';

const buildMonthlyData = (byMonth = []) =>
  [...byMonth]
    .sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month)
    .map((entry) => ({
      month: new Date(entry._id.year, entry._id.month - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      count: entry.count,
    }));

const Monthly = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="h-52 animate-pulse bg-white/5 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-gray-600">
        No application history yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="jobMonthlyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={30}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          name="Applications"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#jobMonthlyGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const Companies = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-white/5 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-600">
        No company data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="company"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" name="Applications" fill="#8b5cf6" fillOpacity={0.85} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const JobAnalyticsCharts = { Monthly, Companies };

export default JobAnalyticsCharts;

// Named exports for convenience
export { Monthly as MonthlyChart, Companies as CompaniesChart };

// Helper to transform raw API data
export const transformMonthlyData = buildMonthlyData;

export const transformCompaniesData = (topCompanies = []) =>
  topCompanies.slice(0, 8).map((entry) => ({
    company: entry._id,
    count: entry.count,
  }));
