import api from './api';

export const jobsService = {
  getJobs: (params) => api.get('/jobs', { params }).then((r) => r.data),
  getLiveJobs: () => api.get('/jobs/live').then((r) => r.data),
  getJobById: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  applyToJob: (id) => api.post(`/jobs/${id}/apply`).then((r) => r.data),
  // Returns { appliedJobIds: string[] } — authoritative DB source for applied state
  getAppliedIds: () => api.get('/jobs/applied-ids').then((r) => r.data),
};
