const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// GET /api/admin/users - List all registered users with Search & Filter (Admin only)
router.get('/users', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    // Role filtering
    if (role && role !== 'all') {
      query.role = role;
    }

    // Search functionality (Name or Email)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { emailId: { $regex: search, $options: 'i' } },
        { "companyDetails.companyName": { $regex: search, $options: 'i' } }
      ];
    }

    // Sort by latest (createdAt: -1)
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      count: users.length, 
      users 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id - View single user details (Admin only)
router.get('/users/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user active status (Admin only)
router.patch('/users/:id/status', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id - Delete a user by ID (Admin only)
router.delete('/users/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
