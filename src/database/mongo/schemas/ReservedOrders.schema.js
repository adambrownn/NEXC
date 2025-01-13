const mongoose = require("mongoose");

const reservedOrdersSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  dob: { type: Date },
  address: { type: String },
  NINumber: { type: String },
  cardid: { type: String },
  // 0=Details Capture Complete
  // 1=Details Capture Inomplete
  // 2=Documents Pending
  // 3=Order Placed.
  // 4=Confirmation Sent
  // 5=Application Under Process
  // 6=Order Complete.
  // 7=Refunded
  // 8=Follow up
  orderCheckPoint: { type: Number, default: 0 },
  citbtestid: { type: String },
  zipcode: { type: String },
  products: { type: String },
  grandTotal: { type: Number },
  payStatus: { type: Boolean, default: false }, // paid/unpaid
  createdAt: { type: Date, default: Date.now },
});

const ReservedOrder = mongoose.model("reservedOrders", reservedOrdersSchema);
module.exports = ReservedOrder;
