const Paper = require('../models/paper.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Get comprehensive dashboard statistics (admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalPapers = await Paper.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Paper status distribution
    const statusDistribution = await Paper.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    // Paper track distribution
    const trackDistribution = await Paper.aggregate([
      { $group: { _id: '$track', count: { $sum: 1 } } },
      { $project: { track: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Final decision distribution
    const decisionDistribution = await Paper.aggregate([
      { $match: { finalDecision: { $ne: 'pending' } } },
      { $group: { _id: '$finalDecision', count: { $sum: 1 } } },
      { $project: { decision: '$_id', count: 1, _id: 0 } },
    ]);

    // User role distribution
    const userRoleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } },
    ]);

    // Acceptance rate by track
    const acceptanceByTrack = await Paper.aggregate([
      { $match: { finalDecision: { $in: ['accept', 'reject'] } } },
      {
        $group: {
          _id: '$track',
          total: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$finalDecision', 'accept'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          track: '$_id',
          total: 1,
          accepted: 1,
          rate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$accepted', '$total'] }, 100] },
            ],
          },
        },
      },
      { $sort: { rate: -1 } },
    ]);

    // Average review scores (overall and per criterion)
    const avgReviewScores = await Review.aggregate([
      {
        $match: {
          overallRating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgOriginality: { $avg: '$originality' },
          avgTechnical: { $avg: '$technicalSoundness' },
          avgClarity: { $avg: '$clarity' },
          avgSignificance: { $avg: '$significance' },
          avgReferences: { $avg: '$references' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Reviewer performance: number of reviews completed, average rating given
    const reviewerPerformance = await Review.aggregate([
      {
        $match: {
          recommendation: { $ne: 'pending' },
        },
      },
      {
        $group: {
          _id: '$reviewer',
          reviewsCompleted: { $sum: 1 },
          avgRatingGiven: { $avg: '$overallRating' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'reviewerInfo',
        },
      },
      { $unwind: '$reviewerInfo' },
      {
        $project: {
          _id: 0,
          reviewerId: '$_id',
          name: '$reviewerInfo.name',
          email: '$reviewerInfo.email',
          reviewsCompleted: 1,
          avgRatingGiven: { $round: ['$avgRatingGiven', 1] },
        },
      },
      { $sort: { reviewsCompleted: -1 } },
    ]);

    // Monthly submission trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const submissionTrends = await Paper.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          count: 1,
        },
      },
    ]);

    // Recent activity (papers and reviews in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPapers = await Paper.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentReviews = await Review.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Summary object for quick stats (matches frontend expectations)
    const summary = {
      papers: totalPapers,
      users: totalUsers,
      reviews: totalReviews,
      submitted:
        statusDistribution.find((s) => s.status === 'submitted')?.count || 0,
      underReview:
        statusDistribution.find((s) => s.status === 'under_review')?.count || 0,
      accepted:
        decisionDistribution.find((d) => d.decision === 'accept')?.count || 0,
      rejected:
        decisionDistribution.find((d) => d.decision === 'reject')?.count || 0,
      revisions: 0, // not currently tracked
      avgReviewScore: avgReviewScores[0]?.avgOverall.toFixed(1) || 0,
      avgReviewTime: 0, // would need review assignment date to calculate
      completedReviews:
        await Review.countDocuments({ recommendation: { $ne: 'pending' } }),
      assignedReviews: await Review.countDocuments(),
      overdueReviews: 0, // needs deadline field
    };

    res.status(200).json({
      summary,
      statusDistribution,
      trackDistribution,
      decisionDistribution,
      userRoleDistribution,
      acceptanceByTrack,
      avgReviewScores: avgReviewScores[0] || {},
      reviewerPerformance,
      submissionTrends,
      recentActivity: {
        papers: recentPapers,
        reviews: recentReviews,
        users: recentUsers,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to load statistics' });
  }
};

/**
 * Get submission statistics over time (for charts)
 * Query param: range = 'week' | 'month' | 'quarter' | 'year'
 */
exports.getSubmissionStats = async (req, res) => {
  try {
    const { range = 'month' } = req.query;

    let startDate;
    const now = new Date();
    let groupFormat;

    switch (range) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        groupFormat = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    }

    const submissions = await Paper.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: groupFormat, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    // Format response as { dates: [], counts: [] }
    const dates = submissions.map((s) => {
      if (s._id.day) {
        return `${s._id.year}-${String(s._id.month).padStart(2, '0')}-${String(s._id.day).padStart(2, '0')}`;
      } else if (s._id.week) {
        return `Week ${s._id.week}, ${s._id.year}`;
      } else {
        return `${s._id.year}-${String(s._id.month).padStart(2, '0')}`;
      }
    });
    const counts = submissions.map((s) => s.count);

    res.status(200).json({ dates, counts });
  } catch (error) {
    console.error('Submission stats error:', error);
    res.status(500).json({ message: 'Failed to load submission statistics' });
  }
};

/**
 * Legacy admin stats (simple counts) – kept for backward compatibility
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalSubmissions = await Paper.countDocuments();
    const accepted = await Paper.countDocuments({ finalDecision: 'accept' });
    const rejected = await Paper.countDocuments({ finalDecision: 'reject' });
    const acceptanceRate =
      totalSubmissions === 0 ? 0 : ((accepted / totalSubmissions) * 100).toFixed(2);

    res.status(200).json({
      totalSubmissions,
      accepted,
      rejected,
      acceptanceRate,
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
    const accepted = await Paper.countDocuments({ finalDecision: 'accept' });
    const rejected = await Paper.countDocuments({ finalDecision: 'reject' });
    const acceptanceRate =
      totalSubmissions === 0 ? 0 : ((accepted / totalSubmissions) * 100).toFixed(2);

    res.status(200).json({
      totalSubmissions,
      accepted,
      rejected,
      acceptanceRate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load public statistics' });
  }
};