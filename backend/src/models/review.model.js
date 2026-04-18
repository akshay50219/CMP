const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: true,
      index: true,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Individual scores (1-10) – optional until the review is fully submitted
    overallRating: {
      type: Number,
      min: 1,
      max: 10,
    },

    originality: {
      type: Number,
      min: 1,
      max: 10,
    },

    technicalSoundness: {
      type: Number,
      min: 1,
      max: 10,
    },

    clarity: {
      type: Number,
      min: 1,
      max: 10,
    },

    significance: {
      type: Number,
      min: 1,
      max: 10,
    },

    references: {
      type: Number,
      min: 1,
      max: 10,
    },

    // Textual feedback
    strengths: String,
    weaknesses: String,
    comments: String,
    confidentialComments: String,

    // Conflict of interest declaration
    conflictOfInterest: {
      type: Boolean,
      required: true,
    },

    // Recommendation – pending means review not yet submitted
    recommendation: {
      type: String,
      enum: ['accept', 'revision', 'reject', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews by the same reviewer for the same paper
reviewSchema.index({ paper: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);