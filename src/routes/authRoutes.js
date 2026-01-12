const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { validateRegister, validateLogin, validateEmail } = require('../utils/validation');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, res, message = 'Login successfully') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .cookie('token', token, cookieOptions)
    .status(200)
    .json({
      message,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    // Validate request data
    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const { firstName, lastName, emailId, phoneNumber, password, role, jobType } =
        req.body;

      const existing = await User.findOne({ emailId });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Trim and normalize data before saving
      const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailId: emailId.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password,
        role: role || 'student',
        jobType: jobType || 'job', // Default to 'job' if not provided
      });

      return res
        .status(201)
        .json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post('/login', async (req, res) => {
    // Validate request data
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const { emailId, password } = req.body;
      const user = await User.findOne({ emailId: emailId.trim().toLowerCase() }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      sendTokenResponse(user, res, 'Login successfully');
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/forgetPassword (without token)
router.post('/forgetPassword', async (req, res) => {
    // Validate request data
    const errors = validateEmail(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const { emailId } = req.body;
      const user = await User.findOne({ emailId: emailId.trim().toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      // For now, just return token in response (in real app, send via email)
      return res.status(200).json({
        message: 'Password reset token generated',
        resetToken,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

