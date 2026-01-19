const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Company = require('../models/Company');

const router = express.Router();

// POST /api/companies - Create a new company (Admin only)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const company = await Company.create(req.body);
    return res.status(201).json({ success: true, company });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Company name already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies - List all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    return res.status(200).json({ success: true, companies });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies/:id - Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    return res.status(200).json({ success: true, company });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/companies/:id - Update company (Admin only)
router.patch('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    return res.status(200).json({ success: true, company });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/companies/:id - Delete company (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    return res.status(200).json({ success: true, message: 'Company deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
