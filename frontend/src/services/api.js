import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ FIX: use import.meta.env instead of process.env
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  verifyToken: () => API.get('/auth/verify'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
};

// Paper Services
export const paperService = {
  submitPaper: (paperData) => API.post('/papers', paperData),
  getMyPapers: () => API.get('/papers/my'),
  updatePaper: (id, paperData) => API.put(`/papers/${id}`, paperData),
  deletePaper: (id) => API.delete(`/papers/${id}`),
  downloadPaper: (id) =>
    API.get(`/papers/${id}/download`, { responseType: 'blob' }),

  getAssignedPapers: () => API.get('/papers/assigned'),
  submitReview: (paperId, reviewData) =>
    API.post(`/papers/${paperId}/reviews`, reviewData),
  getMyReviews: () => API.get('/reviews/my'),

  getAllPapers: (params) => API.get('/papers/admin', { params }),
  assignReviewer: (paperId, reviewerId) =>
    API.post(`/papers/${paperId}/assign`, { reviewerId }),
  makeDecision: (paperId, decision) =>
    API.put(`/papers/${paperId}/decision`, { decision }),
  generateConferenceProgram: () =>
    API.get('/papers/program', { responseType: 'blob' }),
};

// User Services
export const userService = {
  getAllUsers: () => API.get('/users'),
  createUser: (userData) => API.post('/users', userData),
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

// Review Services
export const reviewService = {
  getPaperReviews: (paperId) => API.get(`/reviews/paper/${paperId}`),
  updateReview: (reviewId, reviewData) =>
    API.put(`/reviews/${reviewId}`, reviewData),
};

// Statistics
export const statsService = {
  getDashboardStats: () => API.get('/stats/dashboard'),
  getSubmissionStats: () => API.get('/stats/submissions'),
};

export default API;