const mongoose = require("mongoose");

const testSchema = mongoose.Schema({
  title: { type: String, required: [true, "Test Name is required"] },
  price: { type: Number },
  tradeId: {
    type: String,
    required: [true, "Trade Id is required."],
    ref: "trades",
  },
  category: { type: String, required: [true, "Course Category is required"] },
  validity: { type: String, required: [true, "Test validity is required"] },
  duration: { type: String, required: [true, "Test duration is required"] },
  numberOfQuestions: Number,
  description: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Test = mongoose.model("tests", testSchema);
module.exports = Test;
