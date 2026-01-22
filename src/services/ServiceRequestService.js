/**
 * Service Request Service
 * Handles API calls for creating and managing service requests
 */

import axiosInstance from '../axiosConfig';
import {
    normalizeOrderObject,
    normalizeCustomerObject,
    prepareAmountForApi
} from '../utils/dataNormalizationClient'; // Updated import path
import {
    PAYMENT_METHOD_TYPES,
    PAYMENT_STATUS
} from '../constants/paymentConstantsClient';

class ServiceRequestService {
    /**
     * Create a service request
     * @param {Object} requestData - The service request data
     * @returns {Promise<Object>} - The created service request
     */
    async createServiceRequest(requestData) {
        try {
            // Normalize the customer and order data for consistent handling
            const normalizedCustomer = normalizeCustomerObject(requestData.customer);
            const normalizedServices = Array.isArray(requestData.services)
                ? requestData.services
                : [requestData.services].filter(Boolean);

            // Prepare the request payload
            const payload = {
                customer: normalizedCustomer,
                services: normalizedServices,
                notes: requestData.notes || '',
                urgency: requestData.urgency || 'normal',
                scheduledDate: requestData.scheduledDate || null,
                paymentMethod: requestData.paymentMethod || PAYMENT_METHOD_TYPES.CARD,
                paymentStatus: requestData.paymentStatus || PAYMENT_STATUS.NOT_STARTED,
                amount: prepareAmountForApi(requestData.amount || 0),
                metadata: requestData.metadata || {}
            };

            // Make the API call
            const response = await axiosInstance.post('/api/v1/service-requests', payload);

            // Return the normalized response
            return {
                success: true,
                serviceRequest: normalizeOrderObject(response.data)
            };
        } catch (error) {
            console.error('Error creating service request:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'An error occurred while creating the service request'
            };
        }
    }

    /**
     * Get service requests
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} - List of service requests
     */
    async getServiceRequests(filters = {}) {
        try {
            const response = await axiosInstance.get('/api/v1/service-requests', {
                params: filters
            });

            // Normalize all service requests
            const normalizedRequests = Array.isArray(response.data)
                ? response.data.map(request => normalizeOrderObject(request))
                : [];

            return {
                success: true,
                serviceRequests: normalizedRequests
            };
        } catch (error) {
            console.error('Error fetching service requests:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'An error occurred while fetching service requests'
            };
        }
    }

    /**
     * Get service requests by customer ID (for profile page)
     * @param {string} customerId - Customer ID
     * @returns {Promise<Array>} Customer's service requests
     */
    async getByCustomerId(customerId) {
        try {
            const response = await axiosInstance.get(`/api/v1/service-requests/customer/${customerId}`);

            // Normalize service requests
            const normalizedRequests = Array.isArray(response.data)
                ? response.data.map(request => normalizeOrderObject(request))
                : [];

            return normalizedRequests;
        } catch (error) {
            console.error('Error fetching customer service requests:', error);
            // Return empty array on error for graceful degradation
            return [];
        }
    }

    /**
     * Get all service requests
     * @returns {Promise<Array>} All service requests
     */
    async getAll() {
        try {
            const response = await axiosInstance.get('/api/v1/service-requests');

            // Normalize service requests
            const normalizedRequests = Array.isArray(response.data)
                ? response.data.map(request => normalizeOrderObject(request))
                : [];

            return normalizedRequests;
        } catch (error) {
            console.error('Error fetching all service requests:', error);
            // Return empty array on error for graceful degradation
            return [];
        }
    }
}

// Fix ESLint warning by assigning to variable before export
const serviceRequestService = new ServiceRequestService();
export default serviceRequestService;