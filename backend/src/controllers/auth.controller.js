const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const generateToken = require('../utils/token');

/**
 * Register new user
 */
exports.register = async (req, res) => {
  const { name, email, password, role, affiliation } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      affiliation
    });

    // 5. Send response
    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),   // IMPORTANT FIX
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Register error:", error);   // IMPORTANT
    res.status(500).json({
      message: "Registration failed"
    });
  }
};


/**
 * Login user
 */
exports.login = async (req, res) => {

  const { email, password } = req.body;

  try {

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    // 2. Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // 4. Send response
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),   // IMPORTANT FIX
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);   // IMPORTANT
    res.status(500).json({
      message: "Login failed"
    });
  }
};