import { useState, useEffect, useCallback } from 'react';
import { jobAnalyticsService } from '../services/jobAnalyticsService';

export const useJobStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await jobAnalyticsService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};
