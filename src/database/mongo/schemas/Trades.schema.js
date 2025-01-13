const mongoose = require("mongoose");

const tradeSchema = mongoose.Schema({
  title: { type: String, required: [true, "Trade Name is required"] },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Trade = mongoose.model("trades", tradeSchema);
module.exports = Trade;
