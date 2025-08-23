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

    // TODO: Implement logic to fetch customer services
    // This is a placeholder implementation. You'll need to replace this with actual logic to fetch services.
    const services = []; // Replace this with actual service fetching logic

    res.json(services);
  } catch (error) {
    console.error('Error fetching customer services:', error);
    res.status(500).json({
      message: error.message || 'Error retrieving customer services'
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
  getCustomerBookings,
  getCustomerServices
};
