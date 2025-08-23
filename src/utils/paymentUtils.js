/**
 * AMOUNT UNIT CONVENTIONS
 * 
 * This application uses the following conventions for monetary amounts:
 * 
 * 1. UI Components: Always display amounts in pounds (£) with proper formatting
 * 2. API Requests: Always send amounts in pence (p) as integers
 * 3. Database: Store amounts in pence (p) as integers
 * 
 * When working with amounts:
 * - Use `poundsToPence()` before sending to API or database
 * - Use `penceToPounds()` when retrieving from API or database for display
 * - Use `formatCurrency()` for final display to users
 * 
 * Always document which unit you're working with in variable names:
 * - amountInPence, priceInPence, totalInPence
 * - amountInPounds, priceInPounds, totalInPounds
 */

/**
 * Payment-related utility functions
 */

/**
 * Format a currency amount for display
 * @param {number} amount - Amount in pounds (£)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
    const {
        currency = 'GBP',
        locale = 'en-GB'
    } = options;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Converts pounds to pence for payment processors like Stripe
 * @param {number} amountInPounds - Amount in pounds (£)
 * @returns {number} Amount in pence (p)
 */
export const poundsToPence = (amountInPounds) => {
    // Ensure we're working with a number
    const amount = Number(amountInPounds);
    if (isNaN(amount)) return 0;

    // Convert to pence (multiply by 100) and round to avoid floating point issues
    return Math.round(amount * 100);
};

/**
 * Converts pence to pounds for display
 * @param {number} amountInPence - Amount in pence (p)
 * @returns {number} Amount in pounds (£)
 */
export const penceToPounds = (amountInPence) => {
    // Ensure we're working with a number
    const amount = Number(amountInPence);
    if (isNaN(amount)) return 0;

    // Convert to pounds (divide by 100)
    return amount / 100;
};

/**
 * Checks if an amount is valid for payment processing
 * @param {number} amountInPence - Amount in pence (p)
 * @returns {boolean} Whether amount is valid
 */
export const isValidAmount = (amountInPence) => {
    const amount = Number(amountInPence);
    if (isNaN(amount)) return false;

    // Most payment processors require a minimum amount (e.g. 50p or $0.50)
    // and have a maximum limit for standard processing (e.g. £999,999.99)
    return amount >= 50 && amount <= 99999999;
};