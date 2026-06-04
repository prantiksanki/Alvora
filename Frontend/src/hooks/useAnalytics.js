import { useCallback, useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics() {
  const [overview, setOverview] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (platform = null, days = 90) => {
    setIsLoading(true);
    setError(null);
    try {
      const [ov, hist] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getHistory(platform, days),
      ]);
      setOverview(ov);
      setHistory(hist);
    } catch {
      setOverview([]);
      setHistory([]);
      setError('Could not load stats. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { overview, history, isLoading, error, refetch: fetchData };
}
