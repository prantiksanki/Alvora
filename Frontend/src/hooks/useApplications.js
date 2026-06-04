import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { applicationService } from '../services/applicationService';

const DEFAULT_FILTERS = {
  status: '',
  search: '',
  page: 1,
  limit: 20,
  sortBy: 'lastUpdated',
  sortOrder: 'desc',
};

export const useApplications = (initialFilters = {}) => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [filters, setFiltersState] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build clean params — omit empty strings
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;

      const data = await applicationService.getApplications(params);
      setApplications(data.applications || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const setFilter = useCallback((key, value) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when any filter other than page changes
      page: key === 'page' ? value : 1,
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFilter('page', page);
  }, [setFilter]);

  const createApplication = useCallback(async (data) => {
    const created = await applicationService.createApplication(data);
    toast.success('Application added');
    setFiltersState((prev) => ({ ...prev, page: 1 }));
    await fetchApplications();
    return created;
  }, [fetchApplications]);

  const updateApplication = useCallback(async (id, data) => {
    const updated = await applicationService.updateApplication(id, data);
    // Optimistic update in local state
    setApplications((prev) =>
      prev.map((app) => (app._id === id ? { ...app, ...updated } : app))
    );
    toast.success('Application updated');
    return updated;
  }, []);

  const deleteApplication = useCallback(async (id) => {
    setApplications((prev) => prev.filter((app) => app._id !== id));
    await applicationService.deleteApplication(id);
    toast.success('Application deleted');
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
  }, []);

  return {
    applications,
    pagination,
    filters,
    isLoading,
    error,
    setFilter,
    setPage,
    createApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
};
