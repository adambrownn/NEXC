const mongoose = require("mongoose");
const modelRegistry = require('../modelRegistry');

const tradeServiceAssociationSchema = new mongoose.Schema({
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'trades',
    required: [true, "Trade ID is required"],
    unique: true  // Ensure only one association per trade
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'cards'
  }],
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tests'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses'
  }],
  qualifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'qualifications'
  }],
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
}, {
  collection: 'trade_service_associations' // Force the collection name
});

// Update timestamps before saving
tradeServiceAssociationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model
const TradeServiceAssociation = mongoose.model('trade-service-associations', tradeServiceAssociationSchema);

// Register model with the registry
modelRegistry.registerModel("trade-service-associations", TradeServiceAssociation);

// Export the model
module.exports = TradeServiceAssociation;