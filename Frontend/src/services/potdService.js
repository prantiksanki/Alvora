import api from './api';

export const potdService = {
  getToday: () => api.get('/potd').then((r) => r.data),
  getHistory: (platform, days = 7) =>
    api.get('/potd/history', { params: { platform, days } }).then((r) => r.data),
  refresh: () => api.post('/potd/refresh').then((r) => r.data),
};
