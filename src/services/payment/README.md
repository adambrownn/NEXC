# NEXC Payment System Documentation

## Architecture Overview

The NEXC payment system is designed to handle both public-facing e-commerce checkout and staff-created orders through a unified interface. The system integrates with Stripe for payment processing and provides a consistent approach to handling payment data.

### System Diagram

## Key Features

- **Unified Payment API**: Provides a single interface for all payment operations
- **Dual-mode Operation**: Supports both customer-facing e-commerce and staff-created orders
- **Consistent Error Handling**: Standardized error responses across all payment operations
- **Comprehensive Payment Operations**: Includes creating payment intents, confirming payments, refunding, canceling, and managing payment methods

## API Reference

### Payment Operations

#### `createPaymentIntent(options)`
Creates a new payment intent for processing a payment.

```javascript
const result = await PaymentService.createPaymentIntent({
  customerId: 'customer123',
  amount: 99.99,
  email: 'customer@example.com',
  orderId: 'order123',
  metadata: { source: 'web' },
  isStaffCreated: false // Set to true for staff-created orders
});
```

#### `confirmPayment(options)`
Confirms a payment intent with the payment provider.

```javascript
const result = await PaymentService.confirmPayment({
  paymentIntentId: 'pi_123456',
  paymentMethodId: 'pm_123456',
  customerId: 'customer123',
  saveCard: true,
  isStaffCreated: false // Set to true for staff-created orders
});
```

#### `getPaymentStatus(paymentIntentId, isStaffCreated)`
Retrieves the current status of a payment.

```javascript
const result = await PaymentService.getPaymentStatus('pi_123456', false);
```

#### `cancelPayment(paymentIntentId)`
Cancels a payment intent that hasn't been processed yet.

```javascript
const result = await PaymentService.cancelPayment('pi_123456');
```

#### `refundPayment(paymentIntentId, amount)`
Processes a refund for a completed payment.

```javascript
const result = await PaymentService.refundPayment('pi_123456', 99.99);
```

### Payment Method Management

#### `getCustomerPaymentMethods(customerId)`
Retrieves saved payment methods for a customer.

```javascript
const result = await PaymentService.getCustomerPaymentMethods('customer123');
```

#### `deletePaymentMethod(paymentMethodId)`
Deletes a saved payment method.

```javascript
const result = await PaymentService.deletePaymentMethod('pm_123456');
```

#### `setDefaultPaymentMethod(customerId, paymentMethodId)`
Sets a payment method as the default for a customer.

```javascript
const result = await PaymentService.setDefaultPaymentMethod('customer123', 'pm_123456');
```

## Implementation Details

- The service uses different API endpoints for customer-facing and staff-created orders
- All methods return a standardized response format with `success` flag and relevant data
- Error handling is consistent across all methods with detailed error messages
- The service automatically handles customer creation if needed

## Usage in the Application

### In CartContext (Customer-facing E-commerce)

The CartContext uses the PaymentService for handling customer payments during checkout:

```javascript
// Creating a payment intent during checkout
const result = await PaymentService.createPaymentIntent({
  customerId: customer.id,
  amount: totalAmount,
  email: customer.email,
  orderId: orderId
});

// Confirming payment after customer enters payment details
const result = await PaymentService.confirmPayment({
  paymentIntentId: paymentIntentId,
  paymentMethodId: paymentMethodId,
  customerId: customer.id,
  saveCard: saveCard
});
```

### In SalesService (Staff Operations)

The SalesService delegates all payment operations to the PaymentService:

```javascript
// Creating a payment intent for a staff-created order
const result = await PaymentService.createPaymentIntent({
  customerId: customerId,
  amount: amount,
  email: email,
  orderId: orderId,
  isStaffCreated: true // Indicate this is created by staff
});

// Confirming payment for a staff-created order
const result = await PaymentService.confirmPayment({
  paymentIntentId: paymentIntentId,
  isStaffCreated: true
});
```

## Benefits of Consolidation

1. **Code Reusability**: Eliminates duplicate code between services
2. **Consistent API Interaction**: Ensures all payment operations follow the same patterns
3. **Centralized Error Handling**: Standardizes error responses across the application
4. **Easier Maintenance**: Changes to payment logic only need to be made in one place
5. **Better Testing**: Simplifies unit testing of payment functionality
