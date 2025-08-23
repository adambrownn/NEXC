const mongoose = require("mongoose");
const modelRegistry = require('../modelRegistry');

const centerSchema = mongoose.Schema({
  title: { type: String, required: [true, "Center Name is required"] },
  address: { type: String, required: [true, "Center Address is required"] },
  postcode: { type: String, required: [true, "Center post code is required"] },
  direction: String,
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Coordinates must be valid [longitude, latitude] pairs'
      }
    }
  },
  createdAt: { type: Date, default: Date.now },
});

// Create a 2dsphere index on geoLocation
centerSchema.index({ geoLocation: '2dsphere' });

// Register schema with the registry
modelRegistry.registerSchema("centers", centerSchema);

// Export the schema for reference
module.exports = centerSchema;
