const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email
          ? 'Email already in use'
          : 'Username already taken'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
        age: user.age || '',
        gender: user.gender || '',
        phone: user.phone || '',
        address: user.address || '',
        medicalHistory: user.medicalHistory || '',
        allergies: user.allergies || '',
        dietaryPreferences: user.dietaryPreferences || '',
        profileImage: user.profileImage || '/images/default-profile.png',
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      address,
      medicalHistory,
      allergies,
      dietaryPreferences,
      profileImage
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (fullName !== undefined) user.fullName = fullName;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;
    if (allergies !== undefined) user.allergies = allergies;
    if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName || '',
      age: updatedUser.age || '',
      gender: updatedUser.gender || '',
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      medicalHistory: updatedUser.medicalHistory || '',
      allergies: updatedUser.allergies || '',
      dietaryPreferences: updatedUser.dietaryPreferences || '',
      profileImage: updatedUser.profileImage || '/images/default-profile.png',
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate random 4-digit code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    // Save reset code and expiry to user
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send email with reset code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${resetCode}. This code is valid for 15 minutes.`,
    };

    // In development or if transporter is not configured, log to console
    console.log(`[DEV/MOCK EMAIL] To: ${email} | Subject: Password Reset Code | Code: ${resetCode}`);

    res.status(200).json({ message: 'Reset code sent to email (check server logs)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Reset Code Endpoint
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (user.resetCode !== code || user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.status(200).json({ message: 'Code verified' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = null; // Clear reset code
    user.resetCodeExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/favorites
// @desc    Get all favorite recipes for the current user
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    // Find user and populate their favorite recipes
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        model: 'Recipe', // Explicitly specify the model
        select: 'name ingredients instructions type countryOfOrigin preparationTime locationImage createdAt'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the array of favorite recipes
    res.json({
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
