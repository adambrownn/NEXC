/**
 * Basic data normalization utilities
 * CommonJS version for backend compatibility
 */

const { 
  getId, 
  getCustomerName, 
  getCustomerEmail, 
  getOrderAmount, 
  getOrderReference,
  getCustomerId,
  getCustomerPhone
} = require('./propertyAccessUtils');

/**
 * Normalize order object to ensure consistent property names
 * @param {Object} order - Raw order object
 * @returns {Object} - Normalized order object
 */
const normalizeOrderObject = (order) => {
  if (!order) return {};

  return {
    id: getId(order),
    customerId: getCustomerId(order),
    customer: order.customer || {},
    items: Array.isArray(order.items) ? order.items : 
           Array.isArray(order.services) ? order.services : [],
    amount: getOrderAmount(order),
    status: order.status || 'pending',
    paymentStatus: order.paymentStatus || 0,
    orderReference: getOrderReference(order),
    orderType: order.orderType || 'ONLINE',
    
    // Group Booking Fields
    isGroupBooking: order.isGroupBooking || false,
    organizationName: order.organizationName || '',
    bookingContact: order.bookingContact || null,
    recipientIds: Array.isArray(order.recipientIds) ? order.recipientIds : [],
    groupBookingNotes: order.groupBookingNotes || '',
    
    createdAt: order.createdAt || order.created_at || new Date(),
    updatedAt: order.updatedAt || order.updated_at || new Date(),
    ...order // Keep any additional properties
  };
};

/**
 * Normalize customer object to ensure consistent property names
 * @param {Object} customer - Raw customer object
 * @returns {Object} - Normalized customer object
 */
const normalizeCustomerObject = (customer) => {
  if (!customer) return {};

  const firstName = customer.firstName || customer.first_name || '';
  const lastName = customer.lastName || customer.last_name || '';

  return {
    id: getId(customer),
    name: getCustomerName(customer),
    firstName: firstName,
    lastName: lastName,
    email: getCustomerEmail(customer),
    phoneNumber: getCustomerPhone(customer),
    address: customer.address || '',
    dateOfBirth: customer.dateOfBirth || customer.dob || '',
    ...customer // Keep any additional properties
  };
};

/**
 * Convert pounds to pence (multiply by 100)
 * @param {number} pounds - Amount in pounds
 * @returns {number} - Amount in pence
 */
const poundsToPence = (pounds) => {
  return Math.round((parseFloat(pounds) || 0) * 100);
};

/**
 * Convert pence to pounds (divide by 100)
 * @param {number} pence - Amount in pence
 * @returns {number} - Amount in pounds
 */
const penceToPounds = (pence) => {
  return (parseFloat(pence) || 0) / 100;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: GBP)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseFloat(amount) || 0);
};

/**
 * Prepare amount for display (always in pounds with currency symbol)
 * @param {number} amount - Amount in pounds
 * @returns {string} - Formatted amount for display
 */
const prepareAmountForDisplay = (amount) => {
  return formatCurrency(amount);
};

/**
 * Prepare amount for API (convert to pence for payment processors)
 * @param {number} amount - Amount in pounds
 * @returns {number} - Amount in pence for API
 */
const prepareAmountForApi = (amount) => {
  return poundsToPence(amount);
};

/**
 * Simple performance measurement utility
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Function to measure
 * @returns {any} - Result of the function
 */
const measurePerformance = (label, fn) => {
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    const result = fn();
    const end = Date.now();
    console.log(`⏱️ [Performance] ${label}: ${(end - start)}ms`);
    return result;
  }
  return fn();
};

/**
 * Normalize order item with recipient details for group bookings
 * @param {Object} item - Order item
 * @param {Object} fallbackCustomer - Fallback customer if no recipient specified
 * @returns {Object} - Normalized item with recipient
 */
const normalizeOrderItem = (item, fallbackCustomer = null) => {
  if (!item) return {};

  const recipient = item.recipientDetails && item.recipientDetails.firstName
    ? item.recipientDetails
    : item.recipientId
      ? null
      : fallbackCustomer;

  return {
    id: getId(item),
    title: item.title || item.name || '',
    serviceType: item.serviceType || item.type || 'card',
    price: parseFloat(item.price) || 0,
    quantity: item.quantity || 1,
    status: item.status || 'ordered',
    recipientId: item.recipientId || null,
    recipientDetails: item.recipientDetails || null,
    recipientName: recipient 
      ? `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() 
      : '',
    cardDetails: item.cardDetails || null,
    testDetails: item.testDetails || null,
    courseDetails: item.courseDetails || null,
    qualificationDetails: item.qualificationDetails || null,
    assignedTo: item.assignedTo || null,
    scheduledDate: item.scheduledDate || null,
    ...item
  };
};

/**
 * Check if an order is a group booking
 * @param {Object} order - Order object
 * @returns {boolean}
 */
const isGroupBookingOrder = (order) => {
  if (!order) return false;
  return order.isGroupBooking === true || 
         (Array.isArray(order.recipientIds) && order.recipientIds.length > 1);
};

/**
 * Get unique recipients from order items
 * @param {Array} items - Order items array
 * @returns {Array} - Unique recipient details
 */
const getUniqueRecipients = (items) => {
  if (!Array.isArray(items)) return [];
  
  const recipientMap = new Map();
  
  items.forEach(item => {
    if (item.recipientId) {
      recipientMap.set(String(item.recipientId), item.recipientDetails || { id: item.recipientId });
    }
  });
  
  return Array.from(recipientMap.values());
};

// CommonJS exports ONLY for backend
module.exports = {
  normalizeOrderObject,
  normalizeCustomerObject,
  normalizeOrderItem,
  isGroupBookingOrder,
  getUniqueRecipients,
  poundsToPence,
  penceToPounds,
  formatCurrency,
  prepareAmountForDisplay,
  prepareAmountForApi,
  measurePerformance
};