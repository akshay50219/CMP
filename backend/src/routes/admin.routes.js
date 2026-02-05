const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const {
  getAllPapers,
  assignReviewer,
  getPaperReviews,
  makeDecision
} = require('../controllers/admin.controller');

// Admin-only access
router.use(protect, authorizeRoles('admin'));

router.get('/papers', getAllPapers);
router.post('/assign-reviewer', assignReviewer);
router.get('/papers/:paperId/reviews', getPaperReviews);
router.post('/papers/:paperId/decision', makeDecision);

module.exports = router;
