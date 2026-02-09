const Paper = require('../models/paper.model');
const path = require('path');

/**
 * Submit a new paper
 */
exports.submitPaper = async (req, res) => {
  try {
    const { title, abstract, keywords } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Paper file is required' });
    }

    // Create relative path for storage
    const relativePath = path.relative(process.cwd(), req.file.path);

    const paper = await Paper.create({
      title,
      abstract,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      authors: [req.user._id],
      pdfPath: relativePath,
      status: 'submitted'
    });

    res.status(201).json({
      message: 'Paper submitted successfully',
      paper: {
        id: paper._id,
        title: paper.title,
        status: paper.status
      }
    });
  } catch (error) {
    console.error("Paper submission error:", error);
    res.status(500).json({ 
      message: 'Paper submission failed',
      error: error.message 
    });
  }
};

/**
 * View all papers submitted by logged-in author
 */
exports.getMyPapers = async (req, res) => {
  try {
    const papers = await Paper.find({
      authors: req.user._id
    })
      .select('title abstract status finalDecision createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(papers);
  } catch (error) {
    console.error("Get papers error:", error);
    res.status(500).json({ 
      message: 'Failed to fetch papers',
      error: error.message 
    });
  }
};