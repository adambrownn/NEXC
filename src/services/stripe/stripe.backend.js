/**
 * Backend Stripe integration service
 * Provides standardized Stripe API functionality for payment processing
 * 
 * Best Practices Implemented:
 * - Automatic payment methods for maximum conversion
 * - Idempotency keys for safe retries
 * - Detailed metadata for tracking
 * - Statement descriptor for clear bank statements
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Pin API version for stability
  maxNetworkRetries: 2, // Auto-retry on network failures
});
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
 * Generate an idempotency key for safe retries
 * @param {string} orderId - Order ID
 * @param {string} action - Action type
 * @returns {string} Idempotency key
 */
const generateIdempotencyKey = (orderId, action = 'payment') => {
  return `${orderId}_${action}_${Date.now()}`;
};

/**
 * Creates a payment intent with standardized configuration
 * Uses Stripe best practices for maximum payment success rate:
 * - Automatic payment methods (recommended by Stripe)
 * - Customer billing details capture
 * - Statement descriptor for clear bank statements
 * - Metadata for tracking and debugging
 * 
 * @param {number|string} amount - Amount in pounds (will be converted to pence if needed)
 * @param {string} currency - Currency code (default: gbp)
 * @param {Object} customer - Customer object
 * @param {Object} metadata - Additional metadata for the payment intent
 * @param {string} paymentMethod - Optional payment method ID for immediate confirmation
 * @param {boolean} confirm - Whether to confirm the payment intent immediately
 * @param {boolean} automatic_payment_methods - Whether to enable automatic payment methods (default: true for best conversion)
 * @returns {Object} Stripe payment intent
 */
const createPaymentIntent = async (
  amount,
  currency = 'gbp',
  customer,
  metadata,
  paymentMethod = null,
  confirm = false,
  automatic_payment_methods = true // Default to true for best conversion rates
) => {
  try {
    // Ensure amount is in pence
    const amountInPence = standardizeAmountToPence(amount);
    
    // Validate amount
    if (amountInPence < 30) { // Stripe minimum is 30p for GBP
      throw new Error('Amount must be at least £0.30');
    }

    // Base payment intent parameters with best practices
    const paymentIntentParams = {
      amount: amountInPence,
      currency,
      metadata: {
        ...metadata,
        platform: 'nexc',
        created: new Date().toISOString(),
      },
      // Statement descriptor appears on customer bank statements (max 22 chars)
      statement_descriptor_suffix: 'NEXC Training',
      // Capture method - capture immediately after authorization
      capture_method: 'automatic',
    };

    // Enable automatic payment methods (Stripe recommended for best conversion)
    // This allows Stripe to dynamically show the most relevant payment methods
    if (automatic_payment_methods) {
      paymentIntentParams.automatic_payment_methods = { 
        enabled: true,
        allow_redirects: 'always' // Allow redirect-based payment methods
      };
    } else {
      // Fallback to explicit payment method list
      paymentIntentParams.payment_method_types = PAYMENT_METHOD_ORDER;
    }

    // Add customer if provided (improves fraud detection)
    if (customer?.id) {
      paymentIntentParams.customer = customer.id;
    }
    
    // Add receipt email if available (sends automatic receipts)
    if (metadata?.customerEmail || metadata?.email) {
      paymentIntentParams.receipt_email = metadata.customerEmail || metadata.email;
    }

    // Generate idempotency key for safe retries
    const idempotencyKey = metadata?.orderId 
      ? generateIdempotencyKey(metadata.orderId, 'create')
      : undefined;

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
      idempotencyKey ? { idempotencyKey } : undefined
    );

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