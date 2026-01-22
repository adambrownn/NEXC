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
    required: function() {
      // Email required unless it's a phone-only registration
      return this.socialIdentityProvider !== 'phone';
    }
  },
  password: {
    type: String,
    default: "",
    required: function() {
      // Password required for email and phone registrations, not for social logins
      return ['email', 'phone', ''].includes(this.socialIdentityProvider);
    }
  },
  socialIdentityProvider: {
    type: String, // 'google' or 'email' or 'phone' or "visitor" or ""
    default: "email", // Default to email for backward compatibility
  },
  phoneNumber: {
    type: String,  // Changed from Number to String
  },
  isLocked: { type: Boolean, default: false }, // banned users
  name: { type: String, required: true },
  profileImage: { type: String, default: "" },
  profileAvatar: { type: String, default: "avatar-1" }, // Color scheme for generated avatars
  geoLocation: { type: { type: String }, coordinates: [] },
  address: { type: String },
  accountType: {
    type: String,
    default: "user",
    enum: ["superadmin", "admin", "manager", "supervisor", "staff", "user", "visitor"], // Added role hierarchy
  },
  
  // Add role field for more granular permissions
  role: {
    type: String,
    default: function() {
      // Map accountType to role for backward compatibility
      const roleMap = {
        'superadmin': 'admin',
        'admin': 'admin', 
        'manager': 'manager',
        'supervisor': 'supervisor',
        'staff': 'staff',
        'user': 'user',
        'visitor': 'user'
      };
      return roleMap[this.accountType] || 'user';
    }
  },
  
  // Add additional profile fields for dashboard display
  displayName: {
    type: String,
    default: function() {
      return this.name;
    }
  },
  company: { type: String },
  department: { type: String },
  
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
  
  // Password reset OTP fields
  passwordResetOTP: { type: String },
  passwordResetOTPExpires: { type: Date },
  
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Add pre-save middleware to sync role with accountType
userSchema.pre('save', function(next) {
  // Sync role with accountType if role is not explicitly set
  if (this.isModified('accountType') && !this.isModified('role')) {
    const roleMap = {
      'superadmin': 'admin',
      'admin': 'admin', 
      'manager': 'manager',
      'supervisor': 'supervisor', 
      'staff': 'staff',
      'user': 'user',
      'visitor': 'user'
    };
    this.role = roleMap[this.accountType] || 'user';
  }
  
  // Ensure displayName is set
  if (!this.displayName) {
    this.displayName = this.name;
  }
  
  // Set default socialIdentityProvider for existing users
  if (!this.socialIdentityProvider) {
    this.socialIdentityProvider = this.email ? 'email' : 'phone';
  }
  
  next();
});

const User = mongoose.model("users", userSchema);
module.exports = User;
