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

