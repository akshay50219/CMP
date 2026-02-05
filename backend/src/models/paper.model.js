const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    abstract: {
      type: String,
      required: true
    },

    keywords: [
      {
        type: String,
        index: true
      }
    ],

    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],

    pdfPath: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'accepted', 'rejected'],
      default: 'submitted',
      index: true
    },

    finalDecision: {
      type: String,
      enum: ['accept', 'reject', 'pending'],
      default: 'pending',
      index: true
    },
    
    finalDecisionLocked: {
     type: Boolean,
     default: false
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('Paper', paperSchema);
