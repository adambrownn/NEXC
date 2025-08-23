const mongoose = require("mongoose");

const notificationPreferencesSchema = mongoose.Schema({
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  sms: { type: Boolean, default: true },
  serviceUpdates: { type: Boolean, default: true },
  promotions: { type: Boolean, default: false },
  securityAlerts: { type: Boolean, default: true }
});

const userSchema = mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
  },
  password: {
    type: String,
    default: "",
  },
  socialIdentityProvider: {
    type: String, // 'google' or 'email' or 'phonenumber' or "visitor"
    default: "",
  },
  phoneNumber: {
    type: String,  // Changed from Number to String
  },
  isLocked: { type: Boolean, default: false }, // banned users
  name: { type: String, required: true },
  profileImage: { type: String, default: "" },
  geoLocation: { type: { type: String }, coordinates: [] },
  address: { type: String },
  accountType: {
    type: String,
    default: "user",
    valid: ["superadmin", "admin", "user", "visitor"],
  },
  notificationPreferences: {
    type: notificationPreferencesSchema,
    default: {
      email: true,
      push: true,
      sms: true,
      serviceUpdates: true,
      promotions: false,  // Note: "promotions" not "promotional"
      securityAlerts: true
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("users", userSchema);
module.exports = User;
