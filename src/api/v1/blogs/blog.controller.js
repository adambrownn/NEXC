const express = require('express');
const router = express.Router();
const modelRegistry = require('../../../database/mongo/modelRegistry');
const { catchAsync } = require('../../../../src/utils/catchAsync');
const AppError = require('../../../../src/utils/AppError');

// Get Blog model from registry
const getBlogModel = () => modelRegistry.getModel('blogs');
const getMediaModel = () => modelRegistry.getModel('media');

// Helper function to extract media IDs from blog content
const extractMediaIds = (blog) => {
  const mediaIds = new Set();
  
  // Extract from coverImage URL
  if (blog.coverImage) {
    const coverMatch = blog.coverImage.match(/\/media\/([a-f0-9]{24})/);
    if (coverMatch) mediaIds.add(coverMatch[1]);
  }
  
  // Extract from content (img src attributes)
  if (blog.content) {
    const imgRegex = /<img[^>]+src="[^"]*\/media\/([a-f0-9]{24})[^"]*"/g;
    let match;
    while ((match = imgRegex.exec(blog.content)) !== null) {
      mediaIds.add(match[1]);
    }
  }
  
  return Array.from(mediaIds);
};

// Helper function to update media usage tracking
const updateMediaUsage = async (mediaIds, blogId, blogTitle) => {
  if (!mediaIds || mediaIds.length === 0) return;
  
  try {
    const Media = getMediaModel();
    
    // Update each media file with usage info
    await Promise.all(mediaIds.map(async (mediaId) => {
      await Media.findByIdAndUpdate(mediaId, {
        $addToSet: {
          usage: {
            type: 'blog',
            referenceId: blogId,
            usedAt: new Date()
          }
        },
        lastAccessed: new Date()
      });
    }));
    
    console.log(`[Blog] Updated media usage for blog ${blogId}: ${mediaIds.length} media files`);
  } catch (error) {
    console.error('[Blog] Failed to update media usage:', error);
  }
};

// Helper function to remove media usage tracking
const removeMediaUsage = async (blogId) => {
  try {
    const Media = getMediaModel();
    
    // Remove this blog's usage from all media files
    await Media.updateMany(
      { 'usage.referenceId': blogId },
      { $pull: { usage: { referenceId: blogId } } }
    );
    
    console.log(`[Blog] Removed media usage for deleted blog ${blogId}`);
  } catch (error) {
    console.error('[Blog] Failed to remove media usage:', error);
  }
};

// List all blogs with pagination and filters
router.get('/', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.categories = req.query.category;
  if (req.query.tag) query.tags = req.query.tag;

  const Blog = getBlogModel();
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

// Get scheduled posts for calendar (must be before /:id)
router.get('/calendar', catchAsync(async (req, res) => {
  const { start, end } = req.query;
  
  if (!start || !end) {
    return res.status(400).json({
      status: 'error',
      message: 'Start and end dates are required'
    });
  }

  const query = {
    $or: [
      { scheduledAt: { $gte: new Date(start), $lte: new Date(end) } },
      { publishedAt: { $gte: new Date(start), $lte: new Date(end) } }
    ]
  };

  const Blog = getBlogModel();
  const blogs = await Blog.find(query)
    .select('title status scheduledAt publishedAt author.name author.avatar workflow.currentStage excerpt categories')
    .sort({ scheduledAt: 1, publishedAt: 1 });

  res.status(200).json({
    status: 'success',
    data: blogs
  });
}));

// Get blog by slug (must be before /:id)
router.get('/slug/:slug', catchAsync(async (req, res, next) => {
  const Blog = getBlogModel();
  const blog = await Blog.findOne({ slug: req.params.slug })
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

// Get single blog
router.get('/:id', catchAsync(async (req, res, next) => {
  const Blog = getBlogModel();
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
  const Blog = getBlogModel();
  const blog = await Blog.create({
    ...req.body,
    author: {
      id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar
    }
  });

  // Track media usage in background (non-blocking)
  const mediaIds = extractMediaIds(blog);
  if (mediaIds.length > 0) {
    updateMediaUsage(mediaIds, blog._id, blog.title).catch(console.error);
  }

  res.status(201).json({
    status: 'success',
    data: blog
  });
}));

// Update blog
router.put('/:id', catchAsync(async (req, res, next) => {
  const Blog = getBlogModel();
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

  // Update media usage tracking (non-blocking)
  const mediaIds = extractMediaIds(blog);
  if (mediaIds.length > 0) {
    // First remove old usage, then add new
    removeMediaUsage(blog._id)
      .then(() => updateMediaUsage(mediaIds, blog._id, blog.title))
      .catch(console.error);
  }

  res.status(200).json({
    status: 'success',
    data: blog
  });
}));

// Delete blog
router.delete('/:id', catchAsync(async (req, res, next) => {
  const Blog = getBlogModel();
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Check if user is the author
  if (blog.author.id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this blog', 403));
  }

  await blog.remove();

  // Clean up media usage tracking (non-blocking)
  removeMediaUsage(blog._id).catch(console.error);

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

// Publish/unpublish blog
router.patch('/:id/publish', catchAsync(async (req, res, next) => {
  const Blog = getBlogModel();
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

// Generate SEO suggestions
router.post('/:id/seo-analyze', catchAsync(async (req, res, next) => {
  const Blog = getBlogModel();
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // SEO Analysis Algorithm
  const analysis = {
    score: 0,
    issues: [],
    suggestions: [],
    keywords: []
  };

  // Title analysis
  if (blog.seo?.metaTitle) {
    if (blog.seo.metaTitle.length >= 30 && blog.seo.metaTitle.length <= 60) {
      analysis.score += 20;
    } else {
      analysis.issues.push('Meta title length should be 30-60 characters');
    }
  } else {
    analysis.issues.push('Meta title is missing');
  }

  // Description analysis
  if (blog.seo?.metaDescription) {
    if (blog.seo.metaDescription.length >= 120 && blog.seo.metaDescription.length <= 160) {
      analysis.score += 20;
    } else {
      analysis.issues.push('Meta description length should be 120-160 characters');
    }
  } else {
    analysis.issues.push('Meta description is missing');
  }

  // Content analysis
  if (blog.content) {
    const wordCount = blog.content.split(/\s+/).length;
    if (wordCount >= 300) {
      analysis.score += 30;
    } else {
      analysis.issues.push(`Content is too short (${wordCount} words, recommended: 300+)`);
    }

    // Extract potential keywords from content
    const words = blog.content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    analysis.keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // SEO completeness
  if (blog.seo?.keywords?.length > 0) analysis.score += 10;
  if (blog.seo?.ogTitle && blog.seo?.ogDescription) analysis.score += 10;
  if (blog.seo?.canonicalUrl) analysis.score += 10;

  // Generate suggestions
  if (analysis.score < 80) {
    analysis.suggestions.push('Complete all SEO metadata fields');
    analysis.suggestions.push('Ensure meta title and description are within recommended lengths');
    analysis.suggestions.push('Add relevant keywords');
    analysis.suggestions.push('Include Open Graph metadata for social sharing');
  }

  res.status(200).json({
    status: 'success',
    data: analysis
  });
}));

// Schedule blog post
router.patch('/:id/schedule', catchAsync(async (req, res, next) => {
  const { scheduledAt, schedulingSettings } = req.body;
  
  const Blog = getBlogModel();
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Check if user is the author or has scheduling permissions
  if (blog.author.id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to schedule this blog', 403));
  }

  // Validate scheduled date
  if (new Date(scheduledAt) <= new Date()) {
    return next(new AppError('Scheduled date must be in the future', 400));
  }

  blog.scheduledAt = scheduledAt;
  blog.status = 'scheduled';
  blog.schedulingSettings = { ...blog.schedulingSettings, ...schedulingSettings };
  
  // Add workflow history
  blog.workflow.history.push({
    action: 'Scheduled for publication',
    performedBy: req.user._id,
    details: `Scheduled for ${new Date(scheduledAt).toLocaleString()}`
  });

  await blog.save();

  res.status(200).json({
    status: 'success',
    data: blog
  });
}));

// Process scheduled posts (for cron job)
router.post('/process-scheduled', catchAsync(async (req, res) => {
  const now = new Date();
  
  // Find posts that should be published
  const scheduledPosts = await Blog.find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
    'schedulingSettings.autoPublish': true
  });

  const publishedPosts = [];
  
  for (const post of scheduledPosts) {
    post.status = 'published';
    post.publishedAt = now;
    
    // Add workflow history
    post.workflow.history.push({
      action: 'Auto-published',
      performedBy: post.author.id,
      details: 'Automatically published via scheduler'
    });
    
    await post.save();
    publishedPosts.push(post);
  }

  res.status(200).json({
    status: 'success',
    message: `Published ${publishedPosts.length} scheduled posts`,
    data: publishedPosts
  });
}));

// Update workflow
router.patch('/:id/workflow', catchAsync(async (req, res, next) => {
  const { stage, assignedTo, note } = req.body;
  
  const Blog = getBlogModel();
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  // Update workflow
  if (stage) blog.workflow.currentStage = stage;
  if (assignedTo) blog.workflow.assignedTo = assignedTo;
  
  // Add review note
  if (note) {
    blog.workflow.reviewNotes.push({
      author: req.user._id,
      note,
      timestamp: new Date()
    });
  }

  // Add workflow history
  blog.workflow.history.push({
    action: `Workflow updated to ${stage || 'current stage'}`,
    performedBy: req.user._id,
    details: note || 'Workflow stage updated'
  });

  await blog.save();

  res.status(200).json({
    status: 'success',
    data: blog
  });
}));

module.exports = router;
