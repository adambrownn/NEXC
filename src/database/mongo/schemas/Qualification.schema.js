const mongoose = require('mongoose');
const modelRegistry = require('../modelRegistry');

const qualificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  validityPeriod: {
    type: Number, // in months
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field before saving
qualificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Use the model registry instead of creating the model directly
const Qualification = modelRegistry.getModel('qualifications', qualificationSchema);

module.exports = Qualification;
