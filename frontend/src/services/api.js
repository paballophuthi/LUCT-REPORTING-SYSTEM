import axios from 'axios';

// 🌍 Backend base URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://luct-reporting-system-ryh2.onrender.com/api' // ✅ include /api
    : 'http://localhost:5000/api');

// 🧩 Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🩺 Optional: Check backend connection
api.get('/health')
  .then(() => console.log('✅ Backend connected at:', API_BASE_URL))
  .catch((err) => console.error('❌ Backend connection failed:', err.message));

// 🧠 Auth endpoints
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (data) => api.post('/auth/register', data);

// 🩺 Health check endpoint
export const checkHealth = () => api.get('/health');

// 🐞 Debug endpoint (optional)
export const getRoutes = () => api.get('/debug/routes');

export default api;
