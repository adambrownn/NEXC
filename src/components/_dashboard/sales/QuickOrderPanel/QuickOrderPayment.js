import React, { useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, ELEMENTS_APPEARANCE } from '../../../../services/stripe/stripe.config';
import StripePaymentForm from '../../../checkout/StripePaymentForm';
import {
  normalizeOrderObject,
  normalizeCustomerObject,
  prepareAmountForApi,
  prepareAmountForDisplay
} from '../../../../utils/dataNormalization';

/**
 * Component for handling payment processing in the QuickOrderPanel
 */
const QuickOrderPayment = ({
  currentOrder,
  selectedCustomer,
  handlePayment,
  paymentProcessing = false,
  paymentError,
  setPaymentError = () => { },
  clientSecret
}) => {
  // Normalize data
  const normalizedOrder = useMemo(() => normalizeOrderObject(currentOrder), [currentOrder]);
  const normalizedCustomer = useMemo(() => normalizeCustomerObject(selectedCustomer), [selectedCustomer]);

  // Format amount for API and display
  const orderAmountInPence = useMemo(() =>
    prepareAmountForApi(normalizedOrder?.amount || 0)
    , [normalizedOrder]);

  const formattedAmount = useMemo(() =>
    prepareAmountForDisplay(normalizedOrder?.amount || 0)
    , [normalizedOrder]);

  // Prepare data for Stripe form
  const customerForStripe = useMemo(() => normalizedCustomer, [normalizedCustomer]);
  const orderForStripe = useMemo(() => normalizedOrder, [normalizedOrder]);

  // Form input state
  const [formInput, setFormInput] = useState({
    cardholderName: normalizedCustomer?.name || '',
    saveCard: false
  });

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Order Reference: {normalizedOrder?.orderReference || 'N/A'}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total Amount: {formattedAmount}
      </Typography>

      {paymentError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {paymentError}
        </Alert>
      )}

      {clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: ELEMENTS_APPEARANCE
          }}
        >
          <StripePaymentForm
            amount={orderAmountInPence}
            displayAmount={formattedAmount}
            customer={customerForStripe}
            order={orderForStripe}
            formInput={formInput}
            setFormInput={setFormInput}
            handleCompleteOrder={handlePayment}
            disabled={paymentProcessing}
          />
        </Elements>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default QuickOrderPayment;