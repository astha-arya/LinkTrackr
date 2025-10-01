import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a 401 and that we are NOT on the login or register page
    const isAuthError = error.response?.status === 401;
    const isAuthEndpoint = error.config.url === '/auth/login' || error.config.url === '/auth/register';

    if (isAuthError && !isAuthEndpoint) {
      // This is an expired token for a logged-in user. Redirect to login.
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // For all other errors (including failed logins), let the component handle it.
    return Promise.reject(error);
  }
);

export default api;
