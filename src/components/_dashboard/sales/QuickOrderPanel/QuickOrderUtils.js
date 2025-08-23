import axiosInstance from '../../../../axiosConfig';
import { loadStripe } from '@stripe/stripe-js';

/**
 * Fetches order details from the API
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise<Object>} - The order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    if (!orderId || typeof orderId !== 'string') {
      console.error('Invalid orderId:', orderId);
      return null;
    }
    const response = await axiosInstance.get(`/v1/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

/**
 * Gets the Stripe promise for payment processing
 * @returns {Promise} - The Stripe promise
 */
export const getStripePromise = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error('Stripe publishable key is not set in environment variables');
    return null;
  }
  return loadStripe(key);
};

// Initialize the Stripe promise
export const stripePromise = getStripePromise();

/**
 * Generates a unique order reference
 * @returns {string} - The generated order reference
 */
export const generateOrderReference = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generates references for each service in an order
 * @param {string} orderRef - The order reference
 * @param {Array} services - The services to generate references for
 * @returns {Object} - Object mapping service IDs to their references
 */
export const generateServiceReferences = (orderRef, services) => {
  if (!orderRef || !services || !Array.isArray(services)) {
    return {};
  }
  
  return services.reduce((refs, service, index) => {
    const serviceId = service._id || service.id;
    refs[serviceId] = `${orderRef}-S${(index + 1).toString().padStart(2, '0')}`;
    return refs;
  }, {});
};

/**
 * Formats a price for display
 * @param {number} price - The price to format
 * @returns {string} - The formatted price
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Calculates the total price of selected services
 * @param {Array} services - The selected services
 * @returns {number} - The total price
 */
export const calculateTotalPrice = (services) => {
  if (!services || !Array.isArray(services)) {
    return 0;
  }
  
  return services.reduce((total, service) => {
    const price = parseFloat(service.price || 0);
    return total + price;
  }, 0);
};

/**
 * Validates if a customer object has all required fields
 * @param {Object} customer - The customer object to validate
 * @returns {boolean} - Whether the customer is valid
 */
export const isValidCustomer = (customer) => {
  if (!customer) return false;
  
  const requiredFields = ['name', 'email', 'phone'];
  return requiredFields.every(field => customer[field] && customer[field].trim() !== '');
};

/**
 * Validates if service details are complete for a given service
 * @param {Object} service - The service to validate
 * @param {Object} serviceDetails - The details for the service
 * @returns {boolean} - Whether the details are complete
 */
export const isServiceDetailsComplete = (service, serviceDetails) => {
  if (!service || !serviceDetails) return false;
  
  const serviceId = service._id || service.id;
  const details = serviceDetails[serviceId] || {};
  
  // Different validation based on service type
  switch (service.type) {
    case 'card':
      return details.cardDetails && details.cardDetails.cardType;
    case 'test':
      return details.testDetails && details.testDetails.testDate;
    case 'course':
      return details.courseDetails && details.courseDetails.startDate;
    case 'qualification':
      return details.qualificationDetails && details.qualificationDetails.level;
    default:
      return true;
  }
};