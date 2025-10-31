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

// 🧠 Auth endpoints
export const loginUser = async (credentials) => {
  try {
    const res = await api.post('/auth/login', credentials);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

export const registerUser = async (data) => {
  try {
    const res = await api.post('/auth/register', data);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

// 🩺 Health check
export const checkHealth = async () => {
  try {
    const res = await api.get('/health');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
};

export default api;
