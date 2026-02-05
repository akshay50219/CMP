const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const generateToken = require('../utils/token');

/**
 * Register new user
 */
exports.register = async (req, res) => {
  const { name, email, password, role, affiliation } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      affiliation
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};
