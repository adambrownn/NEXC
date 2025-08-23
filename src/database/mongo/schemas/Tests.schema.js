const mongoose = require("mongoose");
const modelRegistry = require('../modelRegistry');

const testSchema = mongoose.Schema({
  title: { type: String, required: [true, "Test Name is required"] },
  price: { type: Number, required: true, min: 0 },
  tradeId: {
    type: String,
    // required: [true, "Trade Id is required."],
    ref: "trades",
  },
  category: { type: String, required: [true, "Course Category is required"] },
  validity: { type: String, required: [true, "Test validity is required"] },
  duration: { type: String, required: [true, "Test duration is required"] },
  numberOfQuestions: Number,
  description: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

testSchema.index({ title: 'text', description: 'text', category: 'text' });

// Update the updatedAt field on each save
testSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Register schema with the registry instead of creating model directly
modelRegistry.registerSchema("tests", testSchema);

// Export the schema for reference
module.exports = testSchema;
