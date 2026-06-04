import { useState, useEffect } from 'react';
import { Swords, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) return setTimeLeft('Starting now!');
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [targetDate]);

  return timeLeft;
};

const ContestItem = ({ contest }) => {
  const countdown = useCountdown(contest.startTime);
  const platformColor = contest.platform === 'codeforces' ? 'text-blue-400' : 'text-yellow-400';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{contest.name}</p>
        <p className={`text-[10px] ${platformColor} capitalize`}>{contest.platform}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono text-violet-400">{countdown}</span>
        {contest.url && (
          <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

const ContestCountdown = ({ contests = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Swords size={14} className="text-cyan-400" />
          <p className="text-sm font-semibold text-white">Upcoming Contests</p>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse bg-white/5 rounded-lg mb-2" />
        ))}
      </Card>
    );
  }

  const upcoming = contests.slice(0, 3);

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Swords size={14} className="text-cyan-400" />
          <p className="text-sm font-semibold text-white">Upcoming Contests</p>
        </div>
        <Link to="/contests" className="text-xs text-violet-400 hover:text-violet-300">
          View all
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No contests found — check back later.</p>
      ) : (
        upcoming.map((c) => <ContestItem key={`${c.platform}-${c.contestId}`} contest={c} />)
      )}
    </Card>
  );
};

export default ContestCountdown;
