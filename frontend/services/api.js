import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const saveSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem('token', token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const closeServerSession = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore logout errors so the client can still clear local state.
  }
};

export default api;
