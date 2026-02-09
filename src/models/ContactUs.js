const mongoose = require('mongoose');
const validator = require('validator');

const contactUsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
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
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    subject: {
      type: String,
      // required: [true, 'Subject is required'],
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      // required: [true, 'Message is required'],
      trim: true,
      maxlength: 150,
    },
    // Status to track if the lead has been contacted/resolved (optional but good for admin)
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Resolved'],
      default: 'New',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactUs', contactUsSchema);
