const Paper = require('../models/paper.model');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const generateToken = require('../utils/token');
const sendEmail = require('../utils/email');
const crypto = require('crypto'); // for password reset

/**
 * Submit a new paper
 */
exports.submitPaper = async (req, res) => {
  // ... (keep your existing code, unchanged)
};

/**
 * View all papers submitted by logged-in author
 */
exports.getMyPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ submitter: req.user._id })
      .select('title abstract track keywords status finalDecision createdAt updatedAt fileName fileSize authors submissionId')
      .sort({ createdAt: -1 });

    const transformedPapers = papers.map((paper) => {
      const paperObj = paper.toObject();
      paperObj.authors = paper.authors.map(
        (a) => `${a.name}${a.email ? ` <${a.email}>` : ''}${a.affiliation ? ` (${a.affiliation})` : ''}`
      );
      return paperObj;
    });

    res.status(200).json(transformedPapers);
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({
      message: 'Failed to fetch papers',
      error: error.message,
    });
  }
};

/**
 * Register new user
 */
exports.register = async (req, res) => {
  const { name, email, password, role = 'author', affiliation = '', expertise = '' } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      affiliation,
      expertise,
    });

    const token = generateToken(user._id, user.role);

    // Send welcome email (non‑blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Conference Management System',
        html: `<h1>Welcome ${user.name}!</h1>
               <p>Thank you for registering...</p>`,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        affiliation: user.affiliation,
        expertise: user.expertise,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * Update user profile (authenticated users only)
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, affiliation, expertise, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (affiliation !== undefined) user.affiliation = affiliation;
    if (expertise !== undefined) user.expertise = expertise;

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(newPassword, salt);
    } else if (currentPassword || newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed"
    });
  }
};

// ==================== PASSWORD RESET FUNCTIONS ====================

/**
 * Forgot password – send reset link email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password (valid for 10 minutes):</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: message,
      });
      res.status(200).json({ message: 'Reset email sent successfully' });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reset password – using token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};