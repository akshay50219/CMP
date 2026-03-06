const Review = require('../models/review.model');
const Paper = require('../models/paper.model');
const path = require('path');

/**
 * Get papers assigned to logged-in reviewer
 */
exports.getAssignedPapers = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id }).populate(
      'paper'
    );

    const assignedPapers = reviews.map((r) => {
      const paper = r.paper;
      const paperObj = paper.toObject();
      // Transform embedded authors to strings for frontend
      paperObj.authors = paper.authors.map(
        (a) =>
          `${a.name}${a.email ? ` <${a.email}>` : ''}${
            a.affiliation ? ` (${a.affiliation})` : ''
          }`
      );
      return {
        reviewId: r._id,
        paperId: paper._id,
        title: paper.title,
        abstract: paper.abstract,
        track: paper.track,
        status: paper.status,
        authors: paperObj.authors,
        fileName: paper.fileName,
        filePath: paper.filePath,
        submissionId: paper.submissionId,
        reviewDeadline: r.deadline, // if you add a deadline field later
        assignmentDate: r.createdAt,
        // Indicate whether review has been submitted (recommendation not pending)
        reviewSubmitted: r.recommendation !== 'pending',
        // Include the full review object (if any) for pre‑filling when editing
        myReview: r.recommendation !== 'pending' ? r : null,
      };
    });

    res.status(200).json(assignedPapers);
  } catch (error) {
    console.error(error);
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
      reviewer: req.user._id,
    }).populate('paper');

    if (!review) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.resolve(__dirname, '..', review.paper.filePath);
    res.download(filePath, review.paper.fileName);
  } catch (error) {
    res.status(500).json({ message: 'File download failed' });
  }
};

/**
 * Submit (or update) a review for an assigned paper
 */
exports.submitReview = async (req, res) => {
  try {
    const {
      overallRating,
      originality,
      technicalSoundness,
      clarity,
      significance,
      references,
      strengths,
      weaknesses,
      comments,
      confidentialComments,
      conflictOfInterest,
      recommendation,
    } = req.body;

    const review = await Review.findOne({
      _id: req.params.reviewId,
      reviewer: req.user._id,
    });

    if (!review) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update all fields
    review.overallRating = overallRating;
    review.originality = originality;
    review.technicalSoundness = technicalSoundness;
    review.clarity = clarity;
    review.significance = significance;
    review.references = references;
    review.strengths = strengths;
    review.weaknesses = weaknesses;
    review.comments = comments;
    review.confidentialComments = confidentialComments || '';
    review.conflictOfInterest = conflictOfInterest;
    review.recommendation = recommendation;

    await review.save();

    res.status(200).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Review submission failed' });
  }
};

/**
 * Get all reviews submitted by the logged-in reviewer
 */
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate({
        path: 'paper',
        select: 'title track authors submissionId abstract', // Include needed fields
      })
      .sort({ createdAt: -1 });

    // Format response to match frontend expectations (see MyReviews.jsx)
    const formattedReviews = reviews.map((review) => {
      const paper = review.paper;
      return {
        _id: review._id,
        paperId: paper._id,
        paperTitle: paper.title,
        paperTrack: paper.track,
        paperAuthors: paper.authors.map(
          (a) =>
            `${a.name}${a.email ? ` <${a.email}>` : ''}${
              a.affiliation ? ` (${a.affiliation})` : ''
            }`
        ),
        overallRating: review.overallRating,
        originality: review.originality,
        technicalSoundness: review.technicalSoundness,
        clarity: review.clarity,
        significance: review.significance,
        references: review.references,
        strengths: review.strengths,
        weaknesses: review.weaknesses,
        comments: review.comments,
        confidentialComments: review.confidentialComments,
        recommendation: review.recommendation,
        submittedAt: review.updatedAt, // or createdAt
      };
    });

    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};