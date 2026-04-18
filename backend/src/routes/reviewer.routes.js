const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  getAssignedPapers,
  downloadPaper,
  submitReview,
  getMyReviews, // <-- new import
} = require("../controllers/reviewer.controller");

// Reviewer-only middleware
router.use(protect, authorizeRoles("reviewer"));

/**
 * @route   GET /api/reviewer/papers
 * @desc    Get papers assigned to logged-in reviewer
 */
router.get("/papers", getAssignedPapers);

/**
 * @route   GET /api/reviewer/papers/:reviewId/download
 * @desc    Download paper file
 */
router.get("/papers/:reviewId/download", downloadPaper);

/**
 * @route   POST /api/reviewer/papers/:reviewId/review
 * @desc    Submit review for assigned paper
 */
router.post("/papers/:reviewId/review", submitReview);

/**
 * @route   GET /api/reviewer/reviews
 * @desc    Get all reviews submitted by logged-in reviewer
 */
router.get("/reviews", getMyReviews);

module.exports = router;