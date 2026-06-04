import { useState, useEffect } from 'react';
import { Calendar, Share2, CheckCircle2, Flame, Trophy, GitBranch, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const StatBlock = ({ icon: Icon, label, value, suffix = '', color = 'violet', delay = 0 }) => (
  <FadeIn.Item>
    <Card gradient className="text-center">
      <div className={`p-3 rounded-xl bg-${color}-500/15 w-fit mx-auto mb-3`}>
        <Icon size={20} className={`text-${color}-400`} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        <AnimatedCounter value={typeof value === 'number' ? value : 0} suffix={suffix} />
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </Card>
  </FadeIn.Item>
);

export default function YearInCodePage() {
  const year = new Date().getFullYear();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/year-in-code/${year}`)
      .then(({ data }) => setSummary(data.empty ? null : data))
      .catch(() => setSummary(null))
      .finally(() => setIsLoading(false));
  }, [year]);

  const handleShare = () => {
    const text = `My ${year} Year in Code on Alvora:\n🎯 ${summary.totalSolved} problems solved\n🔥 ${summary.biggestStreak}-day streak\n📅 ${summary.activeDays} active days\n🏆 ${summary.totalContests} contests\n\nTrack your developer journey at alvora.app`;
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!'));
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-white/5 rounded-2xl" />
          ))}
        </div>
      </PageTransition>
    );
  }

  if (!summary) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="p-4 rounded-2xl bg-violet-500/10 mb-2">
            <Calendar size={36} className="text-violet-400" />
          </div>
          <p className="text-white font-semibold text-lg">No data for {year} yet</p>
          <p className="text-gray-400 text-sm max-w-sm">
            Connect your profiles and let Alvora sync your stats. Your Year in Code summary will appear here.
          </p>
        </div>
      </PageTransition>
    );
  }

  const s = summary;

  return (
    <PageTransition>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center py-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent rounded-3xl" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">{s.year} — Year In Code</p>
            <h1 className="text-5xl font-bold text-white mb-1">
              <AnimatedCounter value={s.totalSolved} />
            </h1>
            <p className="text-gray-400">Problems Solved This Year</p>
            <div className="flex justify-center mt-4">
              <Button onClick={handleShare} variant="secondary" size="sm">
                <Share2 size={14} />
                Share
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Core stats */}
        <FadeIn stagger={0.07} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBlock icon={Flame} label="Biggest Streak" value={s.biggestStreak} suffix=" days" color="orange" />
          <StatBlock icon={CheckCircle2} label="Active Days" value={s.activeDays} color="emerald" />
          <StatBlock icon={Trophy} label="Contests Entered" value={s.totalContests} color="blue" />
          <StatBlock icon={Calendar} label="Best Month" value={s.mostActiveMonth} color="violet" />
        </FadeIn>

        {/* Rating growth */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" />
            Rating Growth
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { platform: 'Codeforces', data: s.ratingGrowth?.codeforces, color: 'text-blue-400' },
            ].map(({ platform, data, color }) => (
              <div key={platform} className="bg-white/4 rounded-xl p-4">
                <p className={`text-xs font-medium ${color} mb-2`}>{platform}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{data?.start || 0}</span>
                  <span className="text-xs text-gray-500 mx-2">→</span>
                  <span className="text-white font-bold">{data?.end || 0}</span>
                  <span className={`text-sm font-medium ml-2 ${(data?.delta || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(data?.delta || 0) >= 0 ? '+' : ''}{data?.delta || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* GitHub growth */}
        <Card>
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <GitBranch size={16} className="text-gray-400" />
            GitHub Growth
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Stars', data: s.githubGrowth?.stars, icon: '⭐' },
              { label: 'Repos', data: s.githubGrowth?.repos, icon: '📁' },
              { label: 'Followers', data: s.githubGrowth?.followers, icon: '👥' },
            ].map(({ label, data, icon }) => (
              <div key={label} className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-lg mb-1">{icon}</p>
                <p className="text-white font-bold">{(data?.end || 0).toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">{label}</p>
                <p className="text-[10px] text-emerald-400">+{((data?.end || 0) - (data?.start || 0)).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Top languages */}
        {s.topLanguages?.length > 0 && (
          <Card>
            <p className="text-sm font-semibold text-white mb-3">Top Languages</p>
            <div className="flex flex-wrap gap-2">
              {s.topLanguages.map((lang, i) => (
                <span key={lang} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${i === 0 ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                  {lang}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
