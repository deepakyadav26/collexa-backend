const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const InternshipApplication = require('../models/InternshipApplication');
const Internship = require('../models/Internship');
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs');

const router = express.Router();

// @route   POST /api/internship-applications/apply/:internshipId
// @desc    Apply for an internship
// @access  Private (Student/Employer/Company)
router.post('/apply/:internshipId', protect, upload.single('resume'), async (req, res) => {
  try {
    const { internshipId } = req.params;
    const userId = req.user._id;

    console.log('Request Headers Content-Type:', req.headers['content-type']);

    // Extract body fields
    console.log('Received Body:', req.body);
    console.log('Received File:', req.file);
    const { fullName, email, phoneNumber, whyHireYou } = req.body;

    // 1. Initial File Check
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required (PDF/DOC)' });
    }

    // 2. Validate Text Fields
    const errors = [];
    if (!fullName || !fullName.trim()) errors.push({ field: 'fullName', message: 'Full Name is required' });
    if (!email || !email.trim()) errors.push({ field: 'email', message: 'Email is required' });
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) errors.push({ field: 'email', message: 'Invalid email format' });
    
    if (!phoneNumber || !phoneNumber.trim()) errors.push({ field: 'phoneNumber', message: 'Phone Number is required' });
    if (!whyHireYou || !whyHireYou.trim()) errors.push({ field: 'whyHireYou', message: 'Answer to "Why should we hire you?" is required' });

    if (errors.length > 0) {
      console.log('Validation Errors:', errors); // Log specific validation failures
      // Remove uploaded file to save space if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Validation Error', errors });
    }

    // 3. Check if internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Internship not found' });
    }

    // 4. Check duplicate application
    const existingApplication = await InternshipApplication.findOne({ internship: internshipId, user: userId });
    if (existingApplication) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'You have already applied for this internship' });
    }

    // 5. Create Application
    const application = await InternshipApplication.create({
      internship: internshipId,
      user: userId,
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      coverLetter: whyHireYou.trim(),
      resumeUrl: req.file.path.replace(/\\/g, "/"), // Store relative path, normalize slashes
      status: 'Applied'
    });

    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (err) {
    // Cleanup file on server error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error applying for internship:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/internship-applications/my-applications
// @desc    Get logged-in user's internship applications
// @access  Private
router.get('/my-applications', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await InternshipApplication.find({ user: userId })
      .select('status createdAt internship')
      .populate({
        path: 'internship',
        select: 'title location stipendMin stipendMax duration mode company',
        populate: {
            path: 'company',
            model: 'Company',
            select: 'name logoUrl location'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    console.error('Error fetching internship applications:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/internship-applications/internship-applications/:internshipId
// @desc    Get all applications for a specific internship (Admin view)
// @access  Private (Admin only)
router.get(
  '/all-applications/:internshipId',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { internshipId } = req.params;

      const applications = await InternshipApplication.find({ internship: internshipId })
        .populate('user', 'firstName lastName emailId phoneNumber profile') // Populate applicant details
        .populate('internship', 'title') // Populate basic internship details if needed
        .sort({ createdAt: -1 });

      return res.status(200).json({ applications });
    } catch (err) {
      console.error('Error fetching internship applications:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PATCH /api/internship-applications/status/:applicationId
// @desc    Update application status
// @access  Private (Admin only)
router.patch(
  '/status/:applicationId',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;
      
      console.log('Received Status Update Request:', { applicationId, status, body: req.body });

      // Validate status
      const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Hired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const application = await InternshipApplication.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      application.status = status;
      await application.save();

      return res.status(200).json({
        message: `Application status updated to ${status}`,
        application,
      });
    } catch (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;