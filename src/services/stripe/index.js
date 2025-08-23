/**
 * Centralized Stripe Service
 * 
 * This service combines both frontend and backend Stripe functionality
 * to provide a unified interface for all Stripe operations.
 */
import { loadStripe } from '@stripe/stripe-js';
import axios from "../../axiosConfig";

// Singleton pattern for Stripe instance
let stripePromise = null;

/**
 * Get or initialize the Stripe instance
 * @returns {Promise<Stripe>} Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is missing');
      throw new Error('Stripe configuration is missing');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Create a payment intent
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment intent data
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    // Add automatic_payment_methods parameter to enable all available payment methods
    const requestData = {
      ...paymentData,
      automatic_payment_methods: { enabled: true }
    };

    const response = await axios.post('/v1/payments/create-payment-intent', requestData);
    return {
      success: true,
      ...response.data,
      clientSecret: response.data.client_secret,
      paymentIntentId: response.data.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Could not create payment intent'
    };
  }
};

/**
 * Confirm a payment with Stripe Elements
 * @param {Object} options - Confirmation options
 * @returns {Promise<Object>} Payment confirmation result
 */
export const confirmElementsPayment = async (options) => {
  const stripe = await getStripe();
  try {
    const { error, paymentIntent } = await stripe.confirmPayment(options);

    if (error) {
      return {
        success: false,
        error: error.message || 'Payment confirmation failed'
      };
    }

    return {
      success: true,
      paymentIntent,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error.message || 'Payment confirmation failed'
    };
  }
};

/**
 * Confirm a payment with the API
 * @param {Object} paymentData - Payment confirmation data
 * @returns {Promise<Object>} Payment confirmation result
 */
export const confirmApiPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `/api/v1/payments/confirm-payment/${paymentData.paymentIntentId}`, 
      paymentData
    );
    
    return {
      success: true,
      ...response.data,
      status: response.data.status || 'succeeded'
    };
  } catch (error) {
    console.error('Error confirming payment with API:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment confirmation failed'
    };
  }
};

/**
 * Retrieve a payment intent
 * @param {string} clientSecret - Client secret
 * @returns {Promise<Object>} Payment intent
 */
export const retrievePaymentIntent = async (clientSecret) => {
  const stripe = await getStripe();
  try {
    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      paymentIntent,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Error retrieving PaymentIntent:', error);
    return {
      success: false,
      error: error.message || 'Could not retrieve payment information'
    };
  }
};

/**
 * Get payment methods for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Customer payment methods
 */
export const getCustomerPaymentMethods = async (customerId) => {
  try {
    const response = await axios.get(`/api/v1/payments/payment-methods/${customerId}`);
    return {
      success: true,
      paymentMethods: response.data
    };
  } catch (error) {
    console.error('Error getting customer payment methods:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Could not retrieve payment methods'
    };
  }
};

/**
 * Delete a payment method
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Deletion result
 */
export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await axios.delete(`/api/v1/payments/payment-methods/${paymentMethodId}`);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Could not delete payment method'
    };
  }
};

// Create a named object for export
const StripeService = {
  getStripe,
  createPaymentIntent,
  confirmElementsPayment,
  confirmApiPayment,
  retrievePaymentIntent,
  getCustomerPaymentMethods,
  deletePaymentMethod
};

// Export the named object as default
export default StripeService;
