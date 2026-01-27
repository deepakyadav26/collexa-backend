const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    // companyName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    stipendMin: { type: Number },
    stipendMax: { type: Number },
    duration: { type: String, trim: true }, // e.g. "3 months"
    startDate: { type: Date },
    skillsRequired: [{ type: String, trim: true }],
    openings: { type: Number, default: 1 },
    mode: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);

