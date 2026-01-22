const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt/summary is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    author: {
      type: String,
      default: 'Collexa Editorial',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Career Advice',
        'Interview Tips',
        'Success Stories',
        'Product Updates',
        'Industry Trends',
        'Internship Guide',
      ],
      default: 'Career Advice',
    },
    tags: [{ type: String, trim: true }],
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/800x400',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create slug from title before saving
blogSchema.pre('validate', function (next) {
  if (this.title) {
    this.slug = this.title
      .split(' ')
      .join('-')
      .toLowerCase()
      .replace(/[^\w-]+/g, '');
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
