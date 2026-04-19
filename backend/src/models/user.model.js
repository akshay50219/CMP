const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 hides password by default
    },

    role: {
      type: String,
      enum: ['author', 'reviewer', 'admin'],
      required: true,
      default: 'author',
    },

    affiliation: {
      type: String,
      default: '',
    },

    // Single string field for reviewer expertise (comma‑separated values)
    expertise: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Inside userSchema (add after `expertise` field)
resetPasswordToken: {
  type: String,
  default: null,
},
resetPasswordExpire: {
  type: Date,
  default: null,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);