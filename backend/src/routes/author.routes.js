const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const uploadPaper = require('../middleware/upload.middleware');

const {
  submitPaper,
  getMyPapers
} = require('../controllers/author.controller');

// Author-only middleware chain
router.use(protect, authorizeRoles('author'));

// Submit paper
router.post(
  '/papers',
  uploadPaper.single('paper'),
  submitPaper
);

// View own papers
router.get('/papers', getMyPapers);

module.exports = router;
