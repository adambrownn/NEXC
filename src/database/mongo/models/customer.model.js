const mongoose = require('mongoose');
const { CUSTOMER_STATUS, CUSTOMER_TYPE } = require('../../../types/customer.types');
const modelRegistry = require('../modelRegistry');

// Customer Schema
const customerSchema = new mongoose.Schema({
  // firstName/lastName: Required for INDIVIDUAL, optional for COMPANY (used for rep contact)
  firstName: { 
    type: String, 
    required: function() {
      return this.customerType === 'INDIVIDUAL';
    }
  },
  lastName: { 
    type: String, 
    required: function() {
      return this.customerType === 'INDIVIDUAL';
    }
  },
  // Company representative contact info (for COMPANY type)
  representativeName: { type: String }, // Full name of company rep
  dateOfBirth: { 
    type: Date, 
    required: function() {
      return this.customerType === 'INDIVIDUAL';
    }
  },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  NINumber: { type: String },
  address: { type: String, required: true },
  zipcode: { type: String },
  customerType: { 
    type: String, 
    enum: Object.values(CUSTOMER_TYPE),
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(CUSTOMER_STATUS),
    default: CUSTOMER_STATUS.NEW_FIRST_TIME
  },
  // Required for COMPANY type customers
  companyName: { 
    type: String,
    required: function() {
      return this.customerType === 'COMPANY';
    }
  },
  
  // Track where customer profile was created from
  createdFrom: {
    type: String,
    enum: ['WEBSITE', 'DASHBOARD', 'GROUP_BOOKING', 'PHONE_ORDER', 'IMPORT'],
    default: 'DASHBOARD'
  },
  
  // Profile completion tracking (for website registrations)
  profileIncomplete: { 
    type: Boolean, 
    default: false 
  },
  
  // Link to User account (for website customers)
  // Required only when createdFrom is 'WEBSITE'
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true, // Allow null/undefined for dashboard-created customers
    required: function() {
      return this.createdFrom === 'WEBSITE';
    }
  },
  
  // Status change history (automatic tracking)
  statusHistory: [{
    previousStatus: {
      type: String,
      enum: Object.values(CUSTOMER_STATUS)
    },
    newStatus: {
      type: String,
      enum: Object.values(CUSTOMER_STATUS),
      required: true
    },
    reason: { type: String },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orders'
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    automatic: { 
      type: Boolean, 
      default: false 
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual fields
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Add middleware
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add methods
customerSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    dateOfBirth: this.dateOfBirth,
    email: this.email,
    phoneNumber: this.phoneNumber,
    address: this.address,
    customerType: this.customerType,
    status: this.status,
    companyName: this.companyName,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Initialize the Customer model
let Customer;
try {
  // First try to get from mongoose models (in case it's already registered)
  Customer = mongoose.models.Customer;
  
  if (!Customer) {
    // If not in mongoose models, register with registry if initialized
    if (modelRegistry.areModelsInitialized()) {
      console.log('[CustomerModel] Using ModelRegistry');
      // Register schema first
      modelRegistry.registerSchema('Customer', customerSchema);
      // Then get or create model
      Customer = modelRegistry.getModel('Customer');
    } else {
      console.log('[CustomerModel] ModelRegistry not initialized, using mongoose directly');
      // If registry not initialized, create model directly
      Customer = mongoose.model('Customer', customerSchema);
    }
  }

  // Verify the model
  if (!Customer || !Customer.find) {
    throw new Error('Customer model was not properly initialized');
  }
} catch (error) {
  console.error('[CustomerModel] Error initializing Customer model:', error);
  // Last resort: try to get or create model directly
  try {
    Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
    if (!Customer || !Customer.find) {
      throw new Error('Failed to initialize Customer model');
    }
  } catch (recoveryError) {
    console.error('[CustomerModel] Recovery failed:', recoveryError);
    throw new Error(`Failed to initialize Customer model: ${error.message}`);
  }
}

module.exports = Customer;
