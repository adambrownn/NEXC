/**
 * Payment Service
 * Centralizes all payment-related API calls for the NEXC e-commerce application
 * Handles both customer-facing e-commerce payments and staff-created orders
 */
import axios from 'axios';
import axiosInstance from '../../axiosConfig';
import StripeService from '../stripe';

// Add imports for normalization utilities
import {
  normalizeOrderObject,
  normalizeCustomerObject,
  prepareAmountForApi
} from '../../utils/dataNormalization';

// Add imports for error handling
import { handlePaymentError } from '../../utils/paymentErrorUtils';

/**
 * Creates a payment intent with standardized data and error handling
 * @param {Object} paymentData - Payment data 
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    // Normalize data
    const normalizedCustomer = normalizeCustomerObject(paymentData.customer);

    // Ensure amount is in pence
    const amountInPence = prepareAmountForApi(paymentData.amount);

    // Prepare request data
    const requestData = {
      amount: amountInPence,
      currency: paymentData.currency || 'gbp',
      customer: {
        id: normalizedCustomer?.id,
        email: normalizedCustomer?.email
      },
      metadata: {
        orderId: paymentData.orderId,
        isStaffCreated: paymentData.isStaffCreated || false
      }
    };

    // Make API call
    const response = await fetch('/api/v1/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment intent: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // Use standardized error handling
    return handlePaymentError(error);
  }
};

/**
 * Confirms payment with standardized error handling
 */
export const confirmPayment = async (paymentData) => {
  try {
    // Normalize customer data
    const normalizedCustomer = normalizeCustomerObject(paymentData.customer);

    // Prepare request data
    const requestData = {
      paymentIntentId: paymentData.paymentIntentId,
      paymentMethodId: paymentData.paymentMethodId,
      customerId: normalizedCustomer?.id,
      saveCard: paymentData.saveCard || false,
      isStaffCreated: paymentData.isStaffCreated || false
    };

    // Make API call
    const response = await fetch('/api/v1/payments/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm payment: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // Use standardized error handling
    return handlePaymentError(error);
  }
};

// Cancel a payment
export const cancelPayment = async (paymentIntentId) => {
  try {
    // Call the cancel payment API
    await axios.post(`/api/v1/payments/cancel-payment/${paymentIntentId}`);

    return {
      success: true,
      status: 'cancelled'
    };
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to cancel payment'
    };
  }
};

// Refund a payment
export const refundPayment = async (paymentIntentId, amount) => {
  try {
    // Call the refund payment API
    await axios.post(`/api/v1/payments/refund-payment/${paymentIntentId}`, {
      amount
    });

    return {
      success: true,
      status: 'refunded'
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to process refund'
    };
  }
};

/**
 * Get payment status
 * @param {string} paymentIntentId - Payment intent ID
 * @param {string} clientSecret - Client secret (optional)
 * @returns {Promise<Object>} - Response with payment status
 */
export const getPaymentStatus = async (paymentIntentId, clientSecret) => {
  try {
    // If we have a client secret, use the Stripe service for more detailed status
    if (clientSecret) {
      return await StripeService.retrievePaymentIntent(clientSecret);
    } else {
      // Otherwise, use the API
      const response = await axios.get(`/api/v1/payments/status/${paymentIntentId}`);

      return {
        success: true,
        status: response.data.status,
        paymentIntent: response.data
      };
    }
  } catch (error) {
    console.error('Error getting payment status:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to retrieve payment status'
    };
  }
};

/**
 * Get customer payment methods
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} - Response with payment methods
 */
export const getCustomerPaymentMethods = async (customerId) => {
  // Use the centralized Stripe service for e-commerce customers
  if (customerId.startsWith('cus_')) {
    return await StripeService.getCustomerPaymentMethods(customerId);
  }

  // For staff-created orders, use the admin endpoint
  try {
    const response = await axiosInstance.get(`/payments/customer/${customerId}/payment-methods`);

    return {
      success: true,
      paymentMethods: response.data.paymentMethods || []
    };
  } catch (error) {
    console.error('Error getting customer payment methods:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get payment methods'
    };
  }
};

/**
 * Delete a payment method
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} - Response with deletion status
 */
export const deletePaymentMethod = async (paymentMethodId) => {
  // Use the centralized Stripe service for e-commerce payment methods
  if (paymentMethodId.startsWith('pm_')) {
    return await StripeService.deletePaymentMethod(paymentMethodId);
  }

  // For staff-created orders, use the admin endpoint
  try {
    await axiosInstance.delete(`/payments/payment-methods/${paymentMethodId}`);

    return {
      success: true,
      status: 'deleted'
    };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete payment method'
    };
  }
};

/**
 * Set default payment method
 * @param {string} customerId - Customer ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} - Response with update status
 */
export const setDefaultPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    await axiosInstance.post(`/payments/customer/${customerId}/default-payment-method`, {
      paymentMethodId
    });

    return {
      success: true,
      status: 'updated'
    };
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to set default payment method'
    };
  }
};

// Create a named object for export
const PaymentService = {
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
  refundPayment,
  getPaymentStatus,
  getCustomerPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
};

// Export the named object as default
export default PaymentService;
