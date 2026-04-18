const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'] },
    affiliation: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    abstract: { type: String, required: true },
    keywords: [{ type: String, index: true }],
    track: { type: String, required: true, index: true },
    authors: [authorSchema],
    submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    submissionId: { type: String, unique: true, index: true },
    status: { type: String, enum: ['submitted', 'under_review', 'accepted', 'rejected'], default: 'submitted', index: true },
    finalDecision: { type: String, enum: ['accept', 'reject', 'pending'], default: 'pending', index: true },
    finalDecisionLocked: { type: Boolean, default: false },
    decisionComments: { type: String, default: '' }, // <-- ADDED
    assignedReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

paperSchema.pre('save', async function (next) {
  if (!this.submissionId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Paper').countDocuments({
      submissionId: new RegExp(`^CMP-${year}-`),
    });
    const seq = (count + 1).toString().padStart(4, '0');
    this.submissionId = `CMP-${year}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('Paper', paperSchema);