const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const modelRegistry = require('../modelRegistry');

// Helper function to check connection and model state
const checkState = () => {
    const state = {
        connectionState: mongoose.connection.readyState,
        modelRegistryInitialized: modelRegistry.areModelsInitialized(),
        customerModel: Customer ? 'Loaded' : 'Not loaded',
        customerModelMethods: Customer ? Object.keys(Customer) : []
    };
    console.log('[CustomerRepository] State:', JSON.stringify(state, null, 2));
    return state;
};

// Helper function to verify model state before operations
const verifyModel = () => {
    const state = checkState();
    
    if (!Customer || !Customer.find) {
        console.error('[CustomerRepository] Customer model is not properly initialized');
        throw new Error('Customer model is not properly initialized. State: ' + JSON.stringify(state));
    }
    
    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB is not connected. State: ' + JSON.stringify(state));
    }
    
    return true;
};

// CREATE
exports.createCustomer = async (customerData) => {
    try {
        verifyModel();
        console.log('[CustomerRepository] Creating customer:', customerData);
        const customer = new Customer(customerData);
        const result = await customer.save();
        console.log('[CustomerRepository] Customer created successfully');
        return result;
    } catch (error) {
        console.error('[CustomerRepository] Error creating customer:', error);
        throw error;
    }
};

// READ
exports.getCustomers = async (query = {}) => {
    try {
        verifyModel();
        console.log('[CustomerRepository] Getting customers with query:', JSON.stringify(query));
        const result = await Customer.find(query).sort({ createdAt: -1 });
        console.log(`[CustomerRepository] Found ${result.length} customers`);
        return result;
    } catch (error) {
        console.error('[CustomerRepository] Error getting customers:', error);
        checkState();
        throw error;
    }
};

// Get customer by ID
exports.getCustomerById = async (customerId) => {
    try {
        verifyModel();
        console.log('[CustomerRepository] Getting customer by ID:', customerId);
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    } catch (error) {
        console.error('[CustomerRepository] Error getting customer by ID:', error);
        throw error;
    }
};

// UPDATE
exports.updateCustomer = async (customerId, updateData) => {
    try {
        verifyModel();
        console.log('[CustomerRepository] Updating customer:', customerId, updateData);
        const result = await Customer.findByIdAndUpdate(
            customerId,
            updateData,
            { new: true, runValidators: true }
        );
        if (!result) {
            throw new Error('Customer not found');
        }
        console.log('[CustomerRepository] Customer updated successfully');
        return result;
    } catch (error) {
        console.error('[CustomerRepository] Error updating customer:', error);
        throw error;
    }
};

// DELETE
exports.deleteCustomer = async (customerId) => {
    try {
        verifyModel();
        console.log('[CustomerRepository] Deleting customer:', customerId);
        const result = await Customer.findByIdAndDelete(customerId);
        if (!result) {
            throw new Error('Customer not found');
        }
        console.log('[CustomerRepository] Customer deleted successfully');
        return result;
    } catch (error) {
        console.error('[CustomerRepository] Error deleting customer:', error);
        throw error;
    }
};

// Export the model for direct access if needed
exports.Customer = Customer;
