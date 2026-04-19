const Paper = require('../models/paper.model');
const path = require('path');
const sendEmail = require('../utils/email');


/**
 * Submit a new paper
 */
exports.submitPaper = async (req, res) => {
  try {
    const { title, abstract, keywords, authors, track } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Paper file is required' });
    }

    // Parse keywords (sent as JSON string from frontend)
    let keywordArray = [];
    if (keywords) {
      try {
        keywordArray = JSON.parse(keywords);
      } catch (e) {
        keywordArray = keywords.split(',').map(k => k.trim());
      }
    }

    // Parse authors (sent as JSON string from frontend)
    let authorArray = [];
    if (authors) {
      try {
        authorArray = JSON.parse(authors);
      } catch (e) {
        // fallback: if not valid JSON, treat as single author
        authorArray = [{ name: authors, email: '', affiliation: '' }];
      }
    }

    // Ensure each author has at least a name
    authorArray = authorArray.map(a => ({
      name: a.name || a,
      email: a.email || '',
      affiliation: a.affiliation || '',
    }));

    // Create relative path for storage
    const relativePath = path.relative(process.cwd(), req.file.path);

    const paper = await Paper.create({
      title,
      abstract,
      keywords: keywordArray,
      track,
      authors: authorArray,
      submitter: req.user._id,
      fileName: req.file.originalname,
      filePath: relativePath,
      fileSize: req.file.size,
      status: 'submitted',
    });

    // Send confirmation email (non-blocking)
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Paper Submitted Successfully',
        html: `
          <h1>Paper Submitted</h1>
          <p>Dear ${req.user.name},</p>
          <p>Your paper titled <strong>"${paper.title}"</strong> has been successfully submitted to the conference.</p>
          <p><strong>Submission ID:</strong> ${paper.submissionId}</p>
          <p><strong>Track:</strong> ${paper.track}</p>
          <p><strong>Status:</strong> ${paper.status}</p>
          <p>You can track the status of your paper in your dashboard.</p>
          <br>
          <p>Best regards,<br>The Conference Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Submission confirmation email failed:', emailError);
    }

    res.status(201).json({
      message: 'Paper submitted successfully',
      paper: {
        id: paper._id,
        title: paper.title,
        status: paper.status,
        submissionId: paper.submissionId,
      },
    });
  } catch (error) {
    console.error('Paper submission error:', error);
    res.status(500).json({
      message: 'Paper submission failed',
      error: error.message,
    });
  }
};
/**
 * Update an existing paper (only if status is 'submitted')
 */
exports.updatePaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    const { title, abstract } = req.body;

    const paper = await Paper.findOne({
      _id: paperId,
      submitter: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Only allow updates if paper is still in 'submitted' state
    if (paper.status !== 'submitted') {
      return res.status(403).json({
        message: 'Cannot update paper once it is under review or decided',
      });
    }

    // Update fields
    paper.title = title || paper.title;
    paper.abstract = abstract || paper.abstract;

    await paper.save();

    res.status(200).json({
      message: 'Paper updated successfully',
      paper: {
        id: paper._id,
        title: paper.title,
        abstract: paper.abstract,
      },
    });
  } catch (error) {
    console.error('Update paper error:', error);
    res.status(500).json({ message: 'Failed to update paper' });
  }
};

/**
 * Delete a paper (only if status is 'submitted')
 */
exports.deletePaper = async (req, res) => {
  try {
    const paperId = req.params.id;

    const paper = await Paper.findOne({
      _id: paperId,
      submitter: req.user._id,
    });

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    if (paper.status !== 'submitted') {
      return res.status(403).json({
        message: 'Cannot delete paper once it is under review or decided',
      });
    }

    // Optionally delete the file from disk
    const fs = require('fs');
    const filePath = path.resolve(process.cwd(), paper.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await paper.deleteOne();

    res.status(200).json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ message: 'Failed to delete paper' });
  }
};

/**
 * View all papers submitted by logged-in author
 */
exports.getMyPapers = async (req, res) => {
  try {
    const papers = await Paper.find({
      submitter: req.user._id,
    })
      .select(
        'title abstract track keywords status finalDecision createdAt updatedAt fileName fileSize authors submissionId'
      )
      .sort({ createdAt: -1 });

    // Transform authors to strings for frontend
    const transformedPapers = papers.map((paper) => {
      const paperObj = paper.toObject();
      paperObj.authors = paper.authors.map(
        (a) =>
          `${a.name}${a.email ? ` <${a.email}>` : ''}${
            a.affiliation ? ` (${a.affiliation})` : ''
          }`
      );
      return paperObj;
    });

    res.status(200).json(transformedPapers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({
      message: 'Failed to fetch papers',
      error: error.message,
    });
  }
};

/**
 * Download paper file for author
 */
exports.downloadPaper = async (req, res) => {
  try {
    const paperId = req.params.paperId;
    const userId = req.user._id;

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Check if the logged-in user is the submitter
    if (paper.submitter.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const fs = require('fs');
    const filePath = path.resolve(process.cwd(), paper.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, paper.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download paper' });
  }
};