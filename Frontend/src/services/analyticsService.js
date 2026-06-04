import api from './api';

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview').then((r) => r.data),
  getHistory: (platform = null, days = 90) => {
    const params = {};
    if (platform && platform !== 'all') params.platform = platform;
    if (days) params.days = days;
    return api.get('/analytics/history', { params }).then((r) => r.data);
  },
};
