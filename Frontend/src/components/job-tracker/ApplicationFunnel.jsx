import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import ChartTooltip from '../charts/ChartTooltip';

const FUNNEL_STAGES = [
  { key: 'Applied',              label: 'Applied',   color: '#60a5fa' },
  { key: 'OA_Received',          label: 'OA',        color: '#fbbf24' },
  { key: 'Interview_Scheduled',  label: 'Interview', color: '#a78bfa' },
  { key: 'Next_Round',           label: 'Final',     color: '#22d3ee' },
  { key: 'Offer',                label: 'Offer',     color: '#34d399' },
];

const ApplicationFunnel = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 py-2">
        {FUNNEL_STAGES.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-14 shrink-0 text-right">{s.label}</span>
            <div className="h-5 rounded animate-pulse bg-white/8 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  const data = FUNNEL_STAGES.map((stage) => ({
    label: stage.label,
    count: (stats?.byStatus ?? []).find((s) => s._id === stage.key)?.count ?? 0,
    color: stage.color,
  }));

  // All zero → show empty state
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-600">
        No application data yet
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
          dataKey="label"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ApplicationFunnel;
