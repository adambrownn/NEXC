const mongoose = require("mongoose");
const modelRegistry = require('../modelRegistry');

const courseSchema = mongoose.Schema({
  title: { type: String, required: [true, "Course Name is required"] },
  price: { type: Number, required: true, min: 0 },
  thumbnail: { type: String }, // Course thumbnail image URL from Media system
  tradeId: {
    type: String,
    // required: [true, "Trade Id is required."],
    ref: "trades",
  },
  category: { type: String, required: [true, "Course Category is required"] },
  validity: { type: String, required: [true, "Course validity is required"] },
  duration: { type: String, required: [true, "Course duration is required"] },
  isOnline: { type: Boolean, default: false },
  description: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.index({ title: 'text', description: 'text', category: 'text' });

courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Register schema with the registry instead of creating model directly
modelRegistry.registerSchema("courses", courseSchema);

// Export the schema for reference
module.exports = courseSchema;
