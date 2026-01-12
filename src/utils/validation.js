const validator = require('validator');

/**
 * Validates registration data
 * @param {Object} data - Registration data
 * @returns {Array} Array of error objects
 */
const validateRegister = (data) => {
  const errors = [];
  const { firstName, lastName, emailId, phoneNumber, password, role, jobType } = data;

  // First name validation
  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    errors.push({
      field: 'firstName',
      message: 'First name is required',
    });
  } else if (firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters',
    });
  }

  // Last name validation
  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    errors.push({
      field: 'lastName',
      message: 'Last name is required',
    });
  } else if (lastName.trim().length < 2) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be at least 2 characters',
    });
  }

  // Email validation
  if (!emailId || typeof emailId !== 'string' || !emailId.trim()) {
    errors.push({
      field: 'emailId',
      message: 'Valid email is required',
    });
  } else if (!validator.isEmail(emailId.trim())) {
    errors.push({
      field: 'emailId',
      message: 'Valid email is required',
    });
  }

  // Phone number validation
  if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
    errors.push({
      field: 'phoneNumber',
      message: 'Valid phone number is required',
    });
  } else if (!validator.isMobilePhone(phoneNumber.trim(), 'any', { strictMode: false })) {
    errors.push({
      field: 'phoneNumber',
      message: 'Valid phone number is required',
    });
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
  } else if (!validator.isLength(password, { min: 6 })) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters',
    });
  }

  // Role validation (optional)
  if (role && !['student', 'employer'].includes(role)) {
    errors.push({
      field: 'role',
      message: 'Role must be student or employer',
    });
  }

  // JobType validation (optional)
  if (jobType !== undefined && jobType !== null) {
    if (typeof jobType !== 'string') {
      errors.push({
        field: 'jobType',
        message: 'jobType must be a string',
      });
    } else if (!['internship', 'job'].includes(jobType)) {
      errors.push({
        field: 'jobType',
        message: 'jobType must be either "internship" or "job"',
      });
    }
  }

  return errors;
};

/**
 * Validates login data
 * @param {Object} data - Login data
 * @returns {Array} Array of error objects
 */
const validateLogin = (data) => {
  const errors = [];
  const { emailId, password } = data;

  // Email validation
  if (!emailId || typeof emailId !== 'string' || !emailId.trim()) {
    errors.push({
      field: 'emailId',
      message: 'Valid email is required',
    });
  } else if (!validator.isEmail(emailId.trim())) {
    errors.push({
      field: 'emailId',
      message: 'Valid email is required',
    });
  }

  // Password validation
  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
  }

  return errors;
};

/**
 * Validates email for password reset
 * @param {Object} data - Email data
 * @returns {Array} Array of error objects
 */
const validateEmail = (data) => {
  const errors = [];
  const { emailId } = data;

  if (!emailId || typeof emailId !== 'string' || !emailId.trim()) {
    errors.push({
      field: 'emailId',
      message: 'Valid email is required',
    });
  } else if (!validator.isEmail(emailId.trim())) {
    errors.push({
      field: 'emailId',
      message: 'Valid email is required',
    });
  }

  return errors;
};

/**
 * Validates profile data
 * @param {Object} data - Profile data
 * @returns {Array} Array of error objects
 */
const validateProfile = (data) => {
  const errors = [];

  // Validate optional fields
  if (data.headline !== undefined && typeof data.headline !== 'string') {
    errors.push({
      field: 'headline',
      message: 'Headline must be a string',
    });
  }

  if (data.bio !== undefined && typeof data.bio !== 'string') {
    errors.push({
      field: 'bio',
      message: 'Bio must be a string',
    });
  }

  if (data.skills !== undefined && !Array.isArray(data.skills)) {
    errors.push({
      field: 'skills',
      message: 'Skills must be an array',
    });
  }

  if (data.resumeUrl !== undefined && typeof data.resumeUrl !== 'string') {
    errors.push({
      field: 'resumeUrl',
      message: 'Resume URL must be a string',
    });
  }

  if (data.companyName !== undefined && typeof data.companyName !== 'string') {
    errors.push({
      field: 'companyName',
      message: 'Company name must be a string',
    });
  }

  if (data.website !== undefined && typeof data.website !== 'string') {
    errors.push({
      field: 'website',
      message: 'Website must be a string',
    });
  }

  if (data.location !== undefined && typeof data.location !== 'string') {
    errors.push({
      field: 'location',
      message: 'Location must be a string',
    });
  }

  return errors;
};

/**
 * Validates job/internship data
 * @param {Object} data - Job/Internship data
 * @returns {Array} Array of error objects
 */
const validateJobOrInternship = (data) => {
  const errors = [];

  // Title validation
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    errors.push({
      field: 'description',
      message: 'Description is required',
    });
  }

  // Company name validation
  if (!data.companyName || typeof data.companyName !== 'string' || !data.companyName.trim()) {
    errors.push({
      field: 'companyName',
      message: 'Company name is required',
    });
  }

  // Location validation
  if (!data.location || typeof data.location !== 'string' || !data.location.trim()) {
    errors.push({
      field: 'location',
      message: 'Location is required',
    });
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateEmail,
  validateProfile,
  validateJobOrInternship,
  validator, // Export validator for custom validations
};
