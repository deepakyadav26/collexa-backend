const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Internship = require('../models/Internship');
const { validateJobOrInternship } = require('../utils/validation');

const router = express.Router();

// POST /api/internship/addjob - create internship (employer only)
router.post(
  '/addjob',
  protect,
  authorizeRoles('employer'),
  async (req, res) => {
    // Validate request data
    const errors = validateJobOrInternship(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const data = req.body;
      const internship = await Internship.create({
        ...data,
        employer: req.user._id,
      });
      return res
        .status(201)
        .json({ message: 'Internship created', internship });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/internship/listingjob - list all active internships
router.get('/listingjob', protect, async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ internships });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/internship/internship/:id - internship details (aligning with your pattern)
router.get('/internship/:id', protect, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    return res.status(200).json({ internship });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/internship/updatejob/:id - update internship (employer owner only)
router.patch(
  '/updatejob/:id',
  protect,
  authorizeRoles('employer'),
  async (req, res) => {
    try {
      const internship = await Internship.findOne({
        _id: req.params.id,
        employer: req.user._id,
      });
      if (!internship) {
        return res
          .status(404)
          .json({ message: 'Internship not found or not authorized' });
      }

      Object.assign(internship, req.body);
      await internship.save();

      return res
        .status(200)
        .json({ message: 'Internship updated', internship });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/internship/deletejob/:id - delete internship (employer owner only)
router.delete(
  '/deletejob/:id',
  protect,
  authorizeRoles('employer'),
  async (req, res) => {
    try {
      const internship = await Internship.findOneAndDelete({
        _id: req.params.id,
        employer: req.user._id,
      });
      if (!internship) {
        return res
          .status(404)
          .json({ message: 'Internship not found or not authorized' });
      }

      return res.status(200).json({ message: 'Internship deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

