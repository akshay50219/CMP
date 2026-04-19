const express = require('express');
const router = express.Router();
const { register, login, updateProfile, forgotPassword, resetPassword, getProfile } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);

module.exports = router;