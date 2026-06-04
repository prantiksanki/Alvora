import api from './api';

export const profileService = {
  getProfile: () => api.get('/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/profile', data).then((r) => r.data),
};
