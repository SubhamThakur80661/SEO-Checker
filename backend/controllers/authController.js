const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_change_me', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password
    });

    const token = getSignedJwtToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = getSignedJwtToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Server error' });
  }
};

// @desc    Continue as guest (shared demo account, no credentials needed)
// @route   POST /api/auth/guest
// @access  Public
exports.guestLogin = async (req, res) => {
  try {
    const GUEST_EMAIL = 'guest@rankpilot.app';

    let user = await User.findOne({ email: GUEST_EMAIL });

    if (!user) {
      // First guest visit: create the shared demo account. Its password is
      // a random value nobody knows, so it can never be logged into via
      // /login — only this endpoint can issue a token for it.
      try {
        const crypto = require('crypto');
        user = await User.create({
          name: 'Guest',
          email: GUEST_EMAIL,
          password: crypto.randomBytes(32).toString('hex'),
          role: 'user'
        });
      } catch (createErr) {
        // Another request may have created the guest account first — reuse it.
        user = await User.findOne({ email: GUEST_EMAIL });
        if (!user) throw createErr;
      }
    }

    const token = getSignedJwtToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        isGuest: true
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Server error' });
  }
};
