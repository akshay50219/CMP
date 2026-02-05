const Paper = require('../models/paper.model');

/**
 * Submit a new paper
 */
exports.submitPaper = async (req, res) => {
  try {
    const { title, abstract, keywords } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Paper file is required' });
    }

    const paper = await Paper.create({
      title,
      abstract,
      keywords: keywords ? keywords.split(',') : [],
      authors: [req.user._id],
      pdfPath: req.file.path
    });

    res.status(201).json({
      message: 'Paper submitted successfully',
      paper
    });
  } catch (error) {
    res.status(500).json({ message: 'Paper submission failed' });
  }
};

/**
 * View all papers submitted by logged-in author
 */
exports.getMyPapers = async (req, res) => {
  try {
    const papers = await Paper.find({
      authors: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch papers' });
  }
};
