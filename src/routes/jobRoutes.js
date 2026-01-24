const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const { validateJobOrInternship } = require('../utils/validation');

const router = express.Router();

// POST /api/jobs/addjob - create job (Admin only)
router.post(
  '/addjob',
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

      const job = await Job.create(data);
      return res.status(201).json({ message: 'Job created', job });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/jobs/listingjob - list all active jobs (Publicly accessible)
router.get('/listingjob', async (req, res) => {
  try {
    const filter = { isActive: true };
    // Populate company details
    const jobs = await Job.find(filter).populate('company').sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/jobdetails/:id - get single job
router.get('/jobdetails/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.status(200).json({ job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/jobs/updatejob/:id - update job (Admin only)
router.patch(
  '/updatejob/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res
          .status(404)
          .json({ message: 'Job not found' });
      }

      Object.assign(job, req.body);
      await job.save();

      return res.status(200).json({ message: 'Job updated', job });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/jobs/deletejob/:id - delete job (Admin only)
router.delete(
  '/deletejob/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const job = await Job.findByIdAndDelete(req.params.id);
      if (!job) {
        return res
          .status(404)
          .json({ message: 'Job not found' });
      }

      return res.status(200).json({ message: 'Job deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

