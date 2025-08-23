const express = require('express');
const router = express.Router();
const Blog = require('./blog.model');
const { catchAsync } = require('../../../../src/utils/catchAsync');
const AppError = require('../../../../src/utils/AppError');

// List all blogs with pagination and filters
router.get('/', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.categories = req.query.category;
  if (req.query.tag) query.tags = req.query.tag;

  const blogs = await Blog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author.id', 'name avatar');

  const total = await Blog.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: blogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get single blog
router.get('/:id', catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author.id', 'name avatar');

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Increment view count
  blog.metadata.views += 1;
  await blog.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: blog
  });
}));

// Create blog
router.post('/', catchAsync(async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    author: {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar
    }
  });

  res.status(201).json({
    status: 'success',
    data: blog
  });
}));

// Update blog
router.put('/:id', catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Check if user is the author
  if (blog.author.id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this blog', 403));
  }

  Object.assign(blog, req.body);
  await blog.save();

  res.status(200).json({
    status: 'success',
    data: blog
  });
}));

// Delete blog
router.delete('/:id', catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Check if user is the author
  if (blog.author.id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this blog', 403));
  }

  await blog.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// Publish/unpublish blog
router.patch('/:id/publish', catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Check if user is the author
  if (blog.author.id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to modify this blog', 403));
  }

  blog.status = blog.status === 'draft' ? 'published' : 'draft';
  await blog.save();

  res.status(200).json({
    status: 'success',
    data: blog
  });
}));

module.exports = router;
