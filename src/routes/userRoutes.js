const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateProfile } = require('../utils/validation');

const router = express.Router();

// GET /api/userprofile - get current user profile
router.get('/', protect, async (req, res) => {
  return res.status(200).json({ user: req.user });
});

// POST /api/userprofile - create or overwrite profile (after registration)
router.post('/', protect, async (req, res) => {
    // Validate request data
    const errors = validateProfile(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const currentProfile = req.user.profile || {};
      const newProfile = { ...req.body };

      // Preserve profilePicture if not provided
      if (!newProfile.profilePicture && currentProfile.profilePicture) {
        newProfile.profilePicture = currentProfile.profilePicture;
      }
      
      req.user.profile = newProfile;
      console.log(req.user.profile);
      await req.user.save();
      return res.status(201).json({ message: 'Profile created', profile: req.user.profile });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// PATCH /api/userprofile - update profile
router.patch('/', protect, async (req, res) => {
    // Validate request data
    const errors = validateProfile(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const currentProfile = req.user.profile || {};
      const updates = req.body;
      
      req.user.profile = { ...currentProfile, ...updates };

      // Allow removing of other fields, but if profilePicture is removed, it might default? 
      // Actually PATCH implies updating only what's sent. Code below uses spread which works.
      // But let's be explicit about keeping existing picture if not sent.
      if (!updates.profilePicture && currentProfile.profilePicture) {
         req.user.profile.profilePicture = currentProfile.profilePicture;
      }
      await req.user.save(); 
      return res.status(200).json({ message: 'Profile updated', profile: req.user.profile });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/userprofile - delete user (soft delete could be added later)
router.delete('/', protect, async (req, res) => {
  try {
    await req.user.deleteOne();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;