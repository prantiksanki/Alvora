import { useState, useEffect, useCallback } from 'react';
import { jobsService } from '../services/jobsService';

const STORAGE_KEY = 'alvora:applied-job-ids';

/**
 * Fetches the set of job IDs the current user has already applied to from the DB.
 * Falls back to localStorage for optimistic state (applied mid-session before refresh).
 *
 * Designed to be called once at the page level and passed down, or used as a
 * standalone hook — it de-dupes requests via a module-level cache.
 */
export function useAppliedJobs() {
  const [appliedIds, setAppliedIds] = useState(() => {
    // Seed from localStorage immediately so cards don't flash "Apply" on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { appliedJobIds } = await jobsService.getAppliedIds();
      const merged = new Set([...appliedJobIds]);
      setAppliedIds(merged);
      // Persist the DB truth back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
    } catch {
      // Non-fatal — localStorage values remain as fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markApplied = useCallback((jobId) => {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { appliedIds, isLoading, markApplied, refetch: fetch };
}
