const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const stripeService = require('../../../services/stripe/stripe.backend');
const ordersRepository = require("../../../database/mongo/repositories/orders.repository");
const opayoService = require("../../../common/services/opayo.service");

// Import normalization utilities
const {
  normalizeOrderObject,
  normalizeCustomerObject,
  poundsToPence,
  penceToPounds,
  prepareAmountForApi
} = require("../../../utils/dataNormalization");

// Import property access utilities
const {
  getId,
  getOrderAmount,
  getCustomerId,
  getOrderReference
} = require("../../../utils/propertyAccessUtils");

/**
 * Calculate order total from items
 * @param {Array} items - Array of order items
 * @returns {number} - Total amount in pounds
 */
function calculateOrderTotal(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity, 10) || 1;
    return total + (price * quantity);
  }, 0);
}

// CREATE
exports.createOrder = async (req, res) => {
  try {
    // First normalize the incoming order data
    const incomingData = normalizeOrderObject(req.body);

    // Ensure each item has a MongoDB _id and handle recipientId properly
    const itemsWithIds = (incomingData.items || []).map(item => {
      const processedItem = {
        ...item,
        _id: item._id || new ObjectId()
      };
      // Remove recipientId if it's not a valid ObjectId (e.g., client-side temp IDs)
      if (processedItem.recipientId && !ObjectId.isValid(processedItem.recipientId)) {
        delete processedItem.recipientId;
      }
      return processedItem;
    });

    // Add createdBy for PHONE orders
    const createdBy = incomingData.orderType === 'PHONE' ? 
      (incomingData.createdBy || req.user?.userId) : undefined;

    // Calculate total from items (fallback to getOrderAmount if items empty)
    const calculatedTotal = calculateOrderTotal(itemsWithIds);
    const orderAmount = calculatedTotal > 0 ? calculatedTotal : getOrderAmount(incomingData);

    // Handle customerId - for group bookings without existing customer, create or find one
    let customerId = getCustomerId(incomingData);
    
    // For group bookings without an existing customer, create or find customer from booking contact
    if (!customerId && incomingData.isGroupBooking && incomingData.bookingContact) {
      const Customer = require('../../../database/mongo/models/customer.model');
      const email = incomingData.bookingContact.email;
      
      // Try to find existing customer by email first
      let existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        const billingAddress = incomingData.billingInfo?.address || 'Not provided';
        const newCustomer = await Customer.create({
          firstName: incomingData.bookingContact.name?.split(' ')[0] || 'Group',
          lastName: incomingData.bookingContact.name?.split(' ').slice(1).join(' ') || 'Booking',
          email: email,
          phoneNumber: incomingData.bookingContact.phone || '0000000000',
          dateOfBirth: new Date('1970-01-01'), // Placeholder for company contact
          address: billingAddress,
          customerType: 'COMPANY',
          companyName: incomingData.organizationName,
          status: 'NEW_FIRST_TIME',
          createdFrom: 'GROUP_BOOKING',
          profileIncomplete: true // Mark for later completion
        });
        customerId = newCustomer._id;
      }
    } else if (!customerId && incomingData.customer) {
      // Fallback: create or find customer from customer object
      const Customer = require('../../../database/mongo/models/customer.model');
      const email = incomingData.customer.email;
      
      // Try to find existing customer by email first
      let existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        customerId = existingCustomer._id;
        
        // If user is authenticated and customer doesn't have userId, link them
        if (req.user?.userId && !existingCustomer.userId) {
          await Customer.findByIdAndUpdate(existingCustomer._id, {
            userId: req.user.userId,
            createdFrom: existingCustomer.createdFrom || 'WEBSITE'
          });
        }
      } else {
        // Determine createdFrom based on order type
        const createdFrom = incomingData.orderType === 'PHONE' ? 'PHONE_ORDER' : 'WEBSITE';
        
        const newCustomer = await Customer.create({
          firstName: incomingData.customer.firstName || incomingData.customer.name?.split(' ')[0] || 'Guest',
          lastName: incomingData.customer.lastName || incomingData.customer.name?.split(' ').slice(1).join(' ') || 'Customer',
          email: email,
          phoneNumber: incomingData.customer.phone || incomingData.customer.phoneNumber || '0000000000',
          dateOfBirth: incomingData.customer.dob || incomingData.customer.dateOfBirth || new Date('1970-01-01'),
          address: incomingData.customer.address || incomingData.billingInfo?.address || 'Not provided',
          customerType: incomingData.customer.customerType || 'INDIVIDUAL',
          companyName: incomingData.customer.companyName,
          status: 'NEW_FIRST_TIME',
          createdFrom: createdFrom,
          userId: req.user?.userId || null, // Link to User if authenticated
          profileIncomplete: !incomingData.customer.dob && !incomingData.customer.dateOfBirth
        });
        customerId = newCustomer._id;
      }
    }

    // Ensure we have a valid customerId
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer information is required to create an order'
      });
    }

    // Create a standardized order object with consistent properties
    const orderData = {
      // Basic identifiers
      customerId: new ObjectId(customerId),

      // Customer details (normalized)
      customer: normalizeCustomerObject(incomingData.customer),

      // Items with generated _ids
      items: itemsWithIds,

      // Standard monetary amounts - all stored in pounds (£) in database
      // Use calculated total from items, not from incoming data
      itemsTotal: orderAmount,
      grandTotalToPay: orderAmount,
      amount: orderAmount,

      // Order metadata
      orderReference: getOrderReference(incomingData, `ORD-${Date.now()}`),
      orderType: incomingData.orderType || 'ONLINE',
      status: incomingData.status || 'pending',
      paymentStatus: incomingData.paymentStatus || 0,
      paymentMethod: incomingData.paymentMethod || 'card',

      // Group booking fields
      isGroupBooking: incomingData.isGroupBooking || false,
      organizationName: incomingData.organizationName,
      bookingContact: incomingData.bookingContact,
      groupBookingNotes: incomingData.groupBookingNotes,

      // Timestamps
      createdAt: incomingData.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Add createdBy for PHONE orders
    if (createdBy) {
      orderData.createdBy = new ObjectId(createdBy);
    }

    // Create the order in the repository
    const order = await ordersRepository.createOrder(orderData);

    // Return normalized order in response
    res.json({
      success: true,
      order: normalizeOrderObject(order)
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in createOrder:`, error);

    let userMessage = "An unexpected error occurred. Please try again later.";
    if (error.name === "ValidationError" || error.name === "CastError") {
      userMessage = "Invalid input data.";
    } else if (error.message && (
      error.message.includes("not found") ||
      error.message.includes("No such") ||
      error.message.includes("Unable to")
    )) {
      userMessage = error.message;
    } else if (error.message && error.message.includes("forbidden")) {
      userMessage = "You do not have permission to perform this action.";
    }

    res.status(500).json({ success: false, error: userMessage });
  }
};

// READ
exports.getOrders = async (req, res) => {
  try {
    const query = {};
    if (req.query.orderType) query.orderType = req.query.orderType;
    if (req.query.customerId) query.customerId = new ObjectId(req.query.customerId);

    const orders = await ordersRepository.getOrders(query);

    // Return normalized orders
    res.json(orders.map(order => normalizeOrderObject(order)));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in getOrders:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await ordersRepository.getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    // Return normalized order
    res.json(normalizeOrderObject(order));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in getOrderDetails:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await ordersRepository.getCustomerOrders(req.params.customerId);

    // Return normalized orders
    res.json(orders.map(order => normalizeOrderObject(order)));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in getCustomerOrders:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE
exports.updateOrderData = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Normalize update data
    const updateData = normalizeOrderObject(req.body);

    const order = await ordersRepository.getOrderById(orderId);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    if (order.orderType === 'PHONE' && req.user?.accountType !== 'admin') {
      return res.status(403).json({ success: false, error: "Only admins can update phone orders" });
    }

    const updatedOrder = await ordersRepository.updateOrder(orderId, updateData);

    // Return normalized order
    res.json(normalizeOrderObject(updatedOrder));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in updateOrderData:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ NEW PAYMENT FLOW FOR STRIPE ELEMENTS ============

/**
 * Create payment intent for an order (for Stripe Elements)
 * Returns clientSecret for frontend to use with PaymentElement
 */
exports.createOrderPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get the order
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Calculate amount from order
    const normalizedOrder = normalizeOrderObject(order);
    const amountInPounds = getOrderAmount(normalizedOrder);
    
    if (!amountInPounds || amountInPounds <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order amount' });
    }

    // Convert to pence for Stripe
    const amountInPence = poundsToPence(amountInPounds);

    // Get customer info from order
    const customerId = getCustomerId(order);
    const customerEmail = order.customer?.email || order.bookingContact?.email;

    // Create payment intent with Stripe
    const paymentIntent = await stripeService.createPaymentIntent(
      amountInPence,
      'gbp',
      customerId ? { id: customerId } : null,
      { 
        orderId: orderId,
        customerEmail: customerEmail,
        isGroupBooking: order.isGroupBooking || false
      }
    );

    // Update order status to payment pending
    await ordersRepository.updateOrder({ _id: orderId }, {
      paymentStatus: 1, // Pending
      orderCheckPoint: 3, // Payment Pending
      paymentIntentId: paymentIntent.id,
      updatedAt: Date.now()
    });

    // Return client secret for Stripe Elements
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInPounds,
      amountInPence: amountInPence
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in createOrderPaymentIntent:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Confirm payment for an order (called after Stripe Elements success)
 * Updates order status after frontend confirms payment
 */
exports.confirmOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentIntentId, paymentStatus: stripeStatus } = req.body;

    // Get the order
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify payment intent with Stripe (optional but recommended)
    let paymentVerified = false;
    let paymentIntent = null;
    
    if (paymentIntentId) {
      try {
        paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);
        paymentVerified = paymentIntent.status === 'succeeded';
      } catch (stripeError) {
        console.error('Error verifying payment intent:', stripeError);
      }
    }

    // Determine payment status based on Stripe response
    const isSuccess = paymentVerified || stripeStatus === 'succeeded';
    
    // Calculate paid amount
    const normalizedOrder = normalizeOrderObject(order);
    const amountInPounds = getOrderAmount(normalizedOrder);

    // Update order with payment result
    const updateData = {
      paymentStatus: isSuccess ? 2 : 4, // 2 = Paid, 4 = Attempted
      orderCheckPoint: isSuccess ? 4 : 6, // 4 = Paid, 6 = Processing
      grandTotalPaid: isSuccess ? amountInPounds : 0,
      paymentMethod: 'stripe',
      paymentSummary: {
        provider: 'stripe',
        paymentIntentId: paymentIntentId || order.paymentIntentId,
        status: stripeStatus || (paymentIntent?.status || 'unknown'),
        amount: poundsToPence(amountInPounds),
        confirmedAt: new Date()
      },
      updatedAt: Date.now()
    };

    const updatedOrder = await ordersRepository.updateOrder({ _id: orderId }, updateData);

    if (!updatedOrder) {
      throw new Error('Failed to update order with payment status');
    }

    res.json({
      success: isSuccess,
      order: normalizeOrderObject(updatedOrder),
      paymentStatus: isSuccess ? 'succeeded' : 'failed',
      message: isSuccess ? 'Payment confirmed successfully' : 'Payment confirmation failed'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in confirmOrderPayment:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ END NEW PAYMENT FLOW ============

// Legacy Payment processing (for backwards compatibility with direct card processing)
exports.orderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, customer, orderDetails, cardInfo, serviceReferences } = req.body;

    // Normalize customer and order details
    const normalizedCustomer = normalizeCustomerObject(customer);
    const normalizedOrderDetails = normalizeOrderObject(orderDetails);

    // All monetary amounts in the database are stored in pounds (£)
    // These will be converted to pence (p) when sent to payment gateways
    const updateReqObj = {
      customer: normalizedCustomer,
      paymentStatus: 4,
      orderCheckPoint: 6,
      paymentMethod,
      items: normalizedOrderDetails.items,
      itemsTotal: getOrderAmount(normalizedOrderDetails),
      grandTotalToPay: getOrderAmount(normalizedOrderDetails),
      cardInfo: cardInfo || {},
      updatedAt: Date.now(),
    };

    const updatedOrder = await ordersRepository.updateOrder({ _id: orderId }, updateReqObj, {});
    if (!updatedOrder) {
      throw new Error("Unable to initiate payment. Please contact support.");
    }

    // Process payment - amounts are converted to pence for payment processors
    let paymentResult;
    if (paymentMethod === 'stripe') {
      // Convert amount to pence for Stripe (Stripe requires amounts in smallest currency unit)
      const amountInPence = prepareAmountForApi(getOrderAmount(normalizedOrderDetails));
      paymentResult = await processStripePayment(amountInPence, normalizedCustomer, orderId);
    } else if (paymentMethod === 'opayo') {
      // Opayo also requires amounts in pence
      const amountInPence = prepareAmountForApi(getOrderAmount(normalizedOrderDetails));
      paymentResult = await processOpayoPayment(cardInfo, amountInPence, normalizedCustomer);
    } else {
      throw new Error("Invalid payment method");
    }

    // Update items with service references if provided
    if (serviceReferences && Array.isArray(serviceReferences)) {
      const currentOrder = await ordersRepository.getOrderById(orderId);
      const normalizedCurrentOrder = normalizeOrderObject(currentOrder);

      // Map service references to items
      const updatedItems = normalizedCurrentOrder.items.map(item => {
        const serviceRef = serviceReferences.find(ref =>
          getId(ref.serviceId) === getId(item)
        );

        if (serviceRef) {
          return { ...item, serviceReference: serviceRef.serviceReference };
        }
        return item;
      });

      updateReqObj.items = updatedItems;
    }

    // Payment amounts come back from payment processors in pence
    // Convert back to pounds for storage in database
    const finalUpdateObj = {
      paymentStatus: 2,
      paymentSummary: paymentResult,
      orderCheckPoint: 4,
      // Convert payment amount from pence to pounds if necessary
      grandTotalPaid: paymentResult.provider === 'stripe' ?
        penceToPounds(paymentResult.amount) : paymentResult.amount,
      updatedAt: Date.now(),
      items: updateReqObj.items
    };

    const finalOrder = await ordersRepository.updateOrder({ _id: orderId }, finalUpdateObj, {});
    if (!finalOrder) {
      throw new Error("Unable to complete payment. Please contact support.");
    }

    // Return normalized order
    res.json(normalizeOrderObject(finalOrder));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in orderPayment:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

async function processStripePayment(amountInPence, customer, orderId) {
  // Stripe expects amount in pence (smallest currency unit)
  // No conversion needed here since amountInPence is already in pence
  const paymentIntent = await stripeService.createPaymentIntent(
    amountInPence,
    'gbp',
    getId(customer),
    { orderId: orderId }
  );

  return {
    status: 'success',
    amount: paymentIntent.amount, // This is in pence
    id: paymentIntent.id,
    provider: 'stripe'
  };
}

async function processOpayoPayment(cardInfo, amountInPence, customer) {
  // Opayo also expects amount in pence
  const transactionResp = await opayoService.payOnSagePay(
    cardInfo,
    amountInPence, // Already in pence
    {
      description: "NEXC Transaction",
      customerFirstName: customer.firstName || customer.name?.split(' ')[0] || '',
      customerLastName: customer.lastName ||
        (customer.name?.split(' ').length > 1 ?
          customer.name.split(' ')[customer.name.split(' ').length - 1] : ''),
      address: customer.address,
      city: customer.city || customer.address,
      postalCode: customer.zipcode,
    }
  );

  if (transactionResp.status !== "Ok") {
    throw new Error("Opayo transaction failed");
  }

  return {
    status: 'success',
    amount: transactionResp.amount.totalAmount, // This is already in pounds
    id: transactionResp.transactionId,
    provider: 'opayo'
  };
}

// DELETE
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (req.user?.accountType !== 'admin') {
      return res.status(403).json({ success: false, error: "Only admins can delete orders" });
    }

    const order = await ordersRepository.deleteOrder(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in deleteOrder:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Aggregation functions
exports.getAggregateOrders = async (req, res) => {
  try {
    const { startDate, endDate, orderType, paymentStatus, orderCheckPoint } = req.body;

    const aggregationPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate || "2020-01-01"),
            $lte: new Date(endDate || new Date())
          },
          ...(orderType && { orderType }),
          ...(paymentStatus && { paymentStatus }),
          ...(orderCheckPoint && { orderCheckPoint })
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 25 },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData"
        }
      },
      {
        $project: {
          _id: 1,
          paymentStatus: 1,
          orderSummary: 1,
          paymentSummary: 1,
          orderCheckPoint: 1,
          address: 1,
          zipcode: 1,
          dob: 1,
          NINumber: 1,
          items: 1,
          itemsTotal: 1,
          grandTotalToPay: 1,
          grandTotalPaid: 1,
          createdAt: 1,
          updatedAt: 1,
          customerData: {
            _id: 1,
            email: 1,
            phoneNumber: 1,
            name: 1,
            profileImage: 1,
          },
        }
      }
    ];

    const orders = await ordersRepository.getAggregateOrders(aggregationPipeline);

    // Map the results to ensure consistent property access
    // We don't use full normalization here to preserve the aggregation structure
    const normalizedOrders = orders.map(order => ({
      ...order,
      id: getId(order),
      amount: getOrderAmount(order),
      customer: order.customerData?.length ? normalizeCustomerObject(order.customerData[0]) : null
    }));

    res.json(normalizedOrders);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in getAggregateOrders:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ASSIGN TECHNICIAN TO ORDER
exports.assignTechnician = async (req, res) => {
  try {
    const modelRegistry = require("../../../database/mongo/modelRegistry");
    const Orders = modelRegistry.getModel("orders");
    const Technicians = modelRegistry.getModel("technicians");
    
    const { orderId } = req.params;
    const { technicianId, notes, scheduledDate, priority } = req.body;
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid order ID" 
      });
    }
    
    if (!technicianId || !mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid technician ID is required" 
      });
    }
    
    // Get order
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: "Order not found" 
      });
    }
    
    // Get technician
    const technician = await Technicians.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ 
        success: false, 
        error: "Technician not found" 
      });
    }
    
    // Check technician status and availability
    if (technician.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        error: `Technician is ${technician.status} and cannot be assigned` 
      });
    }
    
    // Check if technician has capacity (max 5 concurrent assignments)
    const activeAssignments = technician.assignedOrders.filter(
      assignment => ['assigned', 'in-progress'].includes(assignment.status)
    );
    
    if (activeAssignments.length >= 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Technician has reached maximum concurrent assignments (5)' 
      });
    }
    
    // Check if technician has required specialty
    if (order.items && order.items.length > 0) {
      const serviceType = order.items[0].serviceType;
      const specialtyMap = {
        'card': 'Cards',
        'test': 'Tests',
        'course': 'Courses',
        'qualification': 'Qualifications'
      };
      
      const requiredSpecialty = specialtyMap[serviceType];
      if (requiredSpecialty && !technician.hasSpecialty(requiredSpecialty)) {
        return res.status(400).json({ 
          success: false, 
          error: `Technician does not have required specialty: ${requiredSpecialty}` 
        });
      }
    }
    
    // Update order items with assignment
    order.items = order.items.map(item => ({
      ...item.toObject(),
      assignedTo: new ObjectId(technicianId),
      status: 'in-progress',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : item.scheduledDate,
      serviceHistory: [
        ...(item.serviceHistory || []),
        {
          status: 'in-progress',
          timestamp: new Date(),
          updatedBy: req.user?._id,
          notes: notes || `Assigned to ${technician.firstName} ${technician.lastName}`
        }
      ]
    }));
    
    await order.save();
    
    // Update technician using the instance method
    await technician.addAssignment({
      orderId: order._id,
      customerId: order.customerId,
      customerName: order.customer?.name || 
                   `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      serviceType: order.items[0]?.serviceType,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      priority: priority || 'medium',
      notes
    });
    
    res.json({ 
      success: true, 
      data: normalizeOrderObject(order),
      message: `Order successfully assigned to ${technician.firstName} ${technician.lastName}`
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in assignTechnician:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to assign technician'
    });
  }
};

// ASSIGN TECHNICIAN TO SPECIFIC ITEM
exports.assignTechnicianToItem = async (req, res) => {
  try {
    const modelRegistry = require("../../../database/mongo/modelRegistry");
    const Orders = modelRegistry.getModel("orders");
    const Technicians = modelRegistry.getModel("technicians");
    
    const { orderId, itemId } = req.params;
    const { technicianId, notes, scheduledDate, priority } = req.body;
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid order ID" 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid item ID" 
      });
    }
    
    if (!technicianId || !mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid technician ID is required" 
      });
    }
    
    // Get order
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: "Order not found" 
      });
    }
    
    // Find the specific item
    const itemIndex = order.items.findIndex(item => 
      item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: "Item not found in order" 
      });
    }
    
    // Get technician
    const technician = await Technicians.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ 
        success: false, 
        error: "Technician not found" 
      });
    }
    
    // Check technician status and availability
    if (technician.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        error: `Technician is ${technician.status} and cannot be assigned` 
      });
    }
    
    // Check if technician has capacity (max 5 concurrent assignments)
    const activeAssignments = technician.assignedOrders.filter(
      assignment => ['assigned', 'in-progress'].includes(assignment.status)
    );
    
    if (activeAssignments.length >= 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Technician has reached maximum concurrent assignments (5)' 
      });
    }
    
    const item = order.items[itemIndex];
    
    // Check if technician has required specialty
    const specialtyMap = {
      'card': 'Cards',
      'test': 'Tests',
      'course': 'Courses',
      'qualification': 'Qualifications'
    };
    
    const requiredSpecialty = specialtyMap[item.serviceType];
    if (requiredSpecialty && !technician.hasSpecialty(requiredSpecialty)) {
      return res.status(400).json({ 
        success: false, 
        error: `Technician does not have required specialty: ${requiredSpecialty}` 
      });
    }
    
    // Update only the specific item
    order.items[itemIndex] = {
      ...item.toObject(),
      assignedTo: new ObjectId(technicianId),
      status: 'in-progress',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : item.scheduledDate,
      serviceHistory: [
        ...(item.serviceHistory || []),
        {
          status: 'in-progress',
          timestamp: new Date(),
          updatedBy: req.user?._id,
          notes: notes || `Assigned to ${technician.firstName} ${technician.lastName}`
        }
      ]
    };
    
    // Use findByIdAndUpdate to bypass validation on unchanged fields
    await Orders.findByIdAndUpdate(
      orderId,
      {
        $set: {
          [`items.${itemIndex}`]: order.items[itemIndex]
        }
      },
      { runValidators: false, new: false }
    );
    
    // Update technician using the instance method
    await technician.addAssignment({
      orderId: order._id,
      itemId: item._id,
      customerId: order.customerId,
      customerName: order.customer?.name || 
                   `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      serviceType: item.serviceType,
      serviceTitle: item.title,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      priority: priority || 'medium',
      notes
    });
    
    res.json({ 
      success: true, 
      data: normalizeOrderObject(order),
      message: `Service assigned to ${technician.firstName} ${technician.lastName}`
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in assignTechnicianToItem:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to assign technician to item'
    });
  }
};

// UPDATE ITEM STATUS
exports.updateItemStatus = async (req, res) => {
  try {
    const modelRegistry = require("../../../database/mongo/modelRegistry");
    const Orders = modelRegistry.getModel("orders");
    const Technicians = modelRegistry.getModel("technicians");
    
    const { orderId, itemId } = req.params;
    const { status, notes } = req.body;
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid order ID" 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid item ID" 
      });
    }
    
    const validStatuses = ['ordered', 'scheduled', 'in-progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Get order
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: "Order not found" 
      });
    }
    
    // Find the specific item
    const itemIndex = order.items.findIndex(item => 
      item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: "Item not found in order" 
      });
    }
    
    const item = order.items[itemIndex];
    
    // Track completion time if completing
    const assignedDate = item.serviceHistory?.find(
      h => h.status === 'in-progress'
    )?.timestamp;
    let completionTimeHours = null;
    
    if (status === 'completed' && assignedDate) {
      const completionTime = new Date() - new Date(assignedDate);
      completionTimeHours = completionTime / (1000 * 60 * 60); // Convert to hours
    }
    
    // Update only the specific item
    order.items[itemIndex] = {
      ...item.toObject(),
      status,
      completedDate: status === 'completed' ? new Date() : item.completedDate,
      serviceHistory: [
        ...(item.serviceHistory || []),
        {
          status,
          timestamp: new Date(),
          updatedBy: req.user?._id,
          notes: notes || `Status changed to ${status}`
        }
      ]
    };
    
    // Use findByIdAndUpdate to bypass validation on unchanged fields
    await Orders.findByIdAndUpdate(
      orderId,
      {
        $set: {
          [`items.${itemIndex}`]: order.items[itemIndex]
        }
      },
      { runValidators: false, new: false }
    );
    
    // Update technician if item is completed or cancelled
    if (['completed', 'cancelled'].includes(status) && item.assignedTo) {
      const technician = await Technicians.findById(item.assignedTo);
      if (technician) {
        if (status === 'completed') {
          await technician.completeAssignment(orderId, completionTimeHours);
        } else if (status === 'cancelled') {
          await technician.cancelAssignment(orderId, notes || 'Service cancelled');
        }
      }
    }
    
    res.json({ 
      success: true, 
      data: normalizeOrderObject(order),
      message: `Service status updated to ${status}`
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in updateItemStatus:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update item status'
    });
  }
};

// UPDATE ORDER STATUS (legacy - updates all items)
exports.updateOrderStatus = async (req, res) => {
  try {
    const modelRegistry = require("../../../database/mongo/modelRegistry");
    const Orders = modelRegistry.getModel("orders");
    const Technicians = modelRegistry.getModel("technicians");
    
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid order ID" 
      });
    }
    
    const validStatuses = ['ordered', 'scheduled', 'in-progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Get order
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: "Order not found" 
      });
    }
    
    // Track completion time if completing
    const assignedDate = order.items[0]?.serviceHistory?.find(
      h => h.status === 'in-progress'
    )?.timestamp;
    let completionTimeHours = null;
    
    if (status === 'completed' && assignedDate) {
      const completionTime = new Date() - new Date(assignedDate);
      completionTimeHours = completionTime / (1000 * 60 * 60); // Convert to hours
    }
    
    // Update order items with new status
    order.items = order.items.map(item => ({
      ...item.toObject(),
      status,
      completedDate: status === 'completed' ? new Date() : item.completedDate,
      serviceHistory: [
        ...(item.serviceHistory || []),
        {
          status,
          timestamp: new Date(),
          updatedBy: req.user?._id,
          notes: notes || `Status changed to ${status}`
        }
      ]
    }));
    
    await order.save();
    
    // Update technician if order is completed or cancelled
    if (['completed', 'cancelled'].includes(status) && order.items[0]?.assignedTo) {
      const technician = await Technicians.findById(order.items[0].assignedTo);
      if (technician) {
        if (status === 'completed') {
          await technician.completeAssignment(orderId, completionTimeHours);
        } else if (status === 'cancelled') {
          await technician.cancelAssignment(orderId, notes || 'Order cancelled');
        }
      }
    }
    
    res.json({ 
      success: true, 
      data: normalizeOrderObject(order),
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in updateOrderStatus:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update order status'
    });
  }
};
