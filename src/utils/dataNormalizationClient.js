/**
 * Frontend ES6 wrapper for data normalization utilities
 * This file provides ES6 exports for the React frontend
 */

/**
 * Get ID from an object with various possible property names
 */
export const getId = (obj) => {
  if (!obj) return null;
  return obj._id || obj.id || obj.userId || obj.customerId || obj.orderId || null;
};

/**
 * Get customer email from various property formats
 */
export const getCustomerEmail = (customer) => {
  if (!customer) return '';
  return customer.email || customer.emailAddress || customer.customerEmail || customer.Email || '';
};

/**
 * Get customer name from various property formats
 */
export const getCustomerName = (customer) => {
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
 */
export const getOrderAmount = (order) => {
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
 */
export const getOrderReference = (order) => {
  if (!order) return '';
  return order.orderReference || order.reference || order.orderRef || order.orderNumber || order.orderNo || '';
};

/**
 * Normalize order object to ensure consistent property names
 */
export const normalizeOrderObject = (order) => {
  if (!order) return {};

  return {
    id: getId(order),
    customerId: order.customerId || order.customer_id || getId(order.customer),
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
    ...order
  };
};

/**
 * Normalize customer object to ensure consistent property names
 */
export const normalizeCustomerObject = (customer) => {
  if (!customer) return {};

  const firstName = customer.firstName || customer.first_name || '';
  const lastName = customer.lastName || customer.last_name || '';

  return {
    id: getId(customer),
    name: getCustomerName(customer),
    firstName: firstName,
    lastName: lastName,
    email: getCustomerEmail(customer),
    phoneNumber: customer.phoneNumber || customer.phone || customer.mobile || customer.contactNumber || '',
    address: customer.address || '',
    dateOfBirth: customer.dateOfBirth || customer.dob || '',
    ...customer
  };
};

/**
 * Prepare amount for API (convert to pence)
 */
export const prepareAmountForApi = (amount) => {
  return Math.round((parseFloat(amount) || 0) * 100);
};

/**
 * Prepare amount for display (format as currency)
 */
export const prepareAmountForDisplay = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseFloat(amount) || 0);
};

/**
 * Normalize order item with recipient details for group bookings
 * @param {Object} item - Order item
 * @param {Object} fallbackCustomer - Fallback customer if no recipient specified
 * @returns {Object} - Normalized item with recipient
 */
export const normalizeOrderItem = (item, fallbackCustomer = null) => {
  if (!item) return {};

  // Determine recipient - use item's recipientDetails if available, otherwise fallback
  const recipient = item.recipientDetails && item.recipientDetails.firstName
    ? item.recipientDetails
    : item.recipientId
      ? null // Will need to be populated from recipientId
      : fallbackCustomer;

  return {
    id: getId(item),
    title: item.title || item.name || '',
    serviceType: item.serviceType || item.type || 'card',
    price: parseFloat(item.price) || 0,
    quantity: item.quantity || 1,
    status: item.status || 'ordered',
    
    // Recipient information
    recipientId: item.recipientId || null,
    recipientDetails: item.recipientDetails || null,
    recipientName: recipient 
      ? `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() 
      : '',
    
    // Service-specific details
    cardDetails: item.cardDetails || null,
    testDetails: item.testDetails || null,
    courseDetails: item.courseDetails || null,
    qualificationDetails: item.qualificationDetails || null,
    
    // Assignment
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
export const isGroupBookingOrder = (order) => {
  if (!order) return false;
  return order.isGroupBooking === true || 
         (Array.isArray(order.recipientIds) && order.recipientIds.length > 1);
};

/**
 * Get unique recipients from order items
 * @param {Array} items - Order items array
 * @returns {Array} - Unique recipient details
 */
export const getUniqueRecipients = (items) => {
  if (!Array.isArray(items)) return [];
  
  const recipientMap = new Map();
  
  items.forEach(item => {
    if (item.recipientId) {
      recipientMap.set(String(item.recipientId), item.recipientDetails || { id: item.recipientId });
    }
  });
  
  return Array.from(recipientMap.values());
};
