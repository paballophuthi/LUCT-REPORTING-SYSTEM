import axios from 'axios';

// 🌍 Determine the base URL dynamically
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://luct-reporting-system-ryh2.onrender.com' // ✅ your backend URL (no /api here)
    : 'http://localhost:5000');

// 🧩 Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🩺 Optional: Check if backend is reachable (for debugging)
api.get('/health')
  .then(() => console.log('✅ Backend connected at:', API_BASE_URL))
  .catch((err) => console.error('❌ Backend connection failed:', err.message));

// 🧠 Auth endpoints - FIXED: removed /api/auth prefix
export const loginUser = (credentials) => api.post('/login', credentials);
export const registerUser = (data) => api.post('/register', data);

// 🩺 Health check endpoint
export const checkHealth = () => api.get('/health');

// 🐞 Debug endpoint (optional)
export const getRoutes = () => api.get('/api/debug/routes');

export default api;