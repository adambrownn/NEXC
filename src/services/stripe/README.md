# Stripe Integration Documentation

## Overview

This module provides a centralized Stripe integration for the NEXC e-commerce application. It streamlines payment processing by eliminating redundant operations and providing a consistent interface for all Stripe-related functionality.

## Key Improvements

1. **Centralized Stripe Instance**: Single point of initialization for the Stripe client
2. **Unified API**: Consistent interface for both frontend and backend operations
3. **Standardized Error Handling**: Uniform error handling across all Stripe operations
4. **Reduced Redundancy**: Eliminated duplicate code and redundant API calls
5. **Better Type Safety**: Improved parameter validation and return type consistency

## API Reference

### Core Functions

#### `getStripe()`
Returns a singleton instance of the Stripe client.

```javascript
import StripeService from '../services/stripe';

const stripe = await StripeService.getStripe();
```

#### `createPaymentIntent(paymentData)`
Creates a new payment intent with Stripe.

```javascript
const result = await StripeService.createPaymentIntent({
  customerId: 'customer123',
  amount: 9999, // in cents
  email: 'customer@example.com',
  orderId: 'order123',
  metadata: { source: 'web' }
});

if (result.success) {
  const { clientSecret, paymentIntentId } = result;
  // Use clientSecret with Elements
}
```

#### `confirmElementsPayment(options)`
Confirms a payment using Stripe Elements.

```javascript
const result = await StripeService.confirmElementsPayment({
  elements,
  confirmParams: {
    return_url: 'https://example.com/success',
    payment_method_data: {
      billing_details: {
        name: 'Customer Name',
        email: 'customer@example.com'
      }
    }
  },
  redirect: 'if_required'
});

if (result.success) {
  // Payment confirmed successfully
}
```

#### `confirmApiPayment(paymentData)`
Confirms a payment using the API (without Elements).

```javascript
const result = await StripeService.confirmApiPayment({
  paymentIntentId: 'pi_123456',
  paymentMethodId: 'pm_123456',
  customerId: 'customer123',
  saveCard: true
});

if (result.success) {
  // Payment confirmed successfully
}
```

#### `retrievePaymentIntent(clientSecret)`
Retrieves a payment intent using its client secret.

```javascript
const result = await StripeService.retrievePaymentIntent('pi_123_secret_456');

if (result.success) {
  const { status, paymentIntent } = result;
  // Use payment intent data
}
```

### Payment Method Management

#### `getCustomerPaymentMethods(customerId)`
Retrieves saved payment methods for a customer.

```javascript
const result = await StripeService.getCustomerPaymentMethods('customer123');

if (result.success) {
  const { paymentMethods } = result;
  // Use payment methods
}
```

#### `deletePaymentMethod(paymentMethodId)`
Deletes a saved payment method.

```javascript
const result = await StripeService.deletePaymentMethod('pm_123456');

if (result.success) {
  // Payment method deleted successfully
}
```

## Integration with PaymentService

The PaymentService now uses this centralized Stripe service for all payment operations, providing a consistent interface for both customer-facing e-commerce and staff-created orders.

```javascript
import PaymentService from '../services/payment';

// For customer-facing e-commerce
const result = await PaymentService.createPaymentIntent({
  customerId: 'customer123',
  amount: 99.99, // in dollars/pounds
  email: 'customer@example.com',
  orderId: 'order123'
});

// For staff-created orders
const result = await PaymentService.createPaymentIntent({
  customerId: 'customer123',
  amount: 99.99,
  email: 'customer@example.com',
  orderId: 'order123',
  isStaffCreated: true
});
```

## Benefits of Streamlined Integration

1. **Reduced API Calls**: Eliminates redundant API calls to Stripe
2. **Simplified Error Handling**: Consistent error handling across all components
3. **Better Performance**: Singleton pattern for Stripe instance improves performance
4. **Easier Maintenance**: Changes to Stripe integration only need to be made in one place
5. **Improved Reliability**: Standardized response format reduces bugs from inconsistent data structures
