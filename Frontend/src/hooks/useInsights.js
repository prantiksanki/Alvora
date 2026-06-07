import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const MOCK_INSIGHTS = {
  insights: [
    { category: 'Consistency', message: 'You were active 18 of the last 30 days — great consistency!', severity: 'success', icon: '🔥' },
    { category: 'LeetCode', message: '62% of your solves are Easy. Push into Medium problems to level up faster.', severity: 'tip', icon: '⬆️' },
    { category: 'Codeforces', message: 'Rating 1456 — next milestone: 1600 (Specialist→Expert). Only 144 points away!', severity: 'info', icon: '🎯' },
    { category: 'GitHub', message: 'Strong GitHub consistency — keep the green squares flowing.', severity: 'info', icon: '🟩' },
    { category: 'Pattern', message: 'You code significantly more on weekdays. Weekend sessions can boost your growth.', severity: 'tip', icon: '📊' },
  ],
  scores: { dsaReadiness: 72, interviewReadiness: 65, consistencyScore: 87, openSourceScore: 43 },
};

export function useInsights() {
  const [insights, setInsights] = useState([]);
  const [scores, setScores] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/insights');
      setInsights(data.insights || []);
      setScores(data.scores || null);
    } catch {
      setInsights(MOCK_INSIGHTS.insights);
      setScores(MOCK_INSIGHTS.scores);
      setError('Using demo insights — connect your profiles for personalized analysis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/insights/refresh');
      // Small delay so backend can clear the cache, then regenerate
      setTimeout(fetchInsights, 1500);
    } catch {
      setIsLoading(false);
    }
  }, [fetchInsights]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  return { insights, scores, isLoading, error, refresh };
}
