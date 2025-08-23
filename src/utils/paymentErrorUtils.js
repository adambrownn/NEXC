/**
 * Utilities for handling payment errors in a consistent way
 * Categorizes errors and provides user-friendly messages
 */

// Error categories
export const ERROR_CATEGORIES = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    PROCESSING: 'processing',
    DECLINED: 'declined',
    NETWORK: 'network',
    SERVER: 'server',
    UNKNOWN: 'unknown'
};

// Error codes mapped to categories
export const ERROR_CODE_CATEGORIES = {
    // Validation errors
    'invalid_number': ERROR_CATEGORIES.VALIDATION,
    'invalid_expiry_month': ERROR_CATEGORIES.VALIDATION,
    'invalid_expiry_year': ERROR_CATEGORIES.VALIDATION,
    'invalid_cvc': ERROR_CATEGORIES.VALIDATION,

    // Authentication errors
    'authentication_required': ERROR_CATEGORIES.AUTHENTICATION,
    'card_declined': ERROR_CATEGORIES.DECLINED,
    'incorrect_cvc': ERROR_CATEGORIES.VALIDATION,
    'expired_card': ERROR_CATEGORIES.DECLINED,

    // Processing errors
    'processing_error': ERROR_CATEGORIES.PROCESSING,

    // Network errors
    'network_error': ERROR_CATEGORIES.NETWORK,

    // Server errors
    'server_error': ERROR_CATEGORIES.SERVER,
    'rate_limit_error': ERROR_CATEGORIES.SERVER,

    // Default
    'unknown': ERROR_CATEGORIES.UNKNOWN
};

// User-friendly error messages
export const ERROR_MESSAGES = {
    // Validation errors
    [ERROR_CATEGORIES.VALIDATION]: 'Please check your payment details and try again.',

    // Authentication errors
    [ERROR_CATEGORIES.AUTHENTICATION]: 'Additional authentication is required. Please try again and follow the authentication steps.',

    // Declined errors
    [ERROR_CATEGORIES.DECLINED]: 'Your payment was declined. Please try a different payment method or contact your bank.',

    // Processing errors
    [ERROR_CATEGORIES.PROCESSING]: 'There was an issue processing your payment. Please try again later.',

    // Network errors
    [ERROR_CATEGORIES.NETWORK]: 'Network connection error. Please check your internet connection and try again.',

    // Server errors
    [ERROR_CATEGORIES.SERVER]: 'Our payment system is currently experiencing issues. Please try again later.',

    // Unknown errors
    [ERROR_CATEGORIES.UNKNOWN]: 'An unexpected error occurred. Please try again or contact support.'
};

/**
 * Categorize a payment error based on its code or type
 * @param {Object|Error} error - The error object
 * @returns {string} Error category
 */
export const categorizeError = (error) => {
    if (!error) return ERROR_CATEGORIES.UNKNOWN;

    // Extract error code from various error object formats
    const errorCode = error.code ||
        (error.response && error.response.data && error.response.data.code) ||
        (error.raw && error.raw.code) ||
        'unknown';

    // Return the category or unknown if not found
    return ERROR_CODE_CATEGORIES[errorCode] || ERROR_CATEGORIES.UNKNOWN;
};

/**
 * Get a user-friendly error message for a payment error
 * @param {Object|Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
    // Get the error category
    const category = categorizeError(error);

    // If the error has a specific message we want to show, use it
    if (error && error.message && shouldDisplayOriginalMessage(error)) {
        return error.message;
    }

    // Otherwise return the category-based message
    return ERROR_MESSAGES[category] || ERROR_MESSAGES[ERROR_CATEGORIES.UNKNOWN];
};

/**
 * Determines if the original error message should be shown to the user
 * @param {Object|Error} error - The error object
 * @returns {boolean} Whether to display the original message
 */
export const shouldDisplayOriginalMessage = (error) => {
    // Some error messages from Stripe are user-friendly enough to display
    if (error && error.type === 'card_error') {
        return true;
    }

    // For other errors, use our standardized messages
    return false;
};

/**
 * Standardized error handling function for payment errors
 * @param {Object|Error} error - The error object
 * @returns {Object} Standardized error response
 */
export const handlePaymentError = (error) => {
    // Log the error for debugging
    console.error('Payment error:', error);

    // Create a standardized error response
    const category = categorizeError(error);
    const message = getUserFriendlyErrorMessage(error);
    const originalError = error.message || 'Unknown error';
    const errorCode = error.code || (error.raw && error.raw.code) || 'unknown';

    return {
        success: false,
        error: message,
        errorDetails: {
            category,
            originalError,
            errorCode
        }
    };
};

/**
 * Determine if an error requires customer action
 * @param {Object|Error} error - The error object
 * @returns {boolean} Whether the error requires customer action
 */
export const errorRequiresCustomerAction = (error) => {
    if (!error) return false;

    // Check specific error codes that require customer action
    const actionRequiredCodes = [
        'authentication_required',
        'card_declined',
        'expired_card',
        'incorrect_cvc',
        'insufficient_funds',
        'invalid_account'
    ];

    const errorCode = error.code ||
        (error.response && error.response.data && error.response.data.code) ||
        (error.raw && error.raw.code);

    return actionRequiredCodes.includes(errorCode);
};

/**
 * Create a Snackbar notification for a payment error
 * @param {Object} params - Parameters
 * @param {Function} params.enqueueSnackbar - Function to enqueue a snackbar message
 * @param {Object|Error} params.error - The error object
 * @param {string} params.fallbackMessage - Fallback message if no specific message
 */
export const showPaymentErrorNotification = ({ enqueueSnackbar, error, fallbackMessage = 'Payment failed' }) => {
    if (!enqueueSnackbar) return;

    const message = getUserFriendlyErrorMessage(error) || fallbackMessage;

    enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: 6000,
    });
};

/**
 * Categorize a Stripe-specific error
 * @param {Object} error - The Stripe error object
 * @returns {Object} Categorized error information
 */
export const categorizeStripeError = (error) => {
    // Use the general categorizeError function
    const category = categorizeError(error);

    // Extract more specific information from Stripe errors
    const errorInfo = {
        message: getUserFriendlyErrorMessage(error),
        category,
        code: error.code || (error.raw && error.raw.code) || 'unknown',
        retryable: ['network_error', 'processing_error', 'timeout_error'].includes(
            error.code || (error.raw && error.raw.code) || ''
        )
    };

    return errorInfo;
};

/**
 * Handle network-related errors
 * @param {Error} error - The network error
 * @returns {Object} Standardized error information
 */
export const handleNetworkError = (error) => {
    return {
        message: error.message || 'Network error. Please check your connection and try again.',
        retryable: true,
        type: ERROR_CATEGORIES.NETWORK
    };
};