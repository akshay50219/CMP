import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Special handling for FormData (file uploads)
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // You can add any global response handling here
    return response;
  },
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
      // Show backend error message
      toast.error(response.data.message);
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    error.normalized = normalizeApiError(error);

    return Promise.reject(error);
  }
);

// Auth Services
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

// Author Services
export const authorService = {
  // Paper submission and management for authors
  submitPaper: (formData) => {
    // Note: FormData should contain: title, abstract, keywords[], authors[], pdf (file)
    return API.post('/author/papers', formData);
  },
  getMyPapers: () => API.get('/author/papers'),
  getPaper: (id) => API.get(`/author/papers/${id}`),
  updatePaper: (id, paperData) => API.put(`/author/papers/${id}`, paperData),
  withdrawPaper: (id) => API.delete(`/author/papers/${id}`),
  
  // Download paper file
  downloadPaper: (paperId) => 
    API.get(`/author/papers/${paperId}/download`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }),
};

// Reviewer Services
export const reviewerService = {
  // Get assigned papers
  getAssignedPapers: () => API.get('/reviewer/papers'),
  getPaperForReview: (reviewId) => API.get(`/reviewer/papers/${reviewId}`),
  
  // Download paper for review
  downloadPaperForReview: (reviewId) => 
    API.get(`/reviewer/papers/${reviewId}/download`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }),
  
  // Submit review
  submitReview: (reviewId, reviewData) => 
    API.post(`/reviewer/papers/${reviewId}/review`, reviewData),
  
  // Get my submitted reviews
  getMyReviews: () => API.get('/reviewer/reviews'),
  updateReview: (reviewId, reviewData) => 
    API.put(`/reviewer/reviews/${reviewId}`, reviewData),
};

// Admin Services
export const adminService = {
  // User management
  getAllUsers: (params) => API.get('/admin/users', { params }),
  getUser: (userId) => API.get(`/admin/users/${userId}`),
  createUser: (userData) => API.post('/admin/users', userData),
  updateUser: (userId, userData) => API.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => API.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => 
    API.put(`/admin/users/${userId}/role`, { role }),
  
  // Reviewer management
  getReviewers: () => API.get('/admin/reviewers'),
  getAvailableReviewers: (paperId) => 
    API.get(`/admin/papers/${paperId}/available-reviewers`),
  
  // Paper management
  getAllPapers: (params) => API.get('/admin/papers', { params }),
  getPaperDetails: (paperId) => API.get(`/admin/papers/${paperId}`),
  updatePaperStatus: (paperId, status) => 
    API.put(`/admin/papers/${paperId}/status`, { status }),
  assignReviewer: (paperId, reviewerId) => 
    API.post(`/admin/papers/${paperId}/assign-reviewer`, { reviewerId }),
  removeReviewer: (paperId, reviewerId) => 
    API.delete(`/admin/papers/${paperId}/reviewer/${reviewerId}`),
  makeFinalDecision: (paperId, decision) => 
    API.post(`/admin/papers/${paperId}/decision`, { decision }),
  lockFinalDecision: (paperId) => 
    API.put(`/admin/papers/${paperId}/lock-decision`),
  
  // Review management
  getPaperReviews: (paperId) => API.get(`/admin/papers/${paperId}/reviews`),
  
  // Statistics
  getStatistics: () => API.get('/admin/stats'),
  exportData: (format = 'csv') => 
    API.get(`/admin/export/${format}`, { responseType: 'blob' }),
};

// Common Services (accessible by multiple roles)
export const commonService = {
  // Paper services accessible by both admin and reviewers
  getPaper: (paperId) => API.get(`/papers/${paperId}`),
  getPaperReviews: (paperId) => API.get(`/papers/${paperId}/reviews`),
  
  // Statistics for public/admin
  getPublicStats: () => API.get('/stats/public'),
  
  // Conference program
  generateProgram: (options) => API.post('/program/generate', options),
  downloadProgram: () => 
    API.get('/program/download', { responseType: 'blob' }),
};

// File Upload Utility
export const uploadService = {
  uploadFile: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

// Helper function to extract error message
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper function to handle file downloads
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

// ================================
// API ERROR NORMALIZATION LAYER
// ================================

export const normalizeApiError = (error) => {
  // Default normalized error object
  const normalizedError = {
    success: false,
    status: null,
    message: 'Something went wrong. Please try again.',
    originalError: error,
  };

  // Axios response error
  if (error.response) {
    normalizedError.status = error.response.status;

    if (error.response.data?.message) {
      normalizedError.message = error.response.data.message;
    } else if (typeof error.response.data === 'string') {
      normalizedError.message = error.response.data;
    }
  }
  // Network / timeout error
  else if (error.request) {
    normalizedError.message = 'Network error. Please check your internet connection.';
  }
  // Other JS errors
  else if (error.message) {
    normalizedError.message = error.message;
  }

  return normalizedError;
};

export default API;