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

// CREATE
exports.createOrder = async (req, res) => {
  try {
    // First normalize the incoming order data
    const incomingData = normalizeOrderObject(req.body);

    // Create a standardized order object with consistent properties
    const orderData = {
      // Basic identifiers
      customerId: new ObjectId(getCustomerId(incomingData)),

      // Customer details (normalized)
      customer: normalizeCustomerObject(incomingData.customer),

      // Items (already normalized through normalizeOrderObject)
      items: incomingData.items,

      // Standard monetary amounts - all stored in pounds (£) in database
      itemsTotal: getOrderAmount(incomingData),
      grandTotalToPay: getOrderAmount(incomingData),
      amount: getOrderAmount(incomingData),

      // Order metadata
      orderReference: getOrderReference(incomingData, `ORD-${Date.now()}`),
      orderType: incomingData.orderType || 'ONLINE',
      status: incomingData.status || 'pending',
      paymentStatus: incomingData.paymentStatus || 0,
      paymentMethod: incomingData.paymentMethod || 'card',

      // Timestamps
      createdAt: incomingData.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Create the order in the repository
    const order = await ordersRepository.createOrder(orderData);

    // Return normalized order in response
    res.json({
      success: true,
      order: normalizeOrderObject(order)
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
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
    console.error('Error fetching orders:', error);
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
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await ordersRepository.getCustomerOrders(req.params.customerId);

    // Return normalized orders
    res.json(orders.map(order => normalizeOrderObject(order)));
  } catch (error) {
    console.error('Error fetching customer orders:', error);
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
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Payment processing
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
    console.error('Payment processing error:', error);
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
    console.error('Error deleting order:', error);
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
    console.error('Error fetching aggregate orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
