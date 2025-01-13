const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  title: { type: String, required: [true, "Course Name is required"] },
  price: { type: Number },
  tradeId: {
    type: String,
    required: [true, "Trade Id is required."],
    ref: "trades",
  },
  category: { type: String, required: [true, "Course Category is required"] },
  validity: { type: String, required: [true, "Course validity is required"] },
  duration: { type: String, required: [true, "Course duration is required"] },
  isOnline: { type: Boolean, default: false },
  description: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model("courses", courseSchema);
module.exports = Course;
