const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const USER_ROLES = ['student', 'employer'];

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    emailId: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v + '', 'any', { strictMode: false });
        },
        message: 'Please provide a valid phone number',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
    },
    jobType: {
      type: String,
      enum: ['internship', 'job'],
      default: 'job',
    },
    // basic profile fields (can be expanded later)
    profile: {
      headline: { type: String, trim: true },
      bio: { type: String, trim: true },
      skills: [{ type: String, trim: true }],
      resumeUrl: { type: String, trim: true },
      companyName: { type: String, trim: true }, // for employer
      website: { type: String, trim: true },
      location: { type: String, trim: true },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.USER_ROLES = USER_ROLES;

