import { Flame } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import AnimatedCounter from '../ui/AnimatedCounter';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const StreakWidget = ({ currentStreak = 0, maxStreak = 0, weekActivity = [], isLoading = false }) => {
  if (isLoading) return <LoadingSkeleton.Card />;

  // Generate last 7 days mini bar data
  const miniData = weekActivity.length > 0
    ? weekActivity
    : Array.from({ length: 7 }, (_, i) => ({ day: i, active: Math.random() > 0.3 }));

  return (
    <Card gradient>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-orange-500/15">
          <Flame size={18} className="text-orange-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Streak</p>
          <div className="text-3xl font-bold text-white mt-0.5">
            <AnimatedCounter value={currentStreak} suffix=" days" />
          </div>
        </div>
      </div>

      {/* Mini 7-bar chart */}
      <div className="h-10 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={miniData} barGap={2}>
            <Bar dataKey="active" radius={[2, 2, 0, 0]}>
              {miniData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.active ? '#8b5cf6' : 'rgba(255,255,255,0.06)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-500">
        Best streak: <span className="text-violet-400 font-medium">{maxStreak} days</span>
      </p>
    </Card>
  );
};

export default StreakWidget;
