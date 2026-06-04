import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsService } from '../services/jobsService';

const DEFAULT_FILTERS = {
  company: '',
  source: '',
  employmentType: '',
  remote: '',
  search: '',
  page: 1,
  limit: 20,
};

export function useJobs(initialFilters = {}) {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFiltersState] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce ref for search input
  const searchDebounceRef = useRef(null);

  const fetchJobs = useCallback(async (activeFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = { page: activeFilters.page, limit: activeFilters.limit };
      if (activeFilters.company) params.company = activeFilters.company;
      if (activeFilters.source) params.source = activeFilters.source;
      if (activeFilters.employmentType) params.employmentType = activeFilters.employmentType;
      if (activeFilters.remote !== '') params.remote = activeFilters.remote;
      if (activeFilters.search) params.search = activeFilters.search;

      const data = await jobsService.getJobs(params);
      setJobs(data.jobs || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [fetchJobs, filters]);

  const setFilter = useCallback((key, value) => {
    if (key === 'search') {
      // Debounce search input by 400ms
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        setFiltersState((prev) => ({ ...prev, search: value, page: 1 }));
      }, 400);
      return;
    }

    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ ...DEFAULT_FILTERS });
  }, []);

  return {
    jobs,
    pagination,
    filters,
    isLoading,
    error,
    setFilter,
    setPage,
    clearFilters,
    refetch: () => fetchJobs(filters),
  };
}
