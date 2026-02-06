const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const Job = require('../models/Job');
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs');

const router = express.Router();

// @route   POST /api/applications/apply/:jobId
// @desc    Apply for a job
// @access  Private (Student/Employer/Company)
router.post('/apply/:jobId', protect, upload.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // console.log('Request Headers Content-Type:', req.headers['content-type']);

    // Extract body fields
    // console.log('Received Body:', req.body);
    // console.log('Received File:', req.file);
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

    // 3. Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Job not found' });
    }

    // 4. Check duplicate application
    const existingApplication = await Application.findOne({ job: jobId, user: userId });
    if (existingApplication) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // 5. Create Application
    const application = await Application.create({
      job: jobId,
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
    console.error('Error applying for job:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get logged-in user's applications
// @access  Private
router.get('/my-applications', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({ user: userId })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          model: 'Company'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/job-applications/:jobId Get All Applications for a specific job Id (Admin view Only)
// @desc    Get all applications for a specific job (Admin view)
// @access  Private (Admin only)
router.get(
  '/job-applications/:jobId',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      const applications = await Application.find({ job: jobId })
        .populate('user', 'firstName lastName emailId phoneNumber profile') // Populate applicant details
        .populate('job', 'title') // Populate basic job details if needed
        .sort({ createdAt: -1 });

      return res.status(200).json({ applications });
    } catch (err) {
      console.error('Error fetching job applications:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PATCH /api/applications/status/:applicationId
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

      // console.log('PATCH Status Update - Body:', req.body);
      // console.log('Received Status:', status);

      // Validate status
      const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Hired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const application = await Application.findById(applicationId);
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
