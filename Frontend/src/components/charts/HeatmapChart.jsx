const INTENSITY = [
  'bg-white/5',
  'bg-violet-900/60',
  'bg-violet-700/70',
  'bg-violet-500/80',
  'bg-violet-400',
];

function getIntensity(count) {
  if (count === 0) return INTENSITY[0];
  if (count <= 2) return INTENSITY[1];
  if (count <= 5) return INTENSITY[2];
  if (count <= 10) return INTENSITY[3];
  return INTENSITY[4];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HeatmapChart = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-1 text-gray-500">
        <p className="text-sm">Activity data will appear here as daily snapshots accumulate.</p>
        <p className="text-xs text-gray-600">Keep solving — each day adds a new data point.</p>
      </div>
    );
  }

  // Build a map from date string to count
  const countMap = {};
  data.forEach(({ date, count }) => { countMap[date] = count; });

  // Build 52 weeks of 7 days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  const monthLabels = [];

  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split('T')[0];
      const count = countMap[dateStr] || 0;
      week.push({ date: dateStr, count, label: `${count} on ${dateStr}` });
    }
    // Record month label at start of each month
    if (week[0]) {
      const m = new Date(week[0].date).getMonth();
      if (w === 0 || m !== new Date(weeks[weeks.length - 1]?.[0]?.date || '').getMonth()) {
        monthLabels.push({ week: w, label: MONTHS[m] });
      }
    }
    weeks.push(week);
  }

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-5">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-gray-600">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div>
          {/* Month labels */}
          <div className="flex mb-1" style={{ gap: '2px' }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.week === wi);
              return (
                <div key={wi} className="w-3 text-[9px] text-gray-500">
                  {ml ? ml.label : ''}
                </div>
              );
            })}
          </div>

          {/* Cells */}
          <div className="flex" style={{ gap: '2px' }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${getIntensity(day.count)} transition-colors hover:ring-1 hover:ring-violet-400/50`}
                    title={day.label}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        {INTENSITY.map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapChart;
