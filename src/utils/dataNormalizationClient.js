/**
 * Frontend version of data normalization utilities
 * 
 * This file re-exports the data normalization functions using ES module syntax
 * for use in the React frontend.
 */

// Import from the CommonJS version
const {
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
} = require('./dataNormalization');

// Re-export using ES Module syntax for frontend use
export {
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
