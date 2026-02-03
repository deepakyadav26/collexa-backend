const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const CertificateCourse = require('../models/CertificateCourse');

const router = express.Router();

// @route   POST /api/certificate-courses/add
// @desc    Add a new certificate course
// @access  Private (Admin only)
router.post(
  '/add',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const {
        title,
        instructor,
        level,
        badge,
        rating,
        studentsEnrolled,
        duration,
        category,
        currentPrice,
        originalPrice,
        enrollLink,
        image
      } = req.body;

      // Basic validation handled by Mongoose, but we can add more if needed
      
      const course = await CertificateCourse.create({
        title,
        instructor,
        level,
        badge,
        rating,
        studentsEnrolled,
        duration,
        category,
        currentPrice,
        originalPrice,
        enrollLink,
        image
      });

      return res.status(201).json({
        success: true,
        message: 'Certificate course added successfully',
        course,
      });
    } catch (err) {
      console.error('Error adding certificate course:', err);
      // specific Mongoose validation error handling could be added here
      if (err.name === 'ValidationError') {
           const messages = Object.values(err.errors).map(val => val.message);
           return res.status(400).json({ message: messages.join(', ') });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/certificatecourses/listAll
// @desc    List all certificate courses
// @access  Public
router.get('/listAll', async (req, res) => {
  try {
    // Optional: Filtering/sorting could be added via query params
    const courses = await CertificateCourse.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (err) {
    console.error('Error listing certificate courses:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificatecourses/:id
// @desc    Get single certificate course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await CertificateCourse.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (err) {
    console.error('Error fetching certificate course:', err);
    if (err.kind === 'ObjectId') {
         return res.status(404).json({ message: 'Course not found' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/certificatecourses/update/:id
// @desc    Update a certificate course
// @access  Private (Admin only)
router.patch(
  '/update/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      let course = await CertificateCourse.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      course = await CertificateCourse.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Certificate course updated successfully',
        course,
      });
    } catch (err) {
      console.error('Error updating certificate course:', err);
      if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(val => val.message);
          return res.status(400).json({ message: messages.join(', ') });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/certificate-courses/delete/:id
// @desc    Delete a certificate course
// @access  Private (Admin only)
router.delete(
  '/delete/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const course = await CertificateCourse.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      await course.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'Certificate course deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting certificate course:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
