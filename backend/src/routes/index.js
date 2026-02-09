const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth.routes');
const authorRoutes = require('./author.routes');
const reviewerRoutes = require('./reviewer.routes');
const adminRoutes = require('./admin.routes');
const programRoutes = require('./program.routes');
const statsRoutes = require('./stats.routes');
const testRoutes = require('./test.routes');

// Use the routes
router.use('/auth', authRoutes);
router.use('/author', authorRoutes);
router.use('/reviewer', reviewerRoutes);
router.use('/admin', adminRoutes);
router.use('/program', programRoutes);
router.use('/stats', statsRoutes);
router.use('/test', testRoutes);

module.exports = router;