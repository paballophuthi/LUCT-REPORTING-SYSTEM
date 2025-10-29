import axios from 'axios';

// 🌍 Determine base URL dynamically
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_BASE_URL // Render backend (must include /api at the end)
    : 'http://localhost:5000/api';      // Local backend fallback

// 🧩 Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚡ Handle responses and errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Unauthorized → redirect to login
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Not Found → log helpful message
    if (status === 404) {
      console.error(
        `[API 404] Endpoint not found: ${error.config?.baseURL}${error.config?.url}`
      );
    }

    // Optional: log all other errors in production
    if (process.env.NODE_ENV === 'production' && status !== 404 && status !== 401) {
      console.error(`[API ERROR]`, status, error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
