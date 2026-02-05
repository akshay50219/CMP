const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: true,
      index: true
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    scores: {
      originality: { type: Number, min: 1, max: 10 },
      relevance: { type: Number, min: 1, max: 10 },
      technicalQuality: { type: Number, min: 1, max: 10 }
    },

    comments: {
      type: String,
      default: ''
    },

    conflictOfInterest: {
      type: Boolean,
      required: true
    },

    recommendation: {
      type: String,
      enum: ['accept', 'weak_accept', 'weak_reject', 'reject'],
      required: true
    }
  },
  { timestamps: true }
);

// Prevent same reviewer reviewing same paper twice
reviewSchema.index({ paper: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
