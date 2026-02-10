const mongoose = require('mongoose');

const campusCourseSchema = new mongoose.Schema(
  {
    universityName: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Engineering', 'Management', 'Technology', 'Business', 'Design', 'Arts', 'Science'],
      trim: true,
    },
    degreeType: {
      type: String,
      required: [true, 'Degree type is required'], // e.g. B.Tech
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    duration: {
      type: String, // e.g. "4 Years"
      required: [true, 'Duration is required'],
      trim: true,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    level: {
      type: String, // e.g. "Undergraduate", "Postgraduate"
      required: [true, 'Course level is required'],
      trim: true,
    },
    isTop: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CampusCourse', campusCourseSchema);
