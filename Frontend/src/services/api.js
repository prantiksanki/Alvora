import axios from 'axios';

// In production, VITE_API_URL points to the deployed backend (e.g. https://your-api.onrender.com).
// In development, Vite proxies /api to localhost:3000 so the relative path works fine.
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('alvora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear stored auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('alvora_token');
      localStorage.removeItem('alvora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
