const Paper = require('../models/paper.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');
/**
 * View all papers
 */
exports.getAllPapers = async (req, res) => {
  try {
    const papers = await Paper.find()
      .populate('submitter', 'name email')
      .populate('assignedReviewers', 'name email')
      .sort({ createdAt: -1 });

    const transformedPapers = papers.map((paper) => {
      const paperObj = paper.toObject();
      paperObj.submitterName = paper.submitter ? paper.submitter.name : 'Unknown';
      paperObj.authors = paper.authors.map(
        (a) =>
          `${a.name}${a.email ? ` <${a.email}>` : ''}${
            a.affiliation ? ` (${a.affiliation})` : ''
          }`
      );
      paperObj.assignedReviewers = paper.assignedReviewers.map((r) => ({
        _id: r._id,
        name: r.name,
      }));
      return paperObj;
    });

    res.status(200).json(transformedPapers);
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

    const paper = await Paper.findById(paperId)
      .populate('submitter', 'name email') // for author email
      .populate('assignedReviewers');
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (paper.submitter._id.toString() === reviewerId) {
      return res.status(400).json({
        message: 'Author cannot review their own paper',
      });
    }

    const reviewer = await User.findOne({
      _id: reviewerId,
      role: 'reviewer',
    });

    if (!reviewer) {
      return res.status(400).json({ message: 'Invalid reviewer' });
    }

    if (paper.assignedReviewers.some(r => r._id.toString() === reviewerId)) {
      return res.status(400).json({ message: 'Reviewer already assigned' });
    }

    paper.assignedReviewers.push(reviewerId);
    paper.status = 'under_review';
    await paper.save();

    await Review.create({
      paper: paperId,
      reviewer: reviewerId,
      conflictOfInterest: false,
    });

    // Notify reviewer via email (non-blocking)
    try {
      await sendEmail({
        to: reviewer.email,
        subject: 'New Paper Assignment for Review',
        html: `
          <h1>New Review Assignment</h1>
          <p>Dear ${reviewer.name},</p>
          <p>You have been assigned to review a new paper:</p>
          <p><strong>Title:</strong> ${paper.title}</p>
          <p><strong>Submission ID:</strong> ${paper.submissionId}</p>
          <p><strong>Abstract:</strong> ${paper.abstract.substring(0, 200)}...</p>
          <p>Please log in to the reviewer dashboard to download the paper and submit your review.</p>
          <br>
          <p>Thank you for your contribution,<br>The Conference Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Reviewer assignment email failed:', emailError);
    }

    res.status(201).json({ message: 'Reviewer assigned successfully' });
  } catch (error) {
    console.error(error);
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
    const { decision, comments } = req.body;
    const paper = await Paper.findById(req.params.paperId)
      .populate('submitter', 'name email');

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (paper.finalDecisionLocked) {
      return res.status(403).json({
        message: 'Decision is locked and cannot be changed',
      });
    }

    paper.finalDecision = decision;
    paper.status = decision === 'accept' ? 'accepted' : 'rejected';
    paper.finalDecisionLocked = true;
    paper.decisionComments = comments || '';

    await paper.save();

    // Notify author via email (non-blocking)
    try {
      const decisionText = decision === 'accept' ? 'ACCEPTED' : 'REJECTED';
      await sendEmail({
        to: paper.submitter.email,
        subject: `Paper Decision: ${paper.title}`,
        html: `
          <h1>Final Decision on Your Paper</h1>
          <p>Dear ${paper.submitter.name},</p>
          <p>The program committee has reached a decision on your paper:</p>
          <p><strong>Title:</strong> ${paper.title}</p>
          <p><strong>Submission ID:</strong> ${paper.submissionId}</p>
          <p><strong>Decision:</strong> <span style="color: ${decision === 'accept' ? 'green' : 'red'};">${decisionText}</span></p>
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
          <br>
          <p>You can view the detailed reviews and decision in your author dashboard.</p>
          <p>Best regards,<br>The Conference Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Decision notification email failed:', emailError);
    }

    res.status(200).json({ message: 'Final decision recorded and locked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Decision failed' });
  }
};
// ==================== USER MANAGEMENT ====================

/**
 * Get all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * Create a new user (admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, affiliation, expertise, isActive } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      affiliation,
      expertise,
      isActive,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

/**
 * Update a user (admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, affiliation, expertise, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (affiliation !== undefined) user.affiliation = affiliation;
    if (expertise !== undefined) user.expertise = expertise;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

/**
 * Delete a user (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: prevent deleting last admin or yourself
    if (user.role === 'admin' && req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};