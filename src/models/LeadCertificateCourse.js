const mongoose = require('mongoose');
const validator = require('validator');

const leadCertificateCourseSchema = new mongoose.Schema(
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
    cityState: {
      type: String,
      required: [true, 'City/State is required'],
      trim: true,
    },
    // Reference to the specific course (optional but recommended)
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateCourse',
      required: false,    
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadCertificateCourse', leadCertificateCourseSchema);
