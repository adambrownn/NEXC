/**
 * Sales Service
 * 
 * This service provides functionality related to the sales process
 * including customer management, service management, and payment processing.
 * 
 * All data handling follows standardized patterns:
 * - Customer data is normalized through normalizeCustomerObject()
 * - Order data is normalized through normalizeOrderObject()
 * - Monetary values are stored in pounds (£) with decimal points
 * - Payments are processed in pence (p) after conversion
 * - Error handling follows the standardized handlePaymentError pattern
 */

import axiosInstance from '../axiosConfig';
import PaymentService from './payment';
import { handlePaymentError } from '../utils/paymentErrorUtils';
import {
  normalizeOrderObject,
  normalizeCustomerObject,
  getId
} from '../utils/dataNormalizationClient';

class SalesService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Set initialized to true immediately to prevent multiple initialization attempts
    this.initialized = true;

    try {
      // Only check backend readiness when actually needed for trade services
      if (window.location.pathname.includes('/trades')) {
        const response = await axiosInstance.get('/trades/services', {
          params: {
            limit: 1,
            useRegistry: true
          }
        });

        if (!response.data || !response.data.success) {
          throw new Error('Backend services not ready');
        }
      }
    } catch (error) {
      console.error('Failed to initialize sales service:', error);
      this.initialized = false; // Reset initialized state on error
      throw new Error('Failed to initialize sales service. Please try again.');
    }
  }

  // Service Management
  async getServices(tradeId = '') {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/trades/services${tradeId ? `/${tradeId}` : ''}`, {
        params: {
          useRegistry: true
        }
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Invalid response format from server');
      }

      return this.transformServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getServices(tradeId);
      }
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch services';
      const errorObj = new Error(errorMessage);
      errorObj.statusCode = error.response?.status;
      errorObj.timestamp = new Date().toISOString();
      errorObj.endpoint = `/trades/services${tradeId ? `/${tradeId}` : ''}`;

      throw errorObj;
    }
  }

  async getTradeAssociations() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get('/trade-associations', {
        params: {
          useRegistry: true
        }
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Invalid response format from server');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching trade associations:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getTradeAssociations();
      }
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch trade associations';
      const errorObj = new Error(errorMessage);
      errorObj.statusCode = error.response?.status;
      errorObj.timestamp = new Date().toISOString();
      errorObj.endpoint = '/trade-associations';

      throw errorObj;
    }
  }

  transformServices(data) {
    const { cards = [], courses = [], tests = [], associatedServiceIds = [] } = data;

    // Transform based on model registry schema with standardized property access
    const transformedCards = cards.map(card => ({
      ...card,
      id: getId(card), // Use getId instead of direct access
      name: card.title || card.name, // Support both title and name fields
      price: parseFloat(card.price) || 0,
      category: 'cards',
      description: card.description,
      status: card.status || 'active',
      validityPeriod: card.validityPeriod || '1 year',
      prerequisites: Array.isArray(card.prerequisites) ? card.prerequisites : [],
      tradeAssociations: Array.isArray(card.tradeAssociations) ? card.tradeAssociations : [],
      isAssociated: associatedServiceIds.includes(getId(card)), // Use getId here too
      metadata: card.metadata || {}
    }));

    const transformedCourses = courses.map(course => ({
      ...course,
      id: getId(course),
      name: course.title || course.name,
      price: parseFloat(course.price) || 0,
      category: 'courses',
      description: course.description,
      status: course.status || 'active',
      validityPeriod: course.validityPeriod || '1 year',
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
      tradeAssociations: Array.isArray(course.tradeAssociations) ? course.tradeAssociations : [],
      isAssociated: associatedServiceIds.includes(getId(course)),
      metadata: course.metadata || {}
    }));

    const transformedTests = tests.map(test => ({
      ...test,
      id: getId(test),
      name: test.title || test.name,
      price: parseFloat(test.price) || 0,
      category: 'tests',
      description: test.description,
      status: test.status || 'active',
      validityPeriod: test.validityPeriod || '1 year',
      prerequisites: Array.isArray(test.prerequisites) ? test.prerequisites : [],
      tradeAssociations: Array.isArray(test.tradeAssociations) ? test.tradeAssociations : [],
      isAssociated: associatedServiceIds.includes(getId(test)),
      metadata: test.metadata || {}
    }));

    return [...transformedCards, ...transformedCourses, ...transformedTests];
  }

  // Customer Management
  async searchCustomers(query) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/trades/customers`, {
        params: {
          search: query,
          useRegistry: true
        }
      });

      const customers = Array.isArray(response.data) ? response.data : response.data.customers || [];

      return customers.map(customer => ({
        ...customer,
        id: customer._id,
        name: customer.name || `${customer.firstName} ${customer.lastName}`.trim(),
        dateOfBirth: customer.dateOfBirth,
        email: customer.email,
        phone: customer.phone,
        status: customer.status || 'active',
        metadata: customer.metadata || {}
      }));
    } catch (error) {
      console.error('Error searching customers:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.searchCustomers(query);
      }
      throw new Error(error.message || 'Failed to search customers');
    }
  }

  async createCustomer(customerData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const payload = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        dateOfBirth: customerData.dateOfBirth,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber,
        NINumber: customerData.NINumber,
        address: customerData.address,
        postcode: customerData.postcode,
        customerType: customerData.customerType,
        status: customerData.status || 'NEW_FIRST_TIME',
        companyName: customerData.companyName,
        companyRegNumber: customerData.companyRegNumber
      };

      console.log('Sending customer data to server:', payload);
      const response = await axiosInstance.post('/trades/customers', payload);
      console.log('Server response:', response);

      if (!response.data || Array.isArray(response.data)) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      const transformedResponse = {
        _id: response.data._id,
        firstName: response.data.firstName || payload.firstName,
        lastName: response.data.lastName || payload.lastName,
        dateOfBirth: response.data.dateofBirth || payload.dateOfBirth,
        email: response.data.email || payload.email,
        phoneNumber: response.data.phoneNumber || payload.phoneNumber,
        NINumber: response.data.NINumber || payload.NINumber,
        address: response.data.address || payload.address,
        postcode: response.data.postcode || payload.postcode,
        customerType: response.data.customerType || payload.customerType,
        status: response.data.status || payload.status,
        companyName: response.data.companyName || payload.companyName,
        companyRegNumber: response.data.companyRegNumber || payload.companyRegNumber,
        name: (response.data.customerType || payload.customerType) === 'COMPANY'
          ? (response.data.companyName || payload.companyName)
          : `${response.data.firstName || payload.firstName} ${response.data.lastName || payload.lastName}`
      };

      return transformedResponse;
    } catch (error) {
      console.error('Error in createCustomer:', error);
      if (error.response) {
        console.error('Server error data:', error.response.data);
        console.error('Server error status:', error.response.status);
        throw new Error(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        throw error;
      }
    }
  }

  async getCustomerDetails(customerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/trades/customers/${customerId}`);

      // Use normalizeCustomerObject for consistent customer data handling
      return normalizeCustomerObject({
        _id: response.data._id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        dateOfBirth: response.data.dateOfBirth,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        NINumber: response.data.NINumber,
        address: response.data.address,
        postcode: response.data.postcode,
        customerType: response.data.customerType,
        status: response.data.status,
        companyName: response.data.companyName,
        companyRegNumber: response.data.companyRegNumber
        // No manual name concatenation needed - handled by normalizeCustomerObject
      });
    } catch (error) {
      console.error('Error fetching customer details:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getCustomerDetails(customerId);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch customer details');
    }
  }

  async updateCustomerStatus(customerId, status, reason = '') {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.patch(`/trades/customers/${customerId}/status`, {
        status,
        reason,
        lastContact: new Date().toISOString()
      });
      return {
        _id: response.data._id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        dateOfBirth: response.data.dateOfBirth,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        NINumber: response.data.NINumber,
        address: response.data.address,
        postcode: response.data.postcode,
        customerType: response.data.customerType,
        status: response.data.status,
        companyName: response.data.companyName,
        companyRegNumber: response.data.companyRegNumber,
        name: response.data.customerType === 'COMPANY'
          ? response.data.companyName
          : `${response.data.firstName} ${response.data.lastName}`
      };
    } catch (error) {
      console.error('Error updating customer status:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.updateCustomerStatus(customerId, status, reason);
      }
      throw new Error(error.response?.data?.message || 'Failed to update customer status');
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const transformedData = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        dateOfBirth: customerData.dateOfBirth,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber,
        NINumber: customerData.NINumber,
        dateOfBirthaddress: customerData.address,
        postcode: customerData.postcode,
        customerType: customerData.customerType,
        status: customerData.status,
        companyName: customerData.companyName,
        companyRegNumber: customerData.companyRegNumber
      };
      const response = await axiosInstance.put(`/trades/customers/${customerId}`, transformedData);
      return {
        _id: response.data._id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        dateOfBirth: response.data.dateOfBirth,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        NINumber: response.data.NINumber,
        address: response.data.address,
        postcode: response.data.postcode,
        customerType: response.data.customerType,
        status: response.data.status,
        companyName: response.data.companyName,
        companyRegNumber: response.data.companyRegNumber,
        name: response.data.customerType === 'COMPANY'
          ? response.data.companyName
          : `${response.data.firstName} ${response.data.lastName}`
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.updateCustomer(customerId, customerData);
      }
      throw new Error(error.response?.data?.message || 'Failed to update customer');
    }
  }

  async getCustomerOrders(customerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/customers/${customerId}/bookings`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getCustomerOrders(customerId);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch customer orders');
    }
  }

  async getCustomerServices(customerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/customers/${customerId}/services`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching customer services:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getCustomerServices(customerId);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch customer services');
    }
  }

  async deleteCustomer(customerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.delete(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.deleteCustomer(customerId);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  }

  async getCustomerHistory(customerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/customers/${customerId}/history`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching customer history:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getCustomerHistory(customerId);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch customer history');
    }
  }

  //Stripe-related methods - delegated to PaymentService

  async createPaymentIntent(orderData) {
    try {
      // Normalize data first
      const normalizedCustomer = normalizeCustomerObject(orderData.customer || {});
      const normalizedOrder = normalizeOrderObject(orderData);

      const { customerId, amount, email, orderId, metadata } = {
        customerId: normalizedCustomer.id,
        amount: normalizedOrder.amount,
        email: normalizedCustomer.email,
        orderId: normalizedOrder.id,
        metadata: orderData.metadata || {}
      };

      // Validate required fields
      if (!customerId || !amount || !email || !orderId) {
        throw new Error('Missing required fields in order data');
      }

      // Use the centralized PaymentService with isStaffCreated flag
      const result = await PaymentService.createPaymentIntent({
        customerId,
        amount,
        email,
        orderId,
        metadata,
        isStaffCreated: true // Indicate this is created by staff
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      return result.paymentIntent;
    } catch (error) {
      // Use standardized error handling
      return handlePaymentError(error);
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId = null, customerId = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use the centralized PaymentService with isStaffCreated flag
      const result = await PaymentService.confirmPayment({
        paymentIntentId,
        paymentMethodId,
        customerId,
        isStaffCreated: true // Indicate this is created by staff
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to confirm payment');
      }

      return result;
    } catch (error) {
      // Use standardized error handling
      return handlePaymentError(error);
    }
  }

  async getPaymentStatus(paymentIntentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use the centralized PaymentService with isStaffCreated flag
      const result = await PaymentService.getPaymentStatus(paymentIntentId, true);

      if (!result.success) {
        throw new Error(result.error || 'Failed to get payment status');
      }

      return result.paymentDetails;
    } catch (error) {
      // Use standardized error handling
      return handlePaymentError(error);
    }
  }

  // async getCustomerHistory(customerId) {
  //   try {
  //     if (!this.initialized) {
  //       await this.initialize();
  //     }

  //     const response = await axiosInstance.get(`/customers/${customerId}/history`);
  //     return Array.isArray(response.data) ? response.data : [];
  //   } catch (error) {
  //     console.error('Error fetching customer history:', error);
  //     if (!this.initialized) {
  //       // If not initialized, try to initialize again
  //       await this.initialize();
  //       // Retry the request once
  //       return this.getCustomerHistory(customerId);
  //     }
  //     throw new Error(error.response?.data?.message || 'Failed to fetch customer history');
  //   }
  // }

  async getCustomerBookings(customerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/trades/customers/${customerId}/bookings`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getCustomerBookings(customerId);
      }
      return []; // Return empty array instead of throwing to prevent UI breaks
    }
  }

  // Order Management
  async getOrders() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get('/orders');

      // Normalize order objects before returning
      return Array.isArray(response.data) ?
        response.data.map(order => normalizeOrderObject(order)) :
        [];

    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getOrders();
      }

      // Use standardized error handling
      return handlePaymentError(error);
    }
  }

  async getBookedOrders() {
    return this.getOrders().then(orders => orders.filter(order => order.orderType === 'ONLINE'));
  }

  async getReservedOrders() {
    return this.getOrders().then(orders => orders.filter(order => order.orderType === 'PHONE'));
  }

  /**
   * Transforms orders to a standardized format
   * @param {Array} orders - Array of order objects to transform
   * @returns {Array} - Array of normalized order objects
   */
  transformBookedOrders(orders) {
    if (!Array.isArray(orders)) return [];

    return orders.map(order => {
      // Use normalizeOrderObject to ensure consistent structure
      const normalizedOrder = normalizeOrderObject(order);
      // Use normalizeCustomerObject for customer data
      const normalizedCustomer = normalizeCustomerObject(normalizedOrder.customer);

      return {
        id: normalizedOrder.id,
        customer: {
          id: normalizedCustomer.id,
          name: normalizedCustomer.name,
          dateOfBirth: normalizedCustomer.dateOfBirth,
          email: normalizedCustomer.email,
          phone: normalizedCustomer.phoneNumber
        },
        service: normalizedOrder.service,
        status: normalizedOrder.status,
        createdAt: normalizedOrder.createdAt,
        updatedAt: normalizedOrder.updatedAt
      };
    });
  }

  async createOrder(orderData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.createOrder(orderData);
      }
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  async createReservedOrder(orderData) {
    return this.createOrder({ ...orderData, isReserved: true });
  }

  // Prerequisite validation
  async validatePrerequisites(customerId, prerequisites) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.post(`/trades/validate-prerequisites`, {
        customerId,
        prerequisites
      });
      return response.data;
    } catch (error) {
      console.error('Error validating prerequisites:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.validatePrerequisites(customerId, prerequisites);
      }
      throw new Error(error.response?.data?.message || 'Failed to validate prerequisites');
    }
  }

  // Sales Metrics
  async getSalesMetrics() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/sales/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getSalesMetrics();
      }
      throw new Error('Failed to fetch sales metrics');
    }
  }

  // Trade Management
  async createTrade(tradeData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Creating trade:', tradeData);
      const response = await axiosInstance.post('/trades', tradeData);
      
      if (response.data?.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating trade:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.createTrade(tradeData);
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to create trade');
    }
  }

  async getTrades() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      console.log('Fetching trades...');
      const response = await axiosInstance.get('/trades');
      console.log('Raw trades response:', response);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      console.error('Invalid trades response format:', response.data);
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching trades:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getTrades();
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch trades');
    }
  }

  async getTrade(tradeId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/trades/${tradeId}`);
      if (!response.data) {
        throw new Error('Trade not found');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching trade:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getTrade(tradeId);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch trade');
    }
  }

  async updateTrade(tradeId, tradeData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.put(`/trades/${tradeId}`, tradeData);
      if (!response.data) {
        throw new Error('Failed to update trade');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating trade:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.updateTrade(tradeId, tradeData);
      }
      throw new Error(error.response?.data?.message || 'Failed to update trade');
    }
  }

  async deleteTrade(tradeId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.delete(`/trades/${tradeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting trade:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.deleteTrade(tradeId);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete trade');
    }
  }

  async getQualifications() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get('/trades/qualifications');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.getQualifications();
      }
      return []; // Return empty array instead of throwing to prevent UI breaks
    }
  }

  async validateCardEligibility(data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.post('/trades/validate-card-eligibility', data);
      return response.data;
    } catch (error) {
      console.error('Error validating card eligibility:', error);
      if (!this.initialized) {
        // If not initialized, try to initialize again
        await this.initialize();
        // Retry the request once
        return this.validateCardEligibility(data);
      }
      throw error;
    }
  }

  async getTradeServices(tradeId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.get(`/trades/services/${tradeId}`);

      // Handle the response format
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: response.data.data
        };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching trade services:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getTradeServices(tradeId);
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch trade services'
      };
    }
  }

  async getTradeServiceAssociations() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Fetching trade service associations...');
      const response = await axiosInstance.get('/trade-associations');
      console.log('Raw trade service associations response:', response);

      // Handle different response formats and ensure trade data is populated
      let associations = [];
      if (Array.isArray(response.data)) {
        associations = response.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        associations = response.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        associations = response.data.data;
      } else {
        console.error('Invalid associations response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      // Fetch trade details for any association that doesn't have populated trade data
      const tradesResponse = await this.getTrades();
      const trades = Array.isArray(tradesResponse) ? tradesResponse :
        tradesResponse?.success ? tradesResponse.data :
          tradesResponse?.data ? tradesResponse.data : [];

      // Map trade details to associations and handle both string IDs and object references
      return associations.map(assoc => {
        const mappedAssoc = { ...assoc };

        // Handle trade data
        if (typeof assoc.trade === 'string' || !assoc.trade?.title) {
          const tradeId = typeof assoc.trade === 'string' ? assoc.trade : assoc.trade?._id;
          const trade = trades.find(t => t._id === tradeId);
          mappedAssoc.trade = trade || { _id: tradeId, title: 'Unknown Trade' };
        }

        // Ensure arrays exist
        mappedAssoc.cards = assoc.cards || [];
        mappedAssoc.tests = assoc.tests || [];
        mappedAssoc.courses = assoc.courses || [];
        mappedAssoc.qualifications = assoc.qualifications || [];

        return mappedAssoc;
      });
    } catch (error) {
      console.error('Error fetching trade service associations:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getTradeServiceAssociations();
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch associations');
    }
  }

  async createTradeServiceAssociation(data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Creating trade service association with data:', data);
      const response = await axiosInstance.post('/trade-associations', {
        trade: data.trade,
        cards: data.cards || [],
        tests: data.tests || [],
        courses: data.courses || [],
        qualifications: data.qualifications || []
      });

      console.log('Raw create association response:', response);

      // Handle different response formats
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data?.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }

      console.error('Invalid create response format:', response.data);
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error creating trade service association:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.createTradeServiceAssociation(data);
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to create association');
    }
  }

  async updateTradeServiceAssociation(associationId, data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const response = await axiosInstance.put(`/trade-associations/${associationId}`, {
        trade: data.trade,
        cards: data.cards || [],
        tests: data.tests || [],
        courses: data.courses || [],
        qualifications: data.qualifications || []
      });
      return response.data;
    } catch (error) {
      console.error('Error updating trade service association:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.updateTradeServiceAssociation(associationId, data);
      }
      throw new Error(error.response?.data?.message || 'Failed to update trade service association');
    }
  }

  async deleteTradeServiceAssociation(associationId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Deleting trade service association:', associationId);
      const response = await axiosInstance.delete(`/trade-associations/${associationId}`);
      console.log('Delete association response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error deleting trade service association:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.deleteTradeServiceAssociation(associationId);
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete association');
    }
  }

  async getCards() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      const response = await axiosInstance.get('/cards');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching cards:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getCards();
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch cards');
    }
  }

  async getTests() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      const response = await axiosInstance.get('/tests');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching tests:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getTests();
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch tests');
    }
  }

  async getCourses() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      const response = await axiosInstance.get('/courses');
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (!this.initialized) {
        await this.initialize();
        return this.getCourses();
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch courses');
    }
  }

  // async getQualifications() {
  //   try {
  //     if (!this.initialized) {
  //       await this.initialize();
  //     }
  //     const response = await axiosInstance.get('/qualifications');
  //     return { success: true, data: response.data || [] };
  //   } catch (error) {
  //     console.error('Error fetching qualifications:', error);
  //     if (!this.initialized) {
  //       await this.initialize();
  //       return this.getQualifications();
  //     }
  //     throw new Error(error.response?.data?.error || error.message || 'Failed to fetch qualifications');
  //   }
  // }
}

export const salesService = new SalesService();
