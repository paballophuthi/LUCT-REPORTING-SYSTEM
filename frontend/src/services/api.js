import axios from 'axios';

// 🌍 Determine base URL dynamically
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://luct-reporting-system-ryh2.onrender.com' // Direct backend URL
    : 'http://localhost:5000'; // Local backend

// 🧩 Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
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
      console.error('[API 404] Full error:', error.response?.data);
    }

    // Server errors
    if (status >= 500) {
      console.error(`[API ${status}] Server error:`, error.message);
    }

    return Promise.reject(error);
  }
);

// Test connection on startup
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return false;
  }
};

export default api;

