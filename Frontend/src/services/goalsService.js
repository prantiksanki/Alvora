import api from './api';

export const goalsService = {
  getGoals: () => api.get('/goals').then((r) => r.data),
  createGoal: (data) => api.post('/goals', data).then((r) => r.data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data).then((r) => r.data),
  deleteGoal: (id) => api.delete(`/goals/${id}`).then((r) => r.data),
};
