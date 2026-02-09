const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  getAssignedPapers,
  downloadPaper,
  submitReview
} = require("../controllers/reviewer.controller");

// Reviewer-only middleware
router.use(protect, authorizeRoles("reviewer"));

/**
 * @route   GET /api/reviewer/papers
 * @desc    Get papers assigned to logged-in reviewer
 * @access  Private (Reviewer only)
 */
router.get("/papers", getAssignedPapers);

/**
 * @route   GET /api/reviewer/papers/:reviewId/download
 * @desc    Download paper file
 * @access  Private (Reviewer only)
 */
router.get("/papers/:reviewId/download", downloadPaper);

/**
 * @route   POST /api/reviewer/papers/:reviewId/review
 * @desc    Submit review for assigned paper
 * @access  Private (Reviewer only)
 */
router.post("/papers/:reviewId/review", submitReview);

module.exports = router;