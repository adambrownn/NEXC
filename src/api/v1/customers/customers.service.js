const mongoose = require('mongoose');
const { CUSTOMER_STATUS, CUSTOMER_TYPE } = require('../../../types/customer.types');
const customerRepository = require('../../../database/mongo/repositories/customers.repository');
const ordersRepository = require('../../../database/mongo/repositories/orders.repository');
const Customer = require('../../../database/mongo/models/customer.model');
const modelRegistry = require('../../../database/mongo/modelRegistry'); // Assuming modelRegistry is defined in this file

// Service functions
const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    
    // Validate required fields based on customer type
    if (customerData.customerType === CUSTOMER_TYPE.COMPANY) {
      if (!customerData.companyName || !customerData.companyRegNumber) {
        return res.status(400).json({
          message: 'Company name and registration number are required for company customers'
        });
      }
    }

    // Create new customer
    const customer = await customerRepository.createCustomer(customerData);
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(409).json({
        message: 'A customer with this email already exists'
      });
    } else {
      res.status(500).json({
        message: error.message || 'Error creating customer'
      });
    }
  }
};

const searchCustomers = async (req, res) => {
  try {
    console.log('[CustomerService] Received search request with query:', req.query);
    const { search, useRegistry } = req.query;

    // If useRegistry is true, ensure modelRegistry is initialized
    if (useRegistry === 'true' && !modelRegistry.areModelsInitialized()) {
      console.log('[CustomerService] Initializing ModelRegistry');
      modelRegistry.initializeModels();
    }

    const query = search ? {
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ]
    } : {};

    console.log('[CustomerService] Executing repository query:', JSON.stringify(query));
    const customers = await customerRepository.getCustomers(query);
    console.log(`[CustomerService] Found ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('[CustomerService] Error in searchCustomers:', error);
    res.status(500).json({
      message: error.message || 'Error searching customers',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await customerRepository.getCustomerById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving customer'
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updateData = req.body;
    
    const customer = await customerRepository.updateCustomer(customerId, updateData);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error updating customer'
    });
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, reason } = req.body;

    if (!Object.values(CUSTOMER_STATUS).includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    const customer = await customerRepository.updateCustomerStatus(customerId, status, reason);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error updating customer status'
    });
  }
};

// Get customer bookings (combines regular and reserved orders)
const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get all orders for the customer
    const orders = await ordersRepository.Orders.find({ customerId })
      .sort({ createdAt: -1 });

    // Transform and return orders
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      type: order.orderType,
      status: order.orderCheckPoint,
      paymentStatus: order.paymentStatus,
      items: order.items,
      total: order.grandTotalToPay,
      createdAt: order.createdAt
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: error.message });
  }
  };

  // Get customer services
const getCustomerServices = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Fetch the customer to ensure they exist
    const customer = await customerRepository.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    // Get all paid orders for this customer
    const orders = await ordersRepository.Orders.find({ 
      customerId,
      paymentStatus: 2  // Only paid orders
    }).lean();

    const services = [];
    
    // Extract service items from orders
    for (const order of orders) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (!item.serviceId) continue;
          
          // Determine service collection based on type
          let serviceModel;
          let serviceType = item.serviceType?.toLowerCase();
          
          if (serviceType === 'card') {
            serviceModel = modelRegistry.getModel('cards');
          } else if (serviceType === 'course') {
            serviceModel = modelRegistry.getModel('courses');
          } else if (serviceType === 'test') {
            serviceModel = modelRegistry.getModel('tests');
          } else {
            continue; // Skip unknown types
          }
          
          try {
            // Fetch service details
            const service = await serviceModel.findById(item.serviceId).lean();
            if (!service) continue;
            
            // Calculate expiry date
            const purchaseDate = order.createdAt;
            const validityMonths = parseInt(service.validityPeriod) || 12;
            const expiryDate = new Date(purchaseDate);
            expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
            
            const now = new Date();
            const isExpired = now > expiryDate;
            const isExpiringSoon = !isExpired && (expiryDate - now) < (30 * 24 * 60 * 60 * 1000); // 30 days
            
            services.push({
              _id: service._id,
              title: service.title || service.name,
              type: serviceType,
              purchaseDate,
              expiryDate,
              status: isExpired ? 'expired' : isExpiringSoon ? 'expiring_soon' : 'active',
              orderId: order._id,
              validityPeriod: service.validityPeriod
            });
          } catch (error) {
            console.error(`Error fetching service ${item.serviceId}:`, error);
            continue;
          }
        }
      }
    }

    res.json(services);
  } catch (error) {
    console.error('Error fetching customer services:', error);
    res.status(500).json({
      message: error.message || 'Error retrieving customer services'
    });
  }
};

// Voice integration - Get customer by phone number
const getCustomerByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalized = phoneNumber.replace(/[^0-9+]/g, '');
    
    console.log('[CustomerService] Looking up customer by phone:', normalized);
    
    // Search across multiple phone fields
    const customer = await Customer.findOne({
      $or: [
        { phone: normalized },
        { phone: phoneNumber }, // Try original format too
        { mobile: normalized },
        { mobile: phoneNumber },
        { alternativePhone: normalized },
        { alternativePhone: phoneNumber }
      ]
    }).lean();
    
    if (!customer) {
      return res.json({ 
        success: false, 
        message: 'Customer not found'
      });
    }
    
    // Fetch call history for this customer
    const VoiceCalls = modelRegistry.getModel('voice_calls');
    const calls = await VoiceCalls.find({
      $or: [
        { from: { $in: [normalized, phoneNumber] } },
        { to: { $in: [normalized, phoneNumber] } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    console.log(`[CustomerService] Found customer ${customer._id} with ${calls.length} call records`);
    
    res.json({
      success: true,
      customer,
      calls,
      totalCalls: calls.length
    });
    
  } catch (error) {
    console.error('[CustomerService] Error fetching customer by phone:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error retrieving customer'
    });
  }
};

// Delete customer (soft delete recommended)
const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?._id; // From extractTokenDetails middleware

    // Check if customer exists
    const customer = await customerRepository.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check for dependencies (orders)
    const ordersRepository = require('../../../database/mongo/repositories/orders.repository');
    const orderCount = await ordersRepository.Orders.countDocuments({ customerId });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${orderCount} existing orders. Please archive the customer instead.`
      });
    }

    // Perform soft delete (recommended approach)
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        status: 'ARCHIVED',
        archivedAt: new Date(),
        archivedBy: userId
      },
      { new: true }
    );

    console.log(`[CustomerService] Customer ${customerId} archived by user ${userId}`);

    res.json({
      success: true,
      message: 'Customer archived successfully',
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('[CustomerService] Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting customer'
    });
  }
};

// Get customer history (calls, chats, status changes)
const getCustomerHistory = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Fetch the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const history = [];

    // 1. Add status changes from customer.statusHistory
    if (customer.statusHistory && customer.statusHistory.length > 0) {
      customer.statusHistory.forEach(change => {
        history.push({
          type: 'status_change',
          title: 'Status Updated',
          description: `${change.previousStatus || 'Initial'} → ${change.newStatus}`,
          reason: change.reason,
          timestamp: change.timestamp,
          automatic: change.automatic
        });
      });
    }

    // 2. Add order events
    const orders = await ordersRepository.Orders.find({ customerId }).lean();
    orders.forEach(order => {
      history.push({
        type: 'order',
        title: 'Order Created',
        description: `Order #${order._id.toString().slice(-8)} - £${order.grandTotalToPay?.toFixed(2) || '0.00'}`,
        timestamp: order.createdAt,
        orderId: order._id
      });
    });

    // 3. Add voice call history
    try {
      const VoiceCalls = modelRegistry.getModel('voice_calls');
      const calls = await VoiceCalls.find({ customerId }).sort({ createdAt: -1 }).lean();
      
      calls.forEach(call => {
        history.push({
          type: 'contact',
          title: 'Phone Call',
          description: `${call.direction} call - ${call.duration ? `${call.duration}s` : 'No answer'}`,
          timestamp: call.createdAt,
          callSid: call.callSid,
          status: call.status
        });
      });
    } catch (error) {
      console.log('[CustomerHistory] Voice calls model not available:', error.message);
    }

    // 4. Add notes from orders (if any order has notes)
    orders.forEach(order => {
      if (order.notes) {
        history.push({
          type: 'note',
          title: 'Order Note',
          description: order.notes,
          timestamp: order.updatedAt || order.createdAt,
          orderId: order._id
        });
      }
    });

    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(history);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    res.status(500).json({
      error: error.message || 'Error retrieving customer history'
    });
  }
};

module.exports = {
  Customer,
  createCustomer,
  searchCustomers,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
  getCustomerBookings,
  getCustomerServices,
  getCustomerByPhone,
  getCustomerHistory
};
