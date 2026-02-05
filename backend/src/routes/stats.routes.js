const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const {
  getAdminStats,
  getPublicStats
} = require('../controllers/stats.controller');

/**
 * Admin-only statistics
 */
router.get(
  '/admin',
  protect,
  authorizeRoles('admin'),
  getAdminStats
);

/**
 * Public statistics (no auth)
 */
router.get('/public', getPublicStats);

module.exports = router;
