const mongoose = require("mongoose");
const modelRegistry = require('../modelRegistry');

const cardsSchema = mongoose.Schema({
  title: { type: String, required: [true, "Card Name is required"] },
  price: { type: Number },
  tradeId: [{
    type: mongoose.Schema.Types.ObjectId,
    // required: [true, "At least one Trade Id is required."],
    ref: "trades",
  }],
  image: { type: String },
  // cscs, skill, cisrs
  category: { type: String, required: [true, "Card Category is required"] },
  color: { type: String, required: [true, "Card color is required"] },
  validity: { type: String, required: [true, "Card validity is required"] },
  description: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add a pre-save middleware to update the 'updatedAt' field
cardsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Register schema with the registry instead of creating model directly
modelRegistry.registerSchema("cards", cardsSchema);

// Export the schema for reference
module.exports = cardsSchema;