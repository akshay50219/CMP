const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');

const {
  previewProgram,
  downloadProgramPDF
} = require('../controllers/program.controller');

// Admin-only
router.use(protect, authorizeRoles('admin'));

// Preview program
router.get('/preview', previewProgram);

// Download PDF
router.get('/download', downloadProgramPDF);

module.exports = router;
