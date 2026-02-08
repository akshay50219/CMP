const Paper = require('../models/paper.model');

/**
 * Admin statistics (internal use)
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalSubmissions = await Paper.countDocuments();

    const accepted = await Paper.countDocuments({
      finalDecision: 'accept'
    });

    const rejected = await Paper.countDocuments({
      finalDecision: 'reject'
    });

    const acceptanceRate =
      totalSubmissions === 0
        ? 0
        : ((accepted / totalSubmissions) * 100).toFixed(2);

    res.status(200).json({
      totalSubmissions,
      accepted,
      rejected,
      acceptanceRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load statistics' });
  }
};

/**
 * Public statistics (safe, read-only)
 */
exports.getPublicStats = async (req, res) => {
  try {
    const totalSubmissions = await Paper.countDocuments();

    const accepted = await Paper.countDocuments({
      finalDecision: 'accept'
    });

    const rejected = await Paper.countDocuments({
      finalDecision: 'reject'
    });

    const acceptanceRate =
      totalSubmissions === 0
        ? 0
        : ((accepted / totalSubmissions) * 100).toFixed(2);

    res.status(200).json({
      totalSubmissions,
      accepted,
      rejected,
      acceptanceRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load public statistics' });
  }
};
