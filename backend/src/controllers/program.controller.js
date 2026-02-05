const Paper = require('../models/paper.model');
const generateProgramPDF = require('../utils/programPdf');

/**
 * Preview conference program (JSON)
 */
exports.previewProgram = async (req, res) => {
  try {
    const papers = await Paper.find({
      finalDecision: 'accept'
    })
      .populate('authors', 'name affiliation')
      .sort({ title: 1 });

    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load program preview' });
  }
};

/**
 * Generate downloadable PDF program
 */
exports.downloadProgramPDF = async (req, res) => {
  try {
    const papers = await Paper.find({
      finalDecision: 'accept'
    })
      .populate('authors', 'name affiliation')
      .sort({ title: 1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=conference-program.pdf'
    );

    generateProgramPDF(papers, res);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate program PDF' });
  }
};
