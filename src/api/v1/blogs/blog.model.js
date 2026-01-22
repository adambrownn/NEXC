const mongoose = require('mongoose');
const modelRegistry = require('../../../database/mongo/modelRegistry');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  coverImage: {
    type: String,
    required: true
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: String
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: 60
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: 160
    },
    ogImage: {
      type: String,
      trim: true
    },
    twitterTitle: {
      type: String,
      trim: true,
      maxlength: 70
    },
    twitterDescription: {
      type: String,
      trim: true,
      maxlength: 200
    },
    twitterImage: {
      type: String,
      trim: true
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed
    },
    focusKeyword: {
      type: String,
      trim: true
    },
    seoScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  schedulingSettings: {
    autoPublish: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifyAuthor: {
      type: Boolean,
      default: true
    },
    socialAutoPost: {
      type: Boolean,
      default: false
    }
  },
  workflow: {
    currentStage: {
      type: String,
      enum: ['draft', 'review', 'approved', 'scheduled', 'published'],
      default: 'draft'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      note: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    history: [{
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug from title
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  next();
});

// Handle status changes and scheduling logic
blogSchema.pre('save', function(next) {
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  // Handle scheduled status
  if (this.isModified('status') && this.status === 'scheduled') {
    if (!this.scheduledAt) {
      return next(new Error('Scheduled date is required for scheduled posts'));
    }
    // Ensure scheduled date is in the future
    if (new Date(this.scheduledAt) <= new Date()) {
      return next(new Error('Scheduled date must be in the future'));
    }
  }

  // Update workflow stage based on status
  if (this.isModified('status')) {
    switch (this.status) {
      case 'draft':
        this.workflow.currentStage = 'draft';
        break;
      case 'scheduled':
        this.workflow.currentStage = 'scheduled';
        break;
      case 'published':
        this.workflow.currentStage = 'published';
        break;
      case 'archived':
        this.workflow.currentStage = 'published'; // Keep workflow stage as published for archived posts
        break;
    }
  }

  next();
});

// Auto-populate SEO fields if empty
blogSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('excerpt')) {
    if (!this.seo.metaTitle) {
      this.seo.metaTitle = this.title.substring(0, 60);
    }
    if (!this.seo.metaDescription) {
      this.seo.metaDescription = this.excerpt.substring(0, 160);
    }
    if (!this.seo.ogTitle) {
      this.seo.ogTitle = this.title.substring(0, 60);
    }
    if (!this.seo.ogDescription) {
      this.seo.ogDescription = this.excerpt.substring(0, 160);
    }
    if (!this.seo.twitterTitle) {
      this.seo.twitterTitle = this.title.substring(0, 70);
    }
    if (!this.seo.twitterDescription) {
      this.seo.twitterDescription = this.excerpt.substring(0, 200);
    }
  }
  next();
});

// Calculate read time based on content length (average reading speed: 200 words per minute)
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.metadata.readTime = Math.ceil(wordCount / 200);
  }
  next();
});

// Register the schema
modelRegistry.registerSchema('blogs', blogSchema);

// Export the model through the registry
module.exports = mongoose.models.blogs || mongoose.model('blogs', blogSchema);
