import { CheckCircle2, Flame, Star, Trophy } from 'lucide-react';
import FadeIn from '../animations/FadeIn';
import StatCard from './StatCard';

const OverviewGrid = ({ overview = [], isLoading = false }) => {
  const lcSnap = overview.find((s) => s.platform === 'leetcode');
  const cfSnap = overview.find((s) => s.platform === 'codeforces');
  const ghSnap = overview.find((s) => s.platform === 'github');

  const NON_SOLVING_PLATFORMS = ['github'];
  const totalSolved = overview
    .filter((s) => !NON_SOLVING_PLATFORMS.includes(s.platform))
    .reduce((sum, s) => sum + (s.solvedCount || 0), 0);

  const maxStreak = Math.max(...overview.map((s) => s.streak || 0), 0);
  const cfRating = cfSnap?.rating || 0;
  const ghStars = ghSnap?.extraData?.stars || 0;

  const stats = [
    {
      title: 'Total Problems Solved',
      value: totalSolved,
      icon: CheckCircle2,
      iconColor: 'violet',
      trend: 8,
    },
    {
      title: 'Best Streak',
      value: maxStreak,
      icon: Flame,
      iconColor: 'yellow',
      suffix: ' days',
      trend: 5,
    },
    {
      title: 'CF Rating',
      value: cfRating,
      icon: Trophy,
      iconColor: 'blue',
      trend: 3,
    },
    {
      title: 'GitHub Stars',
      value: ghStars,
      icon: Star,
      iconColor: 'cyan',
      trend: 12,
    },
  ];

  return (
    <FadeIn stagger={0.08} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <FadeIn.Item key={stat.title}>
          <StatCard {...stat} isLoading={isLoading} />
        </FadeIn.Item>
      ))}
    </FadeIn>
  );
};

export default OverviewGrid;
