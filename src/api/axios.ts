import axios from 'axios';

// Create a configured instance of Axios pointing to the Express MVP Backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Append if exists
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
