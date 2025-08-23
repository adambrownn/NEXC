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
    enum: ['draft', 'published'],
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add publishedAt field when status changes to published
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published') {
    this.publishedAt = Date.now();
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
