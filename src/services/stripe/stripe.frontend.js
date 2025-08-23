import { loadStripe } from '@stripe/stripe-js';
import axios from "../../axiosConfig";

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is missing');
      throw new Error('Stripe configuration is missing');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export const createPaymentIntent = async (paymentData) => {
  try {
    console.log('Creating payment intent with data:', JSON.stringify(paymentData));

    // Add automatic_payment_methods parameter to enable all available payment methods
    const requestData = {
      ...paymentData,
      automatic_payment_methods: { enabled: true }
    };

    const response = await axios.post('/v1/payments/create-payment-intent', requestData);

    console.log('Payment intent response status:', response.status);
    console.log('Payment intent created successfully with ID:', response.data.id);

    // No need to automatically confirm here - will be handled by confirmPayment
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Could not create payment intent';
    throw new Error(errorMessage);
  }
};

// Replace confirmCardPayment with more generic confirmPayment
export const confirmPayment = async (clientSecret, options) => {
  const stripe = await getStripe();
  try {
    console.log('Confirming payment with options:', JSON.stringify(options));
    const { error, paymentIntent } = await stripe.confirmPayment(options);

    if (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }

    console.log('Payment confirmed successfully:', paymentIntent.status);
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const retrievePaymentIntent = async (clientSecret) => {
  const stripe = await getStripe();
  try {
    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

    if (error) throw error;
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving PaymentIntent:', error);
    throw error;
  }
};
