const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ContactUs = require('../models/ContactUs');
const { validateContactUs } = require('../utils/validation');

const router = express.Router();

// POST /api/contactus - Submit a new contact us form (Public)
router.post('/', async (req, res) => {
  // Validate request data
  const errors = validateContactUs(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const { fullName, email, phoneNumber, subject, message } = req.body;
    
    const contact = await ContactUs.create({
      fullName,
      email,
      phoneNumber,
      subject,
      message
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Your message has been sent successfully. We will contact you soon.', 
      contactId: contact._id 
    });
  } catch (err) {
    console.error('Contact Us Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/contactus - Get all contact messages (Admin only)
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const contacts = await ContactUs.find().sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true, 
      count: contacts.length, 
      contacts 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/contactus/:id - Delete a contact message (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const contact = await ContactUs.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }
    return res.status(200).json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
