const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const uploadPaper = require('../middleware/upload.middleware');

const {
  submitPaper,
  getMyPapers,
  updatePaper,
  deletePaper,
  downloadPaper,
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

// Update paper (only if submitted)
router.put('/papers/:id', updatePaper);

// Delete paper (only if submitted)
router.delete('/papers/:id', deletePaper);

// Download papers
router.get('/papers/:paperId/download', downloadPaper);

module.exports = router;