const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const CampusCourse = require('../models/CampusCourse');
const LeadCampusCourse = require('../models/LeadCampusCourse');
const { validateCampusCourse, validateCampusCourseLead } = require('../utils/validation');

const router = express.Router();

// POST /api/campuscourses/createCampus - Create a new campus course (Admin only)
router.post(
  '/createCampus',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    // Validate request data
    const errors = validateCampusCourse(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const course = await CampusCourse.create(req.body);
      return res.status(201).json({ 
        success: true, 
        message: 'Campus course created successfully', 
        course 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/campuscourses - List all active campus courses (Public)
router.get('/', async (req, res) => {
  try {
    const courses = await CampusCourse.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: courses.length, courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/campuscourses/lead - Capture a new campus course lead (Public)
router.post('/lead', async (req, res) => {
  // Validate request data
  const errors = validateCampusCourseLead(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const { name, email, phone, course, state, termsAccepted } = req.body;
    
    // Check if duplicate enquiry exists for the same email and course
    const existingLead = await LeadCampusCourse.findOne({ email: email.toLowerCase(), course });
    if (existingLead) {
      return res.status(400).json({ 
        message: 'You have already submitted an enquiry for this course. We will contact you soon.' 
      });
    }

    const lead = await LeadCampusCourse.create({
      name,
      email,
      phone,
      course,
      state,
      termsAccepted: termsAccepted === true || termsAccepted === 'true'
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Enquiry submitted successfully. We will contact you soon.', 
      leadId: lead._id
    });
  } catch (err) {
    console.error('Lead Submission Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/campuscourses/leads - Get all leads (Admin only)
router.get('/leads', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const leads = await LeadCampusCourse.find().sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true, 
      count: leads.length, 
      leads 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/campuscourses/:id - Get single campus course
router.get('/:id', async (req, res) => {
  try {
    const course = await CampusCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Campus course not found' });
    }
    return res.status(200).json({ success: true, course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/campuscourses/updateCampus/:id - Update campus course (Admin only)
router.patch(
  '/updateCampus/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const course = await CampusCourse.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!course) {
        return res.status(404).json({ message: 'Campus course not found' });
      }
      return res.status(200).json({ 
        success: true, 
        message: 'Campus course updated successfully', 
        course 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/campuscourses/deleteCampus/:id - Delete campus course (Admin only)
router.delete(
  '/deleteCampus/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const course = await CampusCourse.findByIdAndDelete(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Campus course not found' });
      }
      return res.status(200).json({ 
        success: true, 
        message: 'Campus course deleted successfully' 
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/campuscourses/leads/:id - Delete a lead (Admin only)
router.delete('/leads/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const lead = await LeadCampusCourse.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    return res.status(200).json({ 
      success: true, 
      message: 'Lead deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
