import api from './api';

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }).then((r) => r.data),
};
