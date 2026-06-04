import api from './api';

export const jobAnalyticsService = {
  getStats: () => api.get('/applications/stats').then((r) => r.data),
  getDetailedStats: () => api.get('/applications/detailed-stats').then((r) => r.data),
};
