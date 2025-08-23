const mongoose = require("mongoose");
const modelRegistry = require('../modelRegistry');

const tradeSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Trade title is required"],
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

// Update timestamps before saving
tradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Register schema with the registry
modelRegistry.registerSchema("trades", tradeSchema);

// Export the schema for reference
module.exports = tradeSchema;