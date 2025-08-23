/**
 * Constants related to payment processing (Frontend version)
 * 
 * This file re-exports the payment constants using ES module syntax
 * for use in the React frontend.
 */

// Import from the CommonJS constants file
const {
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    PAYMENT_METHOD_TYPES,
    PAYMENT_METHOD_ORDER,
    PAYMENT_METHOD_CATEGORIES,
    PAYMENT_METHOD_CATEGORY_MAP
} = require('./paymentConstants');

// Export using ES Module syntax for frontend use
export {
    PAYMENT_STATUS,
    PAYMENT_STATUS_LABELS,
    PAYMENT_STATUS_COLORS,
    PAYMENT_METHOD_TYPES,
    PAYMENT_METHOD_ORDER,
    PAYMENT_METHOD_CATEGORIES,
    PAYMENT_METHOD_CATEGORY_MAP
};
