import { loadStripe } from '@stripe/stripe-js';

/**
 * Stripe Promise for React components
 * This is a singleton instance of the Stripe object that can be shared across components
 */
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Standardized appearance configuration for Stripe Elements
 * This ensures consistent styling across different implementations
 */
export const ELEMENTS_APPEARANCE = {
    theme: 'stripe',
    variables: {
        colorPrimary: '#1976d2',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSizeBase: '16px',
        borderRadius: '4px',
        spacingUnit: '4px'
    },
    rules: {
        '.Input': {
            border: '1px solid #E0E0E0',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03)',
            padding: '10px 14px'
        },
        '.Input:focus': {
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 0px 0px 2px rgba(25, 118, 210, 0.2)'
        }
    }
};

/**
 * Payment method configuration for Stripe Elements
 */
export const PAYMENT_METHOD_TYPES = [
    'card',
    'google_pay',
    'link',
    'revolut_pay',
    'pay_by_bank',
    'afterpay_clearpay',
    'bank_transfer'
];
