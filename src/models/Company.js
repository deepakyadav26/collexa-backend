const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    location: {
      type: String,
      required: [true, 'Company location is required'],
      trim: true,
    },
    logoUrl: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
