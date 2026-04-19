import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (response?.status === 403) {
      toast.error('Access denied. You do not have permission.');
    } else if (response?.status === 404) {
      toast.error('Resource not found.');
    } else if (response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (response?.data?.message) {
      toast.error(response.data.message);
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    error.normalized = normalizeApiError(error);
    return Promise.reject(error);
  }
);

// ================================
// AUTH SERVICES
// ================================
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  changePassword: (passwordData) => API.put('/auth/change-password', passwordData),
};

// ================================
// AUTHOR SERVICES
// ================================
export const authorService = {
  submitPaper: (formData) => API.post('/author/papers', formData),
  getMyPapers: () => API.get('/author/papers'),
  getPaper: (id) => API.get(`/author/papers/${id}`),
  updatePaper: (id, paperData) => API.put(`/author/papers/${id}`, paperData),
  withdrawPaper: (id) => API.delete(`/author/papers/${id}`),
  downloadPaper: (paperId) => API.get(`/author/papers/${paperId}/download`, { responseType: 'blob', headers: { 'Accept': 'application/pdf' } }),
};

// ================================
// REVIEWER SERVICES
// ================================
export const reviewerService = {
  getAssignedPapers: () => API.get('/reviewer/papers'),
  getPaperForReview: (reviewId) => API.get(`/reviewer/papers/${reviewId}`),
  downloadPaperForReview: (reviewId) => API.get(`/reviewer/papers/${reviewId}/download`, { responseType: 'blob', headers: { 'Accept': 'application/pdf' } }),
  submitReview: (reviewId, reviewData) => API.post(`/reviewer/papers/${reviewId}/review`, reviewData),
  getMyReviews: () => API.get('/reviewer/reviews'),
  updateReview: (reviewId, reviewData) => API.put(`/reviewer/reviews/${reviewId}`, reviewData),
};

// ✅ Alias for components that import 'reviewService'
export const reviewService = reviewerService;

// ================================
// ADMIN SERVICES
// ================================
export const adminService = {
  getAllUsers: (params) => API.get('/admin/users', { params }),
  getUser: (userId) => API.get(`/admin/users/${userId}`),
  createUser: (userData) => API.post('/admin/users', userData),
  updateUser: (userId, userData) => API.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => API.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => API.put(`/admin/users/${userId}/role`, { role }),
  getReviewers: () => API.get('/admin/reviewers'),
  getAvailableReviewers: (paperId) => API.get(`/admin/papers/${paperId}/available-reviewers`),
  getAllPapers: (params) => API.get('/admin/papers', { params }),
  getPaperDetails: (paperId) => API.get(`/admin/papers/${paperId}`),
  updatePaperStatus: (paperId, status) => API.put(`/admin/papers/${paperId}/status`, { status }),
  assignReviewer: (paperId, reviewerId) => API.post(`/admin/papers/${paperId}/assign-reviewer`, { reviewerId }),
  removeReviewer: (paperId, reviewerId) => API.delete(`/admin/papers/${paperId}/reviewer/${reviewerId}`),
  makeFinalDecision: (paperId, decision) => API.post(`/admin/papers/${paperId}/decision`, { decision }),
  lockFinalDecision: (paperId) => API.put(`/admin/papers/${paperId}/lock-decision`),
  getPaperReviews: (paperId) => API.get(`/admin/papers/${paperId}/reviews`),
  getStatistics: () => API.get('/admin/stats'),
  exportData: (format = 'csv') => API.get(`/admin/export/${format}`, { responseType: 'blob' }),
};

// ================================
// STATS SERVICES
// ================================
export const statsService = {
  getDashboardStats: () => API.get('/stats/dashboard'),
  getSubmissionStats: (params) => API.get('/stats/submissions', { params }),
  getAdminStats: () => API.get('/stats/admin'),
  getPublicStats: () => API.get('/stats/public'),
};

// ================================
// COMMON SERVICES (role-agnostic)
// ================================
export const commonService = {
  getPaper: (paperId) => API.get(`/papers/${paperId}`),
  getPaperReviews: (paperId) => API.get(`/papers/${paperId}/reviews`),
  getPublicStats: () => API.get('/stats/public'),
  generateProgram: (options) => API.post('/program/generate', options),
  downloadProgram: () => API.get('/program/download', { responseType: 'blob' }),
  downloadPaper: (paperId) => API.get(`/papers/${paperId}/download`, { responseType: 'blob', headers: { 'Accept': 'application/pdf' } }),
};

// ================================
// PAPER SERVICE – UNIFIED FOR CONVENIENCE
// ================================
export const paperService = {
  // Author endpoints
  submitPaper: authorService.submitPaper,
  getMyPapers: authorService.getMyPapers,
  getPaper: authorService.getPaper,
  updatePaper: authorService.updatePaper,
  withdrawPaper: authorService.withdrawPaper,
  downloadPaper: authorService.downloadPaper,

  // Reviewer endpoints
  getAssignedPapers: reviewerService.getAssignedPapers,
  submitReview: reviewerService.submitReview,
  getMyReviews: reviewerService.getMyReviews,

  // Admin endpoints
  getAllPapers: adminService.getAllPapers,
  assignReviewer: adminService.assignReviewer,
  makeDecision: adminService.makeFinalDecision,
  getPaperReviews: adminService.getPaperReviews,
  getStatistics: adminService.getStatistics,

  // Common / program
  generateConferenceProgram: commonService.downloadProgram,
};

// ================================
// USER SERVICE (legacy alias for admin user methods)
// ================================
export const userService = {
  getAllUsers: adminService.getAllUsers,
  getUser: adminService.getUser,
  createUser: adminService.createUser,
  updateUser: adminService.updateUser,
  deleteUser: adminService.deleteUser,
};

// ================================
// FILE UPLOAD UTILITY
// ================================
export const uploadService = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
};

// ================================
// HELPER FUNCTIONS
// ================================
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

export const handleFileDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const normalizeApiError = (error) => {
  const normalizedError = {
    success: false,
    status: null,
    message: 'Something went wrong. Please try again.',
    originalError: error,
  };
  if (error.response) {
    normalizedError.status = error.response.status;
    if (error.response.data?.message) normalizedError.message = error.response.data.message;
    else if (typeof error.response.data === 'string') normalizedError.message = error.response.data;
  } else if (error.request) {
    normalizedError.message = 'Network error. Please check your internet connection.';
  } else if (error.message) {
    normalizedError.message = error.message;
  }
  return normalizedError;
};

export default API;