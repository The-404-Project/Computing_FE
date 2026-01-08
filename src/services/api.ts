import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://34.142.141.96:4000/api', // Port Backend kamu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Setiap kali request, otomatis tempel Token (kalau ada)
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

export default api;
