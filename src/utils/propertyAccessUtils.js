/**
 * Utility functions to safely access object properties
 * CommonJS version for backend compatibility
 */

/**
 * Get ID from an object with various possible property names
 * @param {Object} obj - Object to extract ID from
 * @returns {string|null} - The ID value or null
 */
const getId = (obj) => {
  if (!obj) return null;
  
  return obj._id || 
         obj.id || 
         obj.userId || 
         obj.customerId || 
         obj.orderId || 
         null;
};

/**
 * Get customer email from various property formats
 * @param {Object} customer - Customer object
 * @returns {string} - Email address
 */
const getCustomerEmail = (customer) => {
  if (!customer) return '';
  
  return customer.email || 
         customer.emailAddress || 
         customer.customerEmail || 
         customer.Email || 
         '';
};

/**
 * Get customer name from various property formats
 * @param {Object} customer - Customer object
 * @returns {string} - Customer name
 */
const getCustomerName = (customer) => {
  if (!customer) return '';
  
  return customer.name || 
         customer.displayName ||
         customer.fullName ||
         (customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : '') ||
         customer.customerName ||
         '';
};

/**
 * Get order amount from various property formats
 * @param {Object} order - Order object
 * @returns {number} - Order amount
 */
const getOrderAmount = (order) => {
  if (!order) return 0;
  
  return parseFloat(
    order.amount ||
    order.grandTotalToPay ||
    order.itemsTotal ||
    order.total ||
    order.grandTotal ||
    order.totalAmount ||
    order.orderTotal ||
    0
  );
};

/**
 * Get order reference from various property formats
 * @param {Object} order - Order object
 * @returns {string} - Order reference
 */
const getOrderReference = (order) => {
  if (!order) return '';
  
  return order.orderReference ||
         order.reference ||
         order.orderRef ||
         order.orderNumber ||
         order.orderNo ||
         '';
};

/**
 * Get customer ID from various property formats
 * @param {Object} obj - Object to extract customer ID from
 * @returns {string|null} - The customer ID value or null
 */
const getCustomerId = (obj) => {
  if (!obj) return null;
  
  return obj.customerId || 
         obj.customer_id || 
         obj.customer?._id ||
         obj.customer?.id ||
         getId(obj.customer) ||
         null;
};

/**
 * Get customer phone from various property formats
 * @param {Object} customer - Customer object
 * @returns {string} - Phone number
 */
const getCustomerPhone = (customer) => {
  if (!customer) return '';
  
  return customer.phoneNumber ||
         customer.phone ||
         customer.mobile ||
         customer.contactNumber ||
         '';
};

// CommonJS exports ONLY for backend
module.exports = {
  getId,
  getCustomerEmail,
  getCustomerName,
  getOrderAmount,
  getOrderReference,
  getCustomerId,
  getCustomerPhone
};