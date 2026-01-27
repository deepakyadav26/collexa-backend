const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    // companyName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'hybrid', 'contract', 'on-site'],
      default: 'full-time',
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    skillsRequired: [{ type: String, trim: true }],
    openings: { type: Number, default: 1 },
    experienceLevel: { type: String, trim: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
