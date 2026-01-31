const mongoose = require('mongoose');
const validator = require('validator');

const leadCampusCourseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course selection is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State selection is required'],
      trim: true,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    // Optional: Capture the ip or user agent to prevent spam if needed
    source: {
      type: String,
      default: 'website_lead_form',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadCampusCourse', leadCampusCourseSchema);
