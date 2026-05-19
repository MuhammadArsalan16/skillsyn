import axios from 'axios';

// Base URL – in production the Nginx proxy forwards /api to backend
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });

// Attach JWT token to every request if present
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
