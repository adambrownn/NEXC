const mongoose = require("mongoose");

const faqSchema = mongoose.Schema({
  title: { type: String, required: [true, "FAQ title is required."] },
  description: {
    type: String,
    required: [true, "FAQ answer/solution is required."],
  },
  category: { type: String, required: [true, "Type of FAQ is required."] },
  createdAt: { type: Date, default: Date.now },
});

const FAQ = mongoose.model("faqs", faqSchema);
module.exports = FAQ;
