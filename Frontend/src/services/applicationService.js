import api from './api';

export const applicationService = {
  getApplications: (params) => api.get('/applications', { params }).then((r) => r.data),
  getApplication: (id) => api.get(`/applications/${id}`).then((r) => r.data),
  createApplication: (data) => api.post('/applications', data).then((r) => r.data),
  updateApplication: (id, data) => api.patch(`/applications/${id}`, data).then((r) => r.data),
  deleteApplication: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
};
