const mongoose = require("mongoose");

const qualificationSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Qualification title is required."],
  },
  price: { type: Number },
  tradeId: {
    type: String,
    required: [true, "Trade Id is required."],
    ref: "trades",
  },
  level: {
    type: Number,
  },
  description: {
    type: String,
    required: [true, "description is required."],
  },
  category: {
    type: String,
    required: [true, "qualification category is required"],
  },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Qualification = mongoose.model("qualifications", qualificationSchema);
module.exports = Qualification;
