const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { 
  validateRegister, 
  validateLogin, 
  validateEmail, 
  validateCompanyRegister 
} = require('../utils/validation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, res, message = 'Login successfully') => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

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
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
};

// POST /api/auth/join-as-company
router.post('/join-as-company', async (req, res) => {
  // Validate request data
  const errors = validateCompanyRegister(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const {
      company_name,
      company_type,
      registration_number,
      incorporation_date,
      industry,
      company_email,
      company_phone,
      registered_address,
      city,
      state,
      country,
      postal_code,
      owner_full_name,
      owner_email,
      password,
      terms_accepted
    } = req.body;

    const existing = await User.findOne({ emailId: owner_email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Owner email already registered' });
    }

    // Split owner_full_name into first and last name
    const nameParts = owner_full_name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '.';

    const user = await User.create({
      firstName,
      lastName,
      emailId: owner_email.trim().toLowerCase(),
      phoneNumber: company_phone,
      password,
      role: 'company',
      companyDetails: {
        companyName: company_name,
        companyType: company_type,
        registrationNumber: registration_number,
        incorporationDate: incorporation_date,
        industry,
        companyEmail: company_email,
        companyPhone: company_phone,
        registeredAddress: registered_address,
        city,
        state,
        country,
        postalCode: postal_code,
        termsAccepted: terms_accepted
      },
      profile: {} // Initialize empty profile for default values
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Company registered successfully', 
      userId: user._id 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  const { emailId, password } = req.body;
  
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@collexa.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  if (emailId === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Issue token with 'admin' role
    const token = jwt.sign({ id: 'admin_id_001', role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    };

    return res
      .cookie('token', token, cookieOptions)
      .status(200)
      .json({
        message: 'Admin logged in successfully',
        token,
        user: {
          id: 'admin_id_001',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
        },
      });
  } else {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

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
        profile: {}, // Initialize empty profile to trigger default values like profilePicture
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

      if (user.isActive === false) {
        return res.status(401).json({ message: 'Account is deactivated. Please contact support.' });
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
// POST /api/auth/forgetPassword (Generate OTP and send email)
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

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Store OTP in database (hashed ideally, but plain for now as per previous pattern and request simplicity)
      user.resetPasswordToken = otp;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // LOG FOR DEVELOPMENT TESTING
      console.log('----------------------------------------------------');
      console.log(`OTP GENERATED FOR ${emailId}: ${otp}`);
      console.log('----------------------------------------------------');

      const message = `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .brand { color: #4A90E2; font-size: 28px; font-weight: bold; text-decoration: none; letter-spacing: 1px; }
            .content-card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 40px; text-align: center; border-top: 4px solid #4A90E2; }
            .title { color: #333333; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
            .text { color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .otp-box { background-color: #f0f4f8; border-radius: 6px; padding: 15px; margin: 30px 0; display: inline-block; }
            .otp-code { color: #2c3e50; font-size: 36px; font-weight: 700; letter-spacing: 5px; font-family: monospace; }
            .footer { text-align: center; margin-top: 30px; color: #999999; font-size: 14px; }
            .footer-link { color: #999999; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <a href="#" class="brand">Collexa</a>
            </div>
            <div class="content-card">
              <h1 class="title">Password Reset Request</h1>
              <p class="text">Hello,</p>
              <p class="text">We received a request to reset your password. Use the verification code below to complete the process. This code is valid for 10 minutes.</p>
              
              <div class="otp-box">
                <span class="otp-code">${otp}</span>
              </div>
              
              <p class="text">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Collexa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await sendEmail({
          email: user.emailId,
          subject: 'Password Reset OTP',
          message,
          html
        });

        return res.status(200).json({ success: true, data: 'OTP sent to email' });
      } catch (err) {
        console.error(err);
        
        // In production, we should clear the token if email fails
        if (process.env.NODE_ENV !== 'development') {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
          return res.status(500).json({ message: 'Email could not be sent' });
        }

        // In dev, keep token
        return res.status(200).json({ 
          success: true, 
          data: 'Email failed to send (check console for error), but OTP generated for testing. Check server console.' 
        });
      }

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/resetPassword (Verify OTP and update password)
router.post('/resetPassword', async (req, res) => {
  try {
    const { emailId, otp, newPassword } = req.body;

    if (!emailId || !otp || !newPassword) {
       return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    // Find user with matching email, valid OTP, and not expired
    const user = await User.findOne({
      emailId: emailId.trim().toLowerCase(),
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Set new password
    user.password = newPassword;
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

// @route   POST /api/auth/changePassword
// @desc    Change password (authenticated users)
// @access  Private
router.post('/changePassword', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

