const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Internship = require('../models/Internship');
const { validateJobOrInternship } = require('../utils/validation');

const router = express.Router();

// POST /api/internship/addinternship - create internship (Admin only)
router.post(
  '/addinternship',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    // Validate request data
    const errors = validateJobOrInternship(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const data = req.body;
      if (!data.company) {
        return res.status(400).json({ message: 'Company ID is required' });
      }

      const internship = await Internship.create(data);
      await internship.populate('company');
      return res
        .status(201)
        .json({ message: 'Internship created', internship });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/internship/listinginternship - list all active internships (Publicly accessible)
router.get('/listinginternship', async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true })
      .populate('company')
      .sort({
        createdAt: -1,
      });
    return res.status(200).json({ internships });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/internship/:id - get single internship details (Publicly accessible)
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('company');
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    return res.status(200).json({ internship });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/internship/updatejob/:id - update internship (Admin only)
router.patch(
  '/updatejob/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const internship = await Internship.findById(req.params.id);
      if (!internship) {
        return res
          .status(404)
          .json({ message: 'Internship not found' });
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

// DELETE /api/internship/deletejob/:id - delete internship (Admin only)
router.delete(
  '/deletejob/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const internship = await Internship.findByIdAndDelete(req.params.id);
      if (!internship) {
        return res
          .status(404)
          .json({ message: 'Internship not found' });
      }

      return res.status(200).json({ message: 'Internship deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

