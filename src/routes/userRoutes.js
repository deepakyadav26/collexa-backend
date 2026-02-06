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
    // Separate root fields and profile fields
    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      emailId, 
      ...profileData 
    } = req.body;

    // Validate profile fields (subset of body)
    // We pass profileData to validateProfile to ensure we only validate profile fields
    const errors = validateProfile(profileData);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      // 1. Update Root Fields
      if (firstName) req.user.firstName = firstName.trim();
      if (lastName) req.user.lastName = lastName.trim();
      if (phoneNumber) req.user.phoneNumber = phoneNumber.trim();
      // Note: Changing emailId usually requires verification, so we skip it here unless explicitly needed.

      // 2. Update Profile Fields
      // Initialize profile if it doesn't exist
      if (!req.user.profile) {
        req.user.profile = {};
      }

      const allowedProfileFields = [
        'headline', 
        'bio', 
        'skills', 
        'resumeUrl', 
        'profilePicture', 
        'website', 
        'location'
      ];
      
      allowedProfileFields.forEach((field) => {
        // Only update if the field is present in the request
        // This allows sending 'null' to clear a field (like profilePicture), 
        // while 'undefined' (missing field) preserves the existing value.
        if (profileData[field] !== undefined) {
           req.user.profile[field] = profileData[field];
        }
      });

      await req.user.save(); 
      
      return res.status(200).json({ 
        message: 'Profile updated', 
        user: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          emailId: req.user.emailId,
          phoneNumber: req.user.phoneNumber,
          role: req.user.role,
          profile: req.user.profile
        }
      });
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