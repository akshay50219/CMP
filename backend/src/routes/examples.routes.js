const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

// Author-only route
router.get(
  '/author',
  protect,
  authorizeRoles('author'),
  (req, res) => {
    res.json({ message: 'Author content' });
  }
);

// Reviewer-only route
router.get(
  '/reviewer',
  protect,
  authorizeRoles('reviewer'),
  (req, res) => {
    res.json({ message: 'Reviewer content' });
  }
);

// Admin-only route
router.get(
  '/admin',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.json({ message: 'Admin content' });
  }
);

module.exports = router;
