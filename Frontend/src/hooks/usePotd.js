import { useState, useEffect, useCallback } from 'react';
import { potdService } from '../services/potdService';

export function usePotd() {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchProblems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await potdService.getToday();
      setProblems(data || []);
      setLastRefreshed(new Date());
    } catch {
      setError('Failed to load daily problems');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  return { problems, isLoading, error, lastRefreshed, refetch: fetchProblems };
}
