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
  quantity: { type: Number },
  price: { type: Number, required: true },

  // Service Reference Fields
  serviceReference: { type: String },

  // Common Service Fields
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'services' },
  serviceType: { 
    type: String, 
    enum: ['card', 'test', 'course', 'qualification'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['ordered', 'scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'ordered' 
  },
  notes: { type: String },
  
  // Category-Specific Fields
  // Cards
  cardDetails: {
    cardType: { 
      type: String, 
      enum: ['New', 'Duplicate', 'Renewal'] 
    },
    deliveryLocation: { type: String },
    cardRegID: { type: String },
    recipientDetails: { type: Object },
    verificationDocuments: [{ type: String }]
  },
  
  // Tests
  testDetails: {
    citbTestId: { type: String },
    testDate: { type: Date },
    testTime: { type: String },
    testCentre: { type: String },
    voiceover: { type: String },
    accommodations: { type: String },
    testModules: [{ type: String }]
  },
  
  // Courses
  courseDetails: {
    startDate: { type: Date },
    endDate: { type: Date },
    deliveryMethod: { 
      type: String, 
      enum: ['Online', 'In-person', 'Hybrid'] 
    },
    prerequisites: [{ type: String }],
    accommodations: { type: String }
  },
  
  // Qualifications
  qualificationDetails: {
    level: { 
      type: String, 
      enum: ['Basic', 'Intermediate', 'Advanced'] 
    },
    deliveryMethod: { 
      type: String, 
      enum: ['Online', 'In-person', 'Hybrid'] 
    },
    previousCertificateDetails: { type: Object },
    verificationDocuments: [{ type: String }]
  },
  
  // Service Lifecycle Fields
  serviceHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    notes: { type: String }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  followUpDate: { type: Date }
});

const ordersSchema = mongoose.Schema({
  // Add order type to distinguish between online and phone orders
  orderType: {
    type: String,
    enum: ['ONLINE', 'PHONE'],
    required: true,
    default: 'ONLINE'
  },

  // Add reference fields for hierarchical reference system
  orderReference: {
    type: String,
    unique: true,
    sparse: true
  },

  // Add proper customer reference
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  // Keep customer details for backward compatibility
  customer: {
    _id: { type: String },
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    zipcode: { type: String },
    dob: { type: String },
    NINumber: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    status: { 
      type: String,
      enum: ['NEW_FIRST_TIME', 'NEW_PROSPECT', 'EXISTING_COMPLETED', 'EXISTING_ACTIVE'],
      default: 'NEW_FIRST_TIME'
    },
    lastContact: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },

  // Add sales staff reference for phone orders
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: function() { return this.orderType === 'PHONE'; }
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
