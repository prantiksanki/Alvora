const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="backdrop-blur-md bg-gray-900/90 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default ChartTooltip;
