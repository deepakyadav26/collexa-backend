const mongoose = require('mongoose');
const validator = require('validator');

const certificateCourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      trim: true,
    },
    badge: {
      type: String,
      trim: true,
      default: '', 
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'], // e.g., "6 weeks"
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
    },
    currency: {
      type: String,
      default: '₹', // Symbol or INR
      trim: true,
    },
    enrollLink: {
      type: String,
      trim: true,
      // Optional validation if they want strict URLs, but keeping it flexible is often better for relative paths or deep links
      // validate: [validator.isURL, 'Please provide a valid URL']
    },
    image: {
        type: String,
        trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CertificateCourse', certificateCourseSchema);
