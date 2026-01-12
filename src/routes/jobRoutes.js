const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const { validateJobOrInternship } = require('../utils/validation');

const router = express.Router();

// POST /api/jobs/addjob - create job (employer only)
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
      const job = await Job.create({
        ...data,
        employer: req.user._id,
      });
      return res.status(201).json({ message: 'Job created', job });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/jobs/listingjob - list all active jobs (both roles can view)
router.get('/listingjob', protect, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'employer') {
      // employer can see their own jobs (active + inactive) if needed;
      // but requirement says listing; we show all active for now
    }
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/jobdetails/:id - get single job
router.get('/jobdetails/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.status(200).json({ job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/jobs/updatejob/:id - update job (employer owner only)
router.patch(
  '/updatejob/:id',
  protect,
  authorizeRoles('employer'),
  async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        employer: req.user._id,
      });
      if (!job) {
        return res
          .status(404)
          .json({ message: 'Job not found or not authorized' });
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

// DELETE /api/jobs/deletejob/:id - delete job (employer owner only)
router.delete(
  '/deletejob/:id',
  protect,
  authorizeRoles('employer'),
  async (req, res) => {
    try {
      const job = await Job.findOneAndDelete({
        _id: req.params.id,
        employer: req.user._id,
      });
      if (!job) {
        return res
          .status(404)
          .json({ message: 'Job not found or not authorized' });
      }

      return res.status(200).json({ message: 'Job deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

