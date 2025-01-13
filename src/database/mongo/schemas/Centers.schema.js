const mongoose = require("mongoose");

const centerSchema = mongoose.Schema({
  title: { type: String, required: [true, "Center Name is required"] },
  address: { type: String, required: [true, "Center Address is required"] },
  postcode: { type: String, required: [true, "Center post code is required"] },
  direction: String,
  geoLocation: { type: { type: String }, coordinates: [] },
  createdAt: { type: Date, default: Date.now },
});

const Center = mongoose.model("centers", centerSchema);
module.exports = Center;
