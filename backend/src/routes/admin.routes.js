const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const {
  getAllPapers,
  assignReviewer,
  getPaperReviews,
  makeDecision,
  // User management
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/admin.controller');

// Admin-only access
router.use(protect, authorizeRoles('admin'));

// Paper routes
router.get('/papers', getAllPapers);
router.post('/assign-reviewer', assignReviewer);
router.get('/papers/:paperId/reviews', getPaperReviews);
router.post('/papers/:paperId/decision', makeDecision);

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;