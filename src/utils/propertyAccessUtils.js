/**
 * Property Access Utilities
 * 
 * This module provides standardized accessors for object properties
 * that may have inconsistent naming across the application.
 * Instead of directly accessing properties like obj.id or obj._id,
 * use these utilities to ensure consistent access.
 */

/**
 * Gets the ID from an object that might use either 'id' or '_id'
 * @param {Object} obj - Object to get ID from 
 * @param {string} [defaultValue=null] - Default value if no ID is found
 * @returns {string|null} The ID value or default
 */
const getId = (obj, defaultValue = null) => {
    if (!obj) return defaultValue;
    return obj._id || obj.id || defaultValue;
};

/**
 * Gets the amount from an order object that might use various property names
 * @param {Object} order - Order object
 * @param {number} [defaultValue=0] - Default value if no amount is found
 * @returns {number} The amount value
 */
const getOrderAmount = (order, defaultValue = 0) => {
    if (!order) return defaultValue;

    // Return the first defined amount property
    return order.amount || order.grandTotalToPay || order.itemsTotal || defaultValue;
};

/**
 * Gets the customer ID from various possible sources
 * @param {Object} data - Object that might contain customer information
 * @param {string} [defaultValue=null] - Default value if no customer ID is found
 * @returns {string|null} The customer ID value
 */
const getCustomerId = (data, defaultValue = null) => {
    if (!data) return defaultValue;

    // Check direct customerId property
    if (data.customerId) return data.customerId;

    // Check nested customer object
    if (data.customer) {
        return getId(data.customer, defaultValue);
    }

    return defaultValue;
};

/**
 * Gets the order reference from an order object
 * @param {Object} order - Order object
 * @param {string} [defaultValue='N/A'] - Default value if no reference is found
 * @returns {string} The order reference
 */
const getOrderReference = (order, defaultValue = 'N/A') => {
    if (!order) return defaultValue;

    return order.orderReference || order.reference || defaultValue;
};

/**
 * Gets formatted name from a customer object
 * @param {Object} customer - Customer object 
 * @param {string} [defaultValue=''] - Default value if no name is found
 * @returns {string} Formatted name
 */
const getCustomerName = (customer, defaultValue = '') => {
    if (!customer) return defaultValue;

    if (customer.name) return customer.name;

    const firstName = customer.firstName || '';
    const lastName = customer.lastName || '';

    if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
    }

    return defaultValue;
};

/**
 * Gets customer email from various possible sources
 * @param {Object} data - Object that might contain customer information
 * @param {string} [defaultValue=''] - Default value if no email is found
 * @returns {string} The email value
 */
const getCustomerEmail = (data, defaultValue = '') => {
    if (!data) return defaultValue;

    if (data.email) return data.email;

    if (data.customer && data.customer.email) {
        return data.customer.email;
    }

    return defaultValue;
};

module.exports = {
    getId,
    getOrderAmount,
    getCustomerId,
    getOrderReference,
    getCustomerName
};