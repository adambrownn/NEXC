const mongoose = require("mongoose");

const itemsSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: { type: String },
  type: { type: String },
  trade: {
    _id: { type: String },
    title: { type: String },
  },
  validity: { type: String },
  newRenew: { type: String, default: "new" },
  // for tests only
  citbTestId: { type: String },
  testDate: { type: String },
  testTime: { type: String },
  voiceover: { type: String },
  testModule: { type: Array },
  quantity: { type: Number },
  price: { type: Number, required: true },
});

const ordersSchema = mongoose.Schema({
  customer: {
    _id: { type: String },
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    zipcode: { type: String },
    dob: { type: String },
    NINumber: { type: String },
  },

  // payment
  // 0-not-initiated, 1-pending, 2-paid, 3-cancelled, 4=tried, 5=refund, 6=follow ups
  paymentStatus: { type: Number, default: 0 },
  paymentMethod: { type: String },
  paymentSummary: { type: Object }, // opayo
  cardInfo: { type: Object },

  // 0- in Cart, 2-left on checkout, 3- payment pending,
  // 4- paid, 5- cancelled 6- tried

  orderCheckPoint: { type: Number, default: 0 },

  // items details
  items: [{ type: itemsSchema }],
  testCenter: { type: Object },

  itemsTotal: { type: Number },
  grandTotalToPay: { type: Number },
  grandTotalPaid: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Orders = mongoose.model("orders", ordersSchema);
module.exports = Orders;
