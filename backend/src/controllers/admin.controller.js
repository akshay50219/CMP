const Paper = require('../models/paper.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');

/**
 * View all papers
 */
exports.getAllPapers = async (req, res) => {
  try {
    const papers = await Paper.find()
      .populate('authors', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch papers' });
  }
};

/**
 * Assign reviewer to paper
 */
exports.assignReviewer = async (req, res) => {
  try {
    const { paperId, reviewerId } = req.body;

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Prevent self-review
    if (paper.authors.includes(reviewerId)) {
      return res.status(400).json({
        message: 'Author cannot review their own paper'
      });
    }

    // Ensure reviewer role
    const reviewer = await User.findOne({
      _id: reviewerId,
      role: 'reviewer'
    });

    if (!reviewer) {
      return res.status(400).json({ message: 'Invalid reviewer' });
    }

    await Review.create({
      paper: paperId,
      reviewer: reviewerId,
      conflictOfInterest: false
    });

    paper.status = 'under_review';
    await paper.save();

    res.status(201).json({ message: 'Reviewer assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Reviewer assignment failed' });
  }
};

/**
 * View all reviews for a paper
 */
exports.getPaperReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ paper: req.params.paperId })
      .populate('reviewer', 'name email');

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

/**
 * Make final decision
 */
exports.makeDecision = async (req, res) => {
  try {
    const { decision } = req.body;
    const paper = await Paper.findById(req.params.paperId);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (paper.finalDecisionLocked) {
      return res.status(403).json({
        message: 'Decision is locked and cannot be changed'
      });
    }

    paper.finalDecision = decision;
    paper.status = decision === 'accept' ? 'accepted' : 'rejected';
    paper.finalDecisionLocked = true;

    await paper.save();

    res.status(200).json({ message: 'Final decision recorded and locked' });
  } catch (error) {
    res.status(500).json({ message: 'Decision failed' });
  }
};
