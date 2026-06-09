import { useState, useEffect } from 'react';
import api from '../services/api';

const MOCK_GAMIFICATION = {
  totalXP: 1240,
  level: 2,
  levelName: 'Problem Solver',
  xpToNext: 260,
  badgeCount: 4,
  badges: [
    { badgeId: 'solved_50', name: 'Problem Seeker', description: '50 problems solved', icon: '🎯', platform: 'leetcode', unlockedAt: new Date(Date.now() - 7 * 86400000) },
    { badgeId: 'streak_7', name: 'On Fire', description: '7-day coding streak', icon: '🔥', platform: 'general', unlockedAt: new Date(Date.now() - 3 * 86400000) },
    { badgeId: 'first_contest', name: 'Arena Debut', description: 'First contest participated', icon: '🏟️', platform: 'codeforces', unlockedAt: new Date(Date.now() - 14 * 86400000) },
    { badgeId: 'cf_1200', name: 'Pupil', description: 'Reached Codeforces Pupil (1200)', icon: '🌱', platform: 'codeforces', unlockedAt: new Date(Date.now() - 30 * 86400000) },
  ],
  recentBadges: [],
};

export function useGamification() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/gamification/profile')
      .then(({ data }) => setData(data))
      .catch(() => {/* keep null — don't pollute with mock */})
      .finally(() => setIsLoading(false));
  }, []);

  // While loading, return nullish so consumers can show a skeleton
  // After load, use real data; only fall back to zeros if data is genuinely missing
  return {
    totalXP: data?.totalXP ?? 0,
    level: data?.level ?? 1,
    levelName: data?.levelName ?? 'Beginner',
    xpToNext: data?.xpToNext ?? 500,
    badges: data?.badges ?? [],
    badgeCount: data?.badgeCount ?? 0,
    recentBadges: data?.recentBadges ?? [],
    isLoading,
  };
}
