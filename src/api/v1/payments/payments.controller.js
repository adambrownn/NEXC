const express = require('express');
const router = express.Router();
const stripeService = require('../../../services/stripe/stripe.backend');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Orders = require('../../../database/mongo/schemas/Orders.schema');
const { catchAsync } = require('../../../utils/catchAsync');
const AppError = require('../../../utils/AppError');

// Constants
const PAYMENT_TIMEOUT_MS = 30000; // 30 seconds

// Utility to safely handle Stripe operations with timeout
const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AppError('Payment processing timed out', 408));
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Verify high-value payments
const verifyHighValuePayment = async (amount, customerId) => {
  // Example threshold: £5000
  const HIGH_VALUE_THRESHOLD = 500000; // in pence (£5000)

  if (amount >= HIGH_VALUE_THRESHOLD) {
    console.log(`High-value payment detected: £${amount / 100} for customer ${customerId}`);

    // Additional verification could be implemented here
    // For example:
    // 1. Notify admin
    // 2. Require additional approval
    // 3. Apply enhanced fraud checks

    // For now, just log the high-value payment
    // In a real implementation, you might want to:
    // await notifyAdminOfHighValuePayment(amount, customerId);
  }
};

// Clean sensitive payment data
const cleanPaymentData = (data) => {
  const cleaned = { ...data };
  delete cleaned.client_secret;
  delete cleaned.customer;
  delete cleaned.billing_details?.card;
  return cleaned;
};

router.post('/create-payment-intent', async (req, res) => {
  const {
    amount,
    customerId,
    email,
    orderId,
    paymentMethodId,
    automatic_payment_methods
  } = req.body;

  try {
    // Create payment intent with proper parameters
    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      'gbp',
      customerId,
      { orderId, email },
      paymentMethodId,
      false, // don't confirm yet
      automatic_payment_methods?.enabled // pass through the automatic_payment_methods flag
    );

    res.json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      message: error.message || 'Failed to create payment intent'
    });
  }
});

router.post('/confirm-payment-intent', catchAsync(async (req, res) => {
  const { paymentIntentId, paymentMethod } = req.body;

  // Verify payment intent
  const paymentIntent = await withTimeout(
    stripe.paymentIntents.retrieve(paymentIntentId),
    PAYMENT_TIMEOUT_MS
  );

  // Confirm payment intent with timeout
  const confirmedPaymentIntent = await withTimeout(
    stripeService.confirmPaymentIntent(paymentIntentId, paymentMethod),
    PAYMENT_TIMEOUT_MS
  );

  // Update order payment status if payment succeeded
  if (confirmedPaymentIntent.status === 'succeeded' && confirmedPaymentIntent.metadata?.orderId) {
    await Orders.findByIdAndUpdate(confirmedPaymentIntent.metadata.orderId, {
      paymentStatus: 2 // paid status
    });
  }

  res.json(cleanPaymentData(confirmedPaymentIntent));
}));

router.get('/payment-intent/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  const paymentIntent = await withTimeout(
    stripeService.retrievePaymentIntent(id),
    PAYMENT_TIMEOUT_MS
  );

  res.json(cleanPaymentData(paymentIntent));
}));

module.exports = router;