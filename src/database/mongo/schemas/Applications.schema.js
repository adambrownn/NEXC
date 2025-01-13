const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String, required: true },
  address: { type: String },
  company: { type: String },
  subject: { type: String },
  message: { type: String },

  appliedFor: { type: String },
  // qualification, groupbooking, contactus
  applicationType: { type: String, required: true },

  // admin actions
  // 0=> unresolved 1=>resolved 2=> rejected
  checkoutPoint: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

const Application = mongoose.model("applications", applicationSchema);
module.exports = Application;
