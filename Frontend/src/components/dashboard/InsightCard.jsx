import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';

const SEVERITY_COLORS = {
  success: 'text-emerald-400 bg-emerald-500/10',
  warning: 'text-yellow-400 bg-yellow-500/10',
  tip: 'text-cyan-400 bg-cyan-500/10',
  info: 'text-violet-400 bg-violet-500/10',
};

const InsightCard = ({ insights = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-violet-400" />
          <p className="text-sm font-semibold text-white">AI Insights</p>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse bg-white/5 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  const topInsights = insights.slice(0, 3);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <p className="text-sm font-semibold text-white">AI Insights</p>
        </div>
        <Link to="/insights" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
          View all <ArrowRight size={10} />
        </Link>
      </div>

      <div className="space-y-2">
        {topInsights.map((insight, i) => {
          const colorClass = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.info;
          return (
            <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${colorClass.split(' ')[1]}`}>
              <span className="text-sm shrink-0">{insight.icon}</span>
              <p className={`text-xs leading-relaxed ${colorClass.split(' ')[0]}`}>{insight.message}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InsightCard;
