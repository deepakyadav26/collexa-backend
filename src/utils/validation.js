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

  if (data.profilePicture !== undefined && typeof data.profilePicture !== 'string') {
    errors.push({
      field: 'profilePicture',
      message: 'Profile picture must be a string',
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
  // if (!data.companyName || typeof data.companyName !== 'string' || !data.companyName.trim()) {
  //   errors.push({
  //     field: 'companyName',
  //     message: 'Company name is required',
  //   });
  // }

  // Location validation
  if (!data.location || typeof data.location !== 'string' || !data.location.trim()) {
    errors.push({
      field: 'location',
      message: 'Location is required',
    });
  }

  return errors;
};

/**
 * Validates company registration data
 * @param {Object} data - Company registration data
 * @returns {Array} Array of error objects
 */
const validateCompanyRegister = (data) => {
  const errors = [];
  const { 
    company_name, 
    registration_number, 
    company_email, 
    owner_full_name, 
    owner_email, 
    password, 
    terms_accepted 
  } = data;

  if (!company_name || !company_name.trim()) {
    errors.push({ field: 'company_name', message: 'Company name is required' });
  }

  if (!registration_number || !registration_number.trim()) {
    errors.push({ field: 'registration_number', message: 'Registration number is required' });
  }

  if (!company_email || !validator.isEmail(company_email)) {
    errors.push({ field: 'company_email', message: 'A valid company email is required' });
  }

  if (!owner_full_name || !owner_full_name.trim()) {
    errors.push({ field: 'owner_full_name', message: 'Owner full name is required' });
  }

  if (!owner_email || !validator.isEmail(owner_email)) {
    errors.push({ field: 'owner_email', message: 'A valid owner email is required' });
  }

  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (!terms_accepted) {
    errors.push({ field: 'terms_accepted', message: 'You must accept the terms and conditions' });
  }

  return errors;
};

/**
 * Validates blog data
 * @param {Object} data - Blog data
 * @returns {Array} Array of error objects
 */
const validateBlog = (data) => {
  const errors = [];
  const { title, content, excerpt, category } = data;

  if (!title || !title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!content || !content.trim()) {
    errors.push({ field: 'content', message: 'Content is required' });
  }

  if (!excerpt || !excerpt.trim()) {
    errors.push({ field: 'excerpt', message: 'Excerpt is required' });
  }

  if (!category || !category.trim()) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  return errors;
};

/**
 * Validates campus course data
 * @param {Object} data - Campus course data
 * @returns {Array} Array of error objects
 */
const validateCampusCourse = (data) => {
  const errors = [];
  const { 
    universityName, 
    courseName, 
    degreeType, 
    description, 
    duration, 
    level, 
    location 
  } = data;

  if (!universityName || !universityName.trim()) {
    errors.push({ field: 'universityName', message: 'University name is required' });
  }

  if (!courseName || !courseName.trim()) {
    errors.push({ field: 'courseName', message: 'Course name is required' });
  }

  if (!degreeType || !degreeType.trim()) {
    errors.push({ field: 'degreeType', message: 'Degree type is required' });
  }

  if (!description || !description.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (!duration || !duration.trim()) {
    errors.push({ field: 'duration', message: 'Duration is required' });
  }

  if (!level || !level.trim()) {
    errors.push({ field: 'level', message: 'Course level is required' });
  }

  if (!location || !location.trim()) {
    errors.push({ field: 'location', message: 'Location is required' });
  }

  return errors;
};


const validateCampusCourseLead = (data) => {
  const errors = [];
  const { name, email, phone, course, state, termsAccepted } = data;

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validator.isEmail(email.trim())) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  }

  if (!course || typeof course !== 'string' || !course.trim()) {
    errors.push({ field: 'course', message: 'Course is required' });
  }

  if (!state || typeof state !== 'string' || !state.trim()) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  // Validate Terms
  if (!termsAccepted || (typeof termsAccepted === 'string' && termsAccepted !== 'true') || termsAccepted === false) {
    errors.push({ field: 'termsAccepted', message: 'You must accept the terms and conditions' });
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateEmail,
  validateProfile,
  validateJobOrInternship,
  validateCompanyRegister,
  validateBlog,
  validateCampusCourse,
  validateCampusCourseLead,
  validator, // Export validator for custom validations
};