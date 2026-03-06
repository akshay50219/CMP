console.log('auth.controller.js is loading...');
const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');


// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/profile', protect, updateProfile);


module.exports = router;
console.log('Exported functions:', Object.keys(module.exports));