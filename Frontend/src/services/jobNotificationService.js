import api from './api';

export const jobNotificationService = {
  getNotifications: (params) => api.get('/notifications/jobs', { params }).then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/jobs/${id}/read`).then((r) => r.data),
};
