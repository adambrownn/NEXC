const mongoose = require("mongoose");

const cardsSchema = mongoose.Schema({
  title: { type: String, required: [true, "Card Name is required"] },
  price: { type: Number },
  tradeId: {
    type: String,
    required: [true, "Trade Id is required."],
    ref: "trades",
  },
  image: { type: String },
  // cscs, skill, cisrs
  category: { type: String, required: [true, "Card Category is required"] },
  color: { type: String, required: [true, "Card color is required"] },
  validity: { type: String, required: [true, "Card validity is required"] },
  description: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Card = mongoose.model("cards", cardsSchema);
module.exports = Card;
