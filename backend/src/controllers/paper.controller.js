const Paper = require('../models/paper.model');
const path = require('path');
const fs = require('fs');

/**
 * Download paper file
 * Accessible by: author of the paper, assigned reviewers, admin
 */
exports.downloadPaper = async (req, res) => {
  try {
    const paperId = req.params.paperId;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find the paper
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Check permissions
    const isAuthor = paper.submitter.toString() === userId.toString();
    const isReviewer = paper.assignedReviewers.some(
      (reviewerId) => reviewerId.toString() === userId.toString()
    );
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isReviewer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file exists
    const filePath = path.resolve(process.cwd(), paper.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Send the file
    res.download(filePath, paper.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download paper' });
  }
};