const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Rejected', 'Hired'], 
      default: 'Applied',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    resumeUrl: {
      type: String, // Path to the uploaded file
      required: true,
    },
    coverLetter: { // Corresponds to "Why should we hire you?"
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from applying to the same job twice
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
