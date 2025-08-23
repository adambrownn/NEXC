/**
 * Data normalization utilities
 * These functions ensure consistent data structures throughout the application
 * by standardizing object properties and conversion operations.
 */

/**
 * Normalizes order object structure to ensure consistent property access
 * @param {Object} order - The order object to normalize
 * @returns {Object} - Normalized order object with consistent properties
 */
const normalizeOrderObject = (order) => {
    if (!order) return null;

    // Handle empty or invalid input
    if (!order || typeof order !== 'object' || Object.keys(order).length === 0) {
        return {};
    }

    // Ensure consistent ID field
    const id = order._id || order.id || null;

    // Calculate amount consistently
    let amount = 0;
    if (typeof order.amount === 'number') {
        amount = order.amount;
    } else if (typeof order.grandTotalToPay === 'number') {
        amount = order.grandTotalToPay;
    } else if (typeof order.itemsTotal === 'number') {
        amount = order.itemsTotal;
    } else if (Array.isArray(order.items) && order.items.length > 0) {
        // Calculate from items if available
        amount = order.items.reduce((sum, item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            return sum + (itemPrice * itemQuantity);
        }, 0);
    } else if (Array.isArray(order.services) && order.services.length > 0) {
        // Calculate from services if available
        amount = order.services.reduce((sum, service) => {
            const servicePrice = Number(service.price) || 0;
            const serviceQuantity = Number(service.quantity) || 1;
            return sum + (servicePrice * serviceQuantity);
        }, 0);
    }

    // Standardize items array
    const items = Array.isArray(order.items) ? order.items :
        Array.isArray(order.services) ? order.services : [];

    const normalizedItems = items.map(item => ({
        ...item,
        _id: item._id || item.id || item.service || null,
        id: item._id || item.id || item.service || null,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        // Standardize type field
        type: item.type || item.serviceType || 'service',
        // Ensure service details are present
        details: item.details || {}
    }));

    // Normalize customer information
    const customer = order.customer || {};
    const customerId = order.customerId || customer._id || customer.id || null;

    // Return normalized object with all possible fields
    return {
        ...order,
        _id: id,
        id: id,

        // Amount properties - ensure all are present for compatibility
        amount: amount,
        grandTotalToPay: amount,
        itemsTotal: amount,
        totalAmount: amount,

        // Standardize items structure
        items: normalizedItems,
        services: normalizedItems, // For backward compatibility

        // Ensure customer reference is consistent
        customerId: customerId,
        customer: customer ? {
            ...customer,
            _id: customer._id || customer.id || customerId,
            id: customer.id || customer._id || customerId
        } : null,

        // Other standardized fields
        orderReference: order.orderReference || order.reference || `ORD-${Date.now()}`,
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 0,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: order.updatedAt || new Date().toISOString(),
    };
};

/**
 * Normalizes customer object structure to ensure consistent property access
 * @param {Object} customer - The customer object to normalize
 * @returns {Object} - Normalized customer object with consistent properties
 */
const normalizeCustomerObject = (customer) => {
    if (!customer) return null;

    // Handle empty or invalid input
    if (typeof customer !== 'object' || Object.keys(customer).length === 0) {
        return {};
    }

    // Ensure consistent ID field
    const id = customer._id || customer.id || null;

    // Determine name components
    const firstName = customer.firstName ||
        (customer.name ? customer.name.split(' ')[0] : '');

    const lastName = customer.lastName ||
        (customer.name && customer.name.split(' ').length > 1
            ? customer.name.split(' ').slice(1).join(' ')
            : '');

    // Build full name if not present
    const name = customer.name ||
        ((firstName || lastName) ? `${firstName} ${lastName}`.trim() : '');

    // Normalize customer type
    const customerType = customer.customerType ||
        (customer.companyName ? 'COMPANY' : 'INDIVIDUAL');

    return {
        ...customer,
        _id: id,
        id: id,

        // Name fields
        name,
        firstName,
        lastName,

        // Type information
        customerType,

        // Contact information with fallbacks
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || customer.phone || '',

        // Address information
        address: customer.address || '',
        city: customer.city || '',
        zipcode: customer.zipcode || customer.postcode || '',

        // Additional identification
        NINumber: customer.NINumber || customer.niNumber || '',
        dateOfBirth: customer.dateOfBirth || customer.dob || null,

        // Company information if applicable
        companyName: customer.companyName || '',
        companyRegNumber: customer.companyRegNumber || '',

        // Status fields
        status: customer.status || 'NEW_FIRST_TIME'
    };
};

/**
 * Converts pounds to pence for Stripe API (multiply by 100)
 * @param {number|string} pounds - Amount in pounds (can be string or number)
 * @returns {number} Amount in pence as integer
 */
const poundsToPence = (pounds) => {
    if (pounds === null || pounds === undefined) return 0;

    // If it's already a large number (likely already in pence), return it
    if (typeof pounds === 'number' && pounds > 1000) return Math.round(pounds);

    // Parse to float if it's a string
    const amount = typeof pounds === 'string' ? parseFloat(pounds) : pounds;

    // Guard against NaN
    if (isNaN(amount)) return 0;

    // Convert to pence and round to avoid floating point issues
    return Math.round(amount * 100);
};

/**
 * Converts pence to pounds (for display)
 * @param {number|string} pence - Amount in pence
 * @returns {number} - Amount in pounds with decimal
 */
const penceToPounds = (pence) => {
    if (pence === null || pence === undefined) return 0;

    // If it's a very small number (likely already in pounds), return it
    if (typeof pence === 'number' && pence < 10) return pence;

    // Parse to integer if it's a string
    const amount = typeof pence === 'string' ? parseInt(pence, 10) : pence;

    // Guard against NaN
    if (isNaN(amount)) return 0;

    // Convert to pounds with 2 decimal places
    return amount / 100;
};

/**
 * Formats amount for display as currency
 * @param {number} amount - Amount in pounds
 * @param {string} currencyCode - Currency code (default: GBP)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currencyCode = 'GBP') => {
    // Safety check for undefined/null
    if (amount === null || amount === undefined) return '£0.00';

    // Check if amount is likely in pence (large whole number)
    const isLikelyPence = typeof amount === 'number' &&
        amount > 100 &&
        Number.isInteger(amount);

    // Convert to pounds if needed
    const amountInPounds = isLikelyPence ? penceToPounds(amount) : amount;

    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode
    }).format(amountInPounds);
};

/**
 * Detects if an amount is likely in pounds or pence
 * @param {number} amount - The amount to check
 * @returns {string} 'pounds' or 'pence'
 */
const detectAmountUnit = (amount) => {
    if (typeof amount !== 'number') return 'unknown';

    // If it has decimal places or is a small number, likely pounds
    if (amount !== Math.floor(amount) || amount < 100) {
        return 'pounds';
    }

    // Large integers are likely pence
    return 'pence';
};

/**
 * Standardizes an amount to ensure it's in pounds
 * @param {number} amount - Amount (will detect if pounds or pence)
 * @returns {number} - Standardized amount in pounds
 */
const standardizeAmountToPounds = (amount) => {
    const unit = detectAmountUnit(amount);
    return unit === 'pence' ? penceToPounds(amount) : amount;
};

/**
 * Standardizes an amount to ensure it's in pence (for Stripe)
 * @param {number} amount - Amount (will detect if pounds or pence)
 * @returns {number} - Standardized amount in pence
 */
const standardizeAmountToPence = (amount) => {
    const unit = detectAmountUnit(amount);
    return unit === 'pounds' ? poundsToPence(amount) : amount;
};

/**
 * Prepares amount for display in user interface
 * @param {number|string} amount - Amount in any format
 * @param {string} currencyCode - Currency code (default: GBP)
 * @returns {string} - Formatted currency string for display
 */
const prepareAmountForDisplay = (amount, currencyCode = 'GBP') => {
    // Convert to number if it's a string
    let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle invalid input
    if (isNaN(numericAmount)) return formatCurrency(0, currencyCode);

    // Standardize to pounds and format
    return formatCurrency(standardizeAmountToPounds(numericAmount), currencyCode);
};

/**
 * Prepares amount for API (ensures pence)
 * @param {number|string} amount - Amount in any format
 * @returns {number} - Amount in pence for API calls
 */
const prepareAmountForApi = (amount) => {
    // Convert to number if it's a string
    let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle invalid input
    if (isNaN(numericAmount)) return 0;

    // Standardize to pence
    return standardizeAmountToPence(numericAmount);
};

// Export all functions at the bottom using CommonJS format
module.exports = {
    normalizeOrderObject,
    normalizeCustomerObject,
    poundsToPence,
    penceToPounds,
    formatCurrency,
    detectAmountUnit,
    standardizeAmountToPounds,
    standardizeAmountToPence,
    prepareAmountForDisplay,
    prepareAmountForApi
};