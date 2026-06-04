import { useState, useEffect } from 'react';
import { jobsService } from '../services/jobsService';
import { useJobSocket } from '../context/JobSocketContext';

/**
 * Combines REST /jobs/live (last 24h) with real-time socket jobs.
 * Socket jobs are prepended and deduplicated by _id.
 */
export function useLiveJobs() {
  const [restJobs, setRestJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { liveJobs: socketJobs } = useJobSocket();

  useEffect(() => {
    jobsService
      .getLiveJobs()
      .then((data) => setRestJobs(data.jobs || []))
      .catch(() => setRestJobs([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Merge: socket jobs (newest) first, then REST jobs, deduplicated by _id
  const idsSeen = new Set();
  const merged = [];

  for (const job of [...socketJobs, ...restJobs]) {
    if (!idsSeen.has(job._id)) {
      idsSeen.add(job._id);
      merged.push(job);
    }
  }

  return {
    jobs: merged,
    isLoading,
    count: merged.length,
  };
}
