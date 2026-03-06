const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const {
  getAdminStats,
  getPublicStats,
  getDashboardStats,
  getSubmissionStats,
} = require('../controllers/stats.controller');

/**
 * Admin-only detailed dashboard statistics
 */
router.get('/dashboard', protect, authorizeRoles('admin'), getDashboardStats);

/**
 * Admin-only simple statistics (legacy)
 */
router.get('/admin', protect, authorizeRoles('admin'), getAdminStats);

/**
 * Submission trends (admin only)
 */
router.get('/submissions', protect, authorizeRoles('admin'), getSubmissionStats);

/**
 * Public statistics (no auth)
 */
router.get('/public', getPublicStats);

module.exports = router;