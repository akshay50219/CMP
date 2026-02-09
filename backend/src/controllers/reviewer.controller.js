const Review = require('../models/review.model');
const Paper = require('../models/paper.model');
const path = require('path');

/**
 * Get papers assigned to logged-in reviewer
 */
exports.getAssignedPapers = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate('paper');

    const assignedPapers = reviews.map(r => ({
      reviewId: r._id,
      paperId: r.paper._id,
      title: r.paper.title,
      abstract: r.paper.abstract,
      status: r.paper.status,
      pdfPath: r.paper.pdfPath,
      isReviewed: !!r.recommendation
    }));

    res.status(200).json(assignedPapers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assigned papers' });
  }
};

/**
 * Download paper file
 */
exports.downloadPaper = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      reviewer: req.user._id
    }).populate('paper');

    if (!review) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.resolve(__dirname, '..', 'uploads', review.paper.pdfPath);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'File download failed' });
  }
};

/**
 * Submit review for assigned paper
 */
exports.submitReview = async (req, res) => {
  try {
    const { scores, comments, conflictOfInterest, recommendation } = req.body;

    const review = await Review.findOne({
      _id: req.params.reviewId,
      reviewer: req.user._id
    });

    if (!review) {
      return res.status(403).json({ message: 'Access denied' });
    }

    review.scores = scores;
    review.comments = comments;
    review.conflictOfInterest = conflictOfInterest;
    review.recommendation = recommendation;

    await review.save();

    res.status(200).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Review submission failed' });
  }
};