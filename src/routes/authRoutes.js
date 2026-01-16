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

// Rate limiting middleware
const limiter = require('express-rate-limit');
const sendEmail = require('../utils/sendEmail');

const forgetPasswordLimiter = limiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many password reset requests from this IP, please try again after an hour',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// POST /api/auth/forgetPassword (with email sending and rate limiting)
router.post('/forgetPassword', forgetPasswordLimiter, async (req, res) => {
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

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash user token and save to database (optional security step, but simplicity requested first)
      // Here saving plain token as per existing schema structure implies plain token storage or similar. 
      // The schema has resetPasswordToken: String.
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save(); // Validate false if other fields are issues? No, just save.

      // Create reset URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${emailId}`;

      // LOG FOR DEVELOPMENT TESTING
      console.log('----------------------------------------------------');
      console.log('PASSWORD RESET LINK (For Testing):');
      console.log(resetUrl);
      console.log('----------------------------------------------------');

      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
      
      const html = `
        <h1>Password Reset Request</h1>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
      `;

      try {
        await sendEmail({
          email: user.emailId,
          subject: 'Password Reset Token',
          message,
          html
        });

        return res.status(200).json({ success: true, data: 'Email sent' });
      } catch (err) {
        console.error(err);
        
        // In production, we should clear the token if email fails to prevent unused tokens.
        // But in development, we keep it so you can test using the console log link.
        if (process.env.NODE_ENV !== 'development') {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
          return res.status(500).json({ message: 'Email could not be sent' });
        }

        // In dev, return success but warn about email failure
        return res.status(200).json({ 
          success: true, 
          data: 'Email failed to send (check console for error), but token preserved for local testing. Check server console for Reset Link.' 
        });
      }

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/resetPassword
router.post('/resetPassword', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
       return res.status(400).json({ message: 'Please provide token and new password' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      data: 'Password reset successful',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

