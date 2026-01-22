/**
 * Shared payment methods configuration
 * This module centralizes all payment method definitions and icons
 * to ensure consistency across the application.
 */
import {
  PAYMENT_METHOD_TYPES,
  PAYMENT_METHOD_ORDER,
  PAYMENT_METHOD_CATEGORIES
} from '../constants/paymentConstants';

import CreditCardIcon from '@mui/icons-material/CreditCard';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentsIcon from '@mui/icons-material/Payments';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Base path for payment icons
export const PAYMENT_ICON_BASE_PATH = '/assets/images/payment';

// Path to sprite sheet for optimized loading
export const PAYMENT_ICON_SPRITE = '/assets/images/payment-sprite.svg';

// Define MUI icons for security indicators
export const SECURE_PAYMENT_ICONS_MUI = [
  { id: 'card', name: 'Secure Cards', icon: CreditCardIcon, color: '#1565C0' },
  { id: 'security', name: 'Encrypted', icon: SecurityIcon, color: '#4CAF50' },
  { id: 'payments', name: 'Safe Payments', icon: PaymentsIcon, color: '#FF9800' },
  { id: 'lock', name: 'Protected', icon: LockIcon, color: '#F44336' },
  { id: 'verified', name: 'Verified', icon: VerifiedUserIcon, color: '#9C27B0' }
];

// Secure payment icons shown in the payment form
// Using actual card brand icons instead of MUI components for better visual representation
export const SECURE_PAYMENT_ICONS = [
  {
    id: 'visa',
    name: 'Visa',
    icon: `${PAYMENT_ICON_BASE_PATH}/visa.svg`,
    isComponent: false,
    spriteId: null  // Disable sprite usage completely
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: `${PAYMENT_ICON_BASE_PATH}/mastercard.svg`,
    isComponent: false,
    spriteId: null
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: `${PAYMENT_ICON_BASE_PATH}/american-express.svg`,
    isComponent: false,
    spriteId: null
  },
  {
    id: 'security',
    name: 'Secure',
    icon: SecurityIcon,
    isComponent: true,
    color: '#4CAF50'
  },
  {
    id: 'lock',
    name: 'Protected',
    icon: LockIcon,
    isComponent: true,
    color: '#F44336'
  }
];

// All supported payment methods with consistent icons and status indicators
export const PAYMENT_METHODS = [
  {
    id: PAYMENT_METHOD_TYPES.CARD,
    name: 'Credit/Debit Card',
    icon: `${PAYMENT_ICON_BASE_PATH}/generic-card.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay with credit or debit card',
    category: PAYMENT_METHOD_CATEGORIES.CARDS
  },
  {
    id: PAYMENT_METHOD_TYPES.GOOGLE_PAY,
    name: 'Google Pay',
    icon: `${PAYMENT_ICON_BASE_PATH}/google-pay.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Fast checkout with Google Pay',
    category: PAYMENT_METHOD_CATEGORIES.DIGITAL_WALLETS
  },
  {
    id: PAYMENT_METHOD_TYPES.APPLE_PAY,
    name: 'Apple Pay',
    icon: `${PAYMENT_ICON_BASE_PATH}/apple-pay.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Fast checkout with Apple Pay',
    category: PAYMENT_METHOD_CATEGORIES.DIGITAL_WALLETS
  },
  {
    id: PAYMENT_METHOD_TYPES.LINK,
    name: 'Link',
    icon: `${PAYMENT_ICON_BASE_PATH}/link.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay with saved payment details',
    category: PAYMENT_METHOD_CATEGORIES.DIGITAL_WALLETS
  },
  {
    id: PAYMENT_METHOD_TYPES.REVOLUT_PAY,
    name: 'Revolut Pay',
    icon: `${PAYMENT_ICON_BASE_PATH}/revolut.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay with Revolut',
    category: PAYMENT_METHOD_CATEGORIES.DIGITAL_WALLETS
  },
  {
    id: PAYMENT_METHOD_TYPES.AFTERPAY_CLEARPAY,
    name: 'Afterpay/Clearpay',
    icon: `${PAYMENT_ICON_BASE_PATH}/afterpay.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay in 4 interest-free installments',
    category: PAYMENT_METHOD_CATEGORIES.BUY_NOW_PAY_LATER
  },
  {
    id: PAYMENT_METHOD_TYPES.KLARNA,
    name: 'Klarna',
    icon: `${PAYMENT_ICON_BASE_PATH}/klarna.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay in installments with Klarna',
    category: PAYMENT_METHOD_CATEGORIES.BUY_NOW_PAY_LATER
  },
  {
    id: PAYMENT_METHOD_TYPES.PAY_BY_BANK,
    name: 'Pay By Bank',
    icon: `${PAYMENT_ICON_BASE_PATH}/bank.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay directly from your bank account',
    category: PAYMENT_METHOD_CATEGORIES.BANK_PAYMENTS
  },
  {
    id: PAYMENT_METHOD_TYPES.BANK_TRANSFER,
    name: 'Bank Transfer',
    icon: `${PAYMENT_ICON_BASE_PATH}/bank-transfer.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay via bank transfer',
    category: PAYMENT_METHOD_CATEGORIES.BANK_PAYMENTS
  },
  {
    id: PAYMENT_METHOD_TYPES.EPS,
    name: 'EPS',
    icon: `${PAYMENT_ICON_BASE_PATH}/eps.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay via EPS',
    category: PAYMENT_METHOD_CATEGORIES.BANK_PAYMENTS
  },
  {
    id: PAYMENT_METHOD_TYPES.BANCONTACT,
    name: 'Bancontact',
    icon: `${PAYMENT_ICON_BASE_PATH}/bancontact.svg`,
    spriteId: null,
    enabled: true,
    implemented: true,
    description: 'Pay with Bancontact',
    category: PAYMENT_METHOD_CATEGORIES.BANK_PAYMENTS
  }
];

// Export the payment method order from constants
export { PAYMENT_METHOD_ORDER };

// Card brands supported for card payments with sprite support
export const CARD_BRANDS = [
  { id: 'visa', name: 'Visa', icon: `${PAYMENT_ICON_BASE_PATH}/visa.svg`, spriteId: null },
  { id: 'mastercard', name: 'Mastercard', icon: `${PAYMENT_ICON_BASE_PATH}/mastercard.svg`, spriteId: null },
  { id: 'amex', name: 'American Express', icon: `${PAYMENT_ICON_BASE_PATH}/american-express.svg`, spriteId: null },
  { id: 'discover', name: 'Discover', icon: `${PAYMENT_ICON_BASE_PATH}/discover.svg`, spriteId: null },
  { id: 'maestro', name: 'Maestro', icon: `${PAYMENT_ICON_BASE_PATH}/maestro.svg`, spriteId: null },
  { id: 'diners', name: 'Diners Club', icon: `${PAYMENT_ICON_BASE_PATH}/diners.svg`, spriteId: null },
  { id: 'jcb', name: 'JCB', icon: `${PAYMENT_ICON_BASE_PATH}/jcb.svg`, spriteId: null }
];

// Helper function to get only enabled payment methods
export const getEnabledPaymentMethods = () => {
  return PAYMENT_METHODS.filter(method => method.enabled);
};

// Helper function to get only implemented payment methods
export const getImplementedPaymentMethods = () => {
  return PAYMENT_METHODS.filter(method => method.implemented);
};

// Helper function to get payment methods that are coming soon
export const getComingSoonPaymentMethods = () => {
  // Ensure we're returning the full payment method objects with proper icon paths
  return PAYMENT_METHODS.filter(method => method.comingSoon).map(method => ({
    ...method,
    // Ensure we're using direct image paths for coming soon methods
    icon: method.icon,
    spriteId: null
  }));
};

// Helper function to get a payment method by ID
export const getPaymentMethodById = (id) => {
  return PAYMENT_METHODS.find(method => method.id === id);
};

// Helper function to handle missing icons with better fallback strategy
export const getPaymentIcon = (iconPath, fallbackIcon = `${PAYMENT_ICON_BASE_PATH}/generic-card.svg`) => {
  if (!iconPath) return fallbackIcon;
  return iconPath;
};

// Helper function to get sprite icon URL
export const getSpriteIconUrl = (spriteId) => {
  if (!spriteId) return null;
  // Add fallback to direct image if sprite reference fails
  const directPath = `${PAYMENT_ICON_BASE_PATH}/${spriteId}.svg`;
  return `${PAYMENT_ICON_SPRITE}#${spriteId}` || directPath;
};

// Helper function to check if payment method is coming soon
export const isPaymentMethodComingSoon = (methodId) => {
  const method = getPaymentMethodById(methodId);
  return method ? !!method.comingSoon : false;
};

// Helper function to get all card brands as a map for quick lookup
export const getCardBrandsMap = () => {
  return CARD_BRANDS.reduce((map, brand) => {
    map[brand.id] = brand;
    return map;
  }, {});
};

// Add getPaymentMethodsByCategory to better organize methods
export const getPaymentMethodsByCategory = () => {
  const allMethods = getEnabledPaymentMethods();

  return {
    cards: allMethods.filter(m => m.category === PAYMENT_METHOD_CATEGORIES.CARDS),
    digitalWallets: allMethods.filter(m => m.category === PAYMENT_METHOD_CATEGORIES.DIGITAL_WALLETS),
    bnpl: allMethods.filter(m => m.category === PAYMENT_METHOD_CATEGORIES.BUY_NOW_PAY_LATER),
    bankPayments: allMethods.filter(m => m.category === PAYMENT_METHOD_CATEGORIES.BANK_PAYMENTS),
  };
};

// Function to detect device type for payment method eligibility
export const getDeviceType = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios';
  }
  if (/macintosh|mac os x/i.test(userAgent)) {
    return 'mac';
  }
  if (/android/i.test(userAgent)) {
    return 'android';
  }
  return 'desktop';
};

// Add function to check if a payment method is available based on context
export const isPaymentMethodAvailable = (methodId, context = {}) => {
  const { amount = 0, deviceType = getDeviceType(), country = 'GB' } = context;

  // Method-specific availability rules
  switch (methodId) {
    case PAYMENT_METHOD_TYPES.APPLE_PAY:
      return deviceType === 'ios' || deviceType === 'mac';
    case PAYMENT_METHOD_TYPES.GOOGLE_PAY:
      return deviceType === 'android' || deviceType === 'desktop';
    case PAYMENT_METHOD_TYPES.AFTERPAY_CLEARPAY:
      return amount >= 100 && amount <= 100000 && ['GB', 'US', 'AU', 'NZ', 'CA'].includes(country);
    case PAYMENT_METHOD_TYPES.KLARNA:
      return amount >= 1000 && amount <= 150000 && ['GB', 'DE', 'SE', 'NO', 'FI', 'DK'].includes(country);
    default:
      return true;
  }
};

// Get payment methods filtered by availability
export const getAvailablePaymentMethods = (context = {}) => {
  return getEnabledPaymentMethods().filter(method =>
    isPaymentMethodAvailable(method.id, context)
  );
};

// Suppress unused variable warning temporarily
// eslint-disable-next-line no-unused-vars
const PAYMENT_METHOD_CATEGORY_MAP = {
  // ...existing code...
};
