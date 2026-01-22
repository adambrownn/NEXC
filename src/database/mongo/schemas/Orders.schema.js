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
  
  // ===== GROUP BOOKING: Recipient Fields =====
  // For group bookings, each item can have a different recipient
  // If not set, falls back to the order's primary customer
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    default: null // null means use order's customerId
  },
  recipientDetails: {
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    email: { type: String },
    phoneNumber: { type: String },
    NINumber: { type: String },
    address: { type: String },
    postcode: { type: String }
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

  // ===== GROUP BOOKING FIELDS =====
  isGroupBooking: { 
    type: Boolean, 
    default: false 
  },
  
  // Organization placing the group booking (company/employer)
  organizationName: { type: String },
  
  // Booking contact - person handling the booking (may differ from service recipients)
  bookingContact: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    role: { type: String } // e.g., "HR Manager", "Site Supervisor", "Training Coordinator"
  },
  
  // Array of all recipient customer IDs for quick lookup
  // Individual recipient details are stored per-item in items[].recipientId
  recipientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  
  // Group booking notes (special instructions, company requirements, etc.)
  groupBookingNotes: { type: String },

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

// ===== AUTOMATIC CUSTOMER STATUS TRANSITIONS =====
// These hooks automatically update customer status based on order lifecycle

// Hook 1: NEW_FIRST_TIME → NEW_PROSPECT (when first order created, even if unpaid)
ordersSchema.post('save', async function() {
  try {
    if (this.isNew && this.customerId) {
      const Customer = require('../models/customer.model');
      const customer = await Customer.findById(this.customerId);
      
      if (customer && customer.status === 'NEW_FIRST_TIME') {
        await customer.updateOne({
          status: 'NEW_PROSPECT',
          $push: {
            statusHistory: {
              previousStatus: 'NEW_FIRST_TIME',
              newStatus: 'NEW_PROSPECT',
              reason: 'First order created',
              orderId: this._id,
              automatic: true,
              timestamp: new Date()
            }
          }
        });
        console.log(`[Customer Status] ${customer._id}: NEW_FIRST_TIME → NEW_PROSPECT (Order ${this._id} created)`);
      }
    }
  } catch (error) {
    console.error('[Customer Status Hook] Error in NEW_FIRST_TIME → NEW_PROSPECT:', error);
  }
});

// Hook 2: NEW_PROSPECT → EXISTING_ACTIVE (when order payment completed)
// Also handles: EXISTING_COMPLETED → EXISTING_ACTIVE (reactivation on new paid order)
ordersSchema.post('save', async function() {
  try {
    // Check if order is paid: paymentStatus = 2 (paid) AND orderCheckPoint = 4 (paid)
    if (this.paymentStatus === 2 && this.orderCheckPoint === 4 && this.customerId) {
      const Customer = require('../models/customer.model');
      const customer = await Customer.findById(this.customerId);
      
      if (customer && ['NEW_FIRST_TIME', 'NEW_PROSPECT', 'EXISTING_COMPLETED'].includes(customer.status)) {
        const previousStatus = customer.status;
        const reason = previousStatus === 'EXISTING_COMPLETED' 
          ? 'New paid order (customer reactivated)' 
          : 'First paid order completed';
        
        await customer.updateOne({
          status: 'EXISTING_ACTIVE',
          $push: {
            statusHistory: {
              previousStatus: previousStatus,
              newStatus: 'EXISTING_ACTIVE',
              reason: reason,
              orderId: this._id,
              automatic: true,
              timestamp: new Date()
            }
          }
        });
        console.log(`[Customer Status] ${customer._id}: ${previousStatus} → EXISTING_ACTIVE (Order ${this._id} paid)`);
      }
    }
  } catch (error) {
    console.error('[Customer Status Hook] Error in payment completion transition:', error);
  }
});

// Hook 3: EXISTING_ACTIVE → EXISTING_COMPLETED (when ALL orders completed)
ordersSchema.post('findOneAndUpdate', async function(doc) {
  try {
    if (doc && doc.customerId) {
      // Check if this order is now marked as completed
      // orderCheckPoint values: 0=Cart, 2=Checkout, 3=Pending, 4=Paid, 5=Cancelled, 6=Tried
      // We consider an order "completed" when it's fully processed (checkpoint 4)
      const Orders = mongoose.model('orders');
      const Customer = require('../models/customer.model');
      
      // Count incomplete/active orders (not completed and not cancelled)
      const activeOrders = await Orders.countDocuments({
        customerId: doc.customerId,
        orderCheckPoint: { $nin: [4, 5] } // Not paid/completed (4) or cancelled (5)
      });
      
      // If no active orders remain, mark customer as completed
      if (activeOrders === 0) {
        const customer = await Customer.findById(doc.customerId);
        
        if (customer && customer.status === 'EXISTING_ACTIVE') {
          await customer.updateOne({
            status: 'EXISTING_COMPLETED',
            $push: {
              statusHistory: {
                previousStatus: 'EXISTING_ACTIVE',
                newStatus: 'EXISTING_COMPLETED',
                reason: 'All orders completed',
                orderId: doc._id,
                automatic: true,
                timestamp: new Date()
              }
            }
          });
          console.log(`[Customer Status] ${customer._id}: EXISTING_ACTIVE → EXISTING_COMPLETED (All orders fulfilled)`);
        }
      }
    }
  } catch (error) {
    console.error('[Customer Status Hook] Error in EXISTING_ACTIVE → EXISTING_COMPLETED:', error);
  }
});

const Orders = mongoose.model("orders", ordersSchema);
module.exports = Orders;
