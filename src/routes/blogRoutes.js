const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const { validateBlog } = require('../utils/validation');

const router = express.Router();

// @route   POST /api/blogs
// @desc    Create a new blog (Admin only)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  const errors = validateBlog(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const blog = await Blog.create(req.body);
    return res.status(201).json({ success: true, blog });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A blog with this title/slug already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs
// @desc    Get all blogs (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    return res.status(200).json({ success: true, blog });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/blogs/:id
// @desc    Update a blog (Admin only)
router.patch('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    return res.status(200).json({ success: true, blog });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
