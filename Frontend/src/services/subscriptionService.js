import api from './api';

export const subscriptionService = {
  get: () => api.get('/subscriptions').then((r) => r.data),
  upsert: (data) => api.post('/subscriptions', data).then((r) => r.data),
  update: (data) => api.patch('/subscriptions', data).then((r) => r.data),
  deactivate: () => api.delete('/subscriptions').then((r) => r.data),
};
