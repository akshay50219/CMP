const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { downloadPaper } = require('../controllers/paper.controller');

// All paper routes require authentication
router.use(protect);

// Download paper by ID
router.get('/:paperId/download', downloadPaper);

module.exports = router;