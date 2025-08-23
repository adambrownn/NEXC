/**
 * Backend Stripe integration service
 * Provides standardized Stripe API functionality for payment processing
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PAYMENT_METHOD_ORDER, PAYMENT_METHOD_TYPES } = require('../../constants/paymentConstants');
const { standardizeAmountToPence } = require('../../utils/dataNormalization');

/**
 * Returns the Stripe instance
 * @returns {Object} Stripe API instance
 */
const getStripe = () => {
  return stripe;
};

/**
 * Creates a payment intent with standardized configuration
 * @param {number|string} amount - Amount in pounds (will be converted to pence if needed)
 * @param {string} currency - Currency code (default: gbp)
 * @param {Object} customer - Customer object
 * @param {Object} metadata - Additional metadata for the payment intent
 * @param {string} paymentMethod - Optional payment method ID for immediate confirmation
 * @param {boolean} confirm - Whether to confirm the payment intent immediately
 * @param {boolean} automatic_payment_methods - Whether to enable automatic payment methods
 * @returns {Object} Stripe payment intent
 */
const createPaymentIntent = async (
  amount,
  currency = 'gbp',
  customer,
  metadata,
  paymentMethod = null,
  confirm = false,
  automatic_payment_methods = false // Changed default to false to use explicit method list
) => {
  try {
    // Ensure amount is in pence
    const amountInPence = standardizeAmountToPence(amount);

    // Base payment intent parameters
    const paymentIntentParams = {
      amount: amountInPence,
      currency,
      metadata: metadata || {},
    };

    // Configure payment methods using the shared constant
    if (automatic_payment_methods) {
      paymentIntentParams.automatic_payment_methods = { enabled: true };
    } else {
      // Use the standardized payment method order from constants
      paymentIntentParams.payment_method_types = PAYMENT_METHOD_ORDER;
    }

    // Add customer if provided
    if (customer?.id) {
      paymentIntentParams.customer = customer.id;
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // If confirmation is requested and payment method is provided
    if (confirm && paymentMethod) {
      return await confirmPaymentIntent(paymentIntent.id, paymentMethod);
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirms a payment intent
 * @param {string} paymentIntentId - The payment intent ID to confirm
 * @param {string} paymentMethodId - The payment method ID to use
 * @returns {Object} Confirmed payment intent
 */
const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  try {
    return await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

/**
 * Retrieves a payment intent
 * @param {string} paymentIntentId - The payment intent ID to retrieve
 * @returns {Object} Payment intent
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Update payment intent with consistent error handling
 * @param {string} paymentIntentId - The payment intent ID
 * @param {Object} updateParams - The parameters to update
 * @returns {Object} Updated payment intent
 */
const updatePaymentIntent = async (paymentIntentId, updateParams) => {
  try {
    return await stripe.paymentIntents.update(paymentIntentId, updateParams);
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw error;
  }
};

const createCustomer = async (customerData) => {
  try {
    const customer = await stripe.customers.create(customerData);
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

const retrieveCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    throw error;
  }
};

// Export all functions and constants
module.exports = {
  getStripe,
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,
  updatePaymentIntent,
  createCustomer,
  retrieveCustomer,
  PAYMENT_METHOD_ORDER, // Export the shared constant
  PAYMENT_METHOD_TYPES  // Export payment method types
};