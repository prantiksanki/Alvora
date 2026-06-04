import { useState, useEffect } from 'react';
import { Swords, ExternalLink, Clock, Trophy, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setTimeLeft('Started'); setIsPast(true); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [targetDate]);

  return { timeLeft, isPast };
};

const ContestCard = ({ contest, index }) => {
  const { timeLeft, isPast } = useCountdown(contest.startTime);
  const isRunning = contest.status === 'running';
  const isPlatformCF = contest.platform === 'codeforces';
  const platformColor = isPlatformCF ? 'codeforces' : 'leetcode';
  const PlatformIcon = isPlatformCF ? Trophy : Code2;

  return (
    <FadeIn.Item>
      <motion.div whileHover={{ y: -2 }}>
        <Card className={`${isRunning ? 'border-emerald-500/30' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl ${isPlatformCF ? 'bg-blue-500/15' : 'bg-yellow-500/15'} shrink-0`}>
                <PlatformIcon size={16} className={isPlatformCF ? 'text-blue-400' : 'text-yellow-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm leading-tight mb-1">{contest.name}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={platformColor}>{contest.platform}</Badge>
                  {isRunning && <Badge variant="active">Live Now</Badge>}
                  {contest.duration > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {Math.round(contest.duration / 3600)}h
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className={`text-sm font-mono font-bold ${isRunning ? 'text-emerald-400' : 'text-violet-400'}`}>
                {timeLeft}
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {new Date(contest.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              {contest.url && (
                <a href={contest.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-white mt-1 transition-colors">
                  Open <ExternalLink size={9} />
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </FadeIn.Item>
  );
};

const MOCK_CONTESTS = [
  { contestId: '1', platform: 'codeforces', name: 'Codeforces Round 1000 (Div. 2)', startTime: new Date(Date.now() + 2 * 86400000), duration: 7200, url: 'https://codeforces.com', status: 'upcoming' },
  { contestId: '2', platform: 'codeforces', name: 'Codeforces Round 999 (Div. 1)', startTime: new Date(Date.now() + 5 * 86400000), duration: 10800, url: 'https://codeforces.com', status: 'upcoming' },
  { contestId: '3', platform: 'leetcode', name: 'LeetCode Weekly Contest 400', startTime: new Date(Date.now() + 3 * 86400000), duration: 5400, url: 'https://leetcode.com/contest', status: 'upcoming' },
  { contestId: '4', platform: 'leetcode', name: 'LeetCode Biweekly Contest 130', startTime: new Date(Date.now() + 10 * 86400000), duration: 5400, url: 'https://leetcode.com/contest', status: 'upcoming' },
];

export default function ContestsPage() {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/contests/upcoming')
      .then(({ data }) => setContests(data.length > 0 ? data : MOCK_CONTESTS))
      .catch(() => setContests(MOCK_CONTESTS))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === 'all' ? contests : contests.filter((c) => c.platform === filter);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Swords size={24} className="text-cyan-400" />
              Contests
            </h2>
            <p className="text-gray-400 text-sm mt-1">Upcoming competitive programming contests</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {['all', 'codeforces', 'leetcode'].map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                  filter === p
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <Swords size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No upcoming {filter !== 'all' ? filter : ''} contests found</p>
          </Card>
        ) : (
          <FadeIn stagger={0.06} className="space-y-3">
            {filtered.map((contest, i) => (
              <ContestCard key={`${contest.platform}-${contest.contestId}`} contest={contest} index={i} />
            ))}
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
