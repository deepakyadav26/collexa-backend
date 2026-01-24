const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const USER_ROLES = ['student', 'employer', 'company'];

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
    // Company Registration Fields
    companyDetails: {
      companyName: { type: String, trim: true },
      companyType: { type: String, trim: true },
      registrationNumber: { type: String, trim: true },
      incorporationDate: { type: Date },
      industry: { type: String, trim: true },
      companyEmail: { type: String, trim: true },
      companyPhone: { type: String, trim: true },
      registeredAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      termsAccepted: { type: Boolean, default: false }
    },
    // basic profile fields (can be expanded later)
    profile: {
      headline: { type: String, trim: true },
      bio: { type: String, trim: true },
      skills: [{ type: String, trim: true }],
      resumeUrl: { type: String, trim: true },
      profilePicture: { 
        type: String, 
        default: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' 
      },
      website: { type: String, trim: true },
      location: { type: String, trim: true },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
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

