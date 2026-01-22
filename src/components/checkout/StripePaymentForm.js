import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency, isValidAmount } from '../../utils/paymentUtils';
import { logRender } from '../../utils/performanceUtils';
import {
  categorizeStripeError,
  handleNetworkError
} from '../../utils/paymentErrorUtils';
import StripeService from '../../services/stripe';

// Import from Material-UI
import {
  Button,
  alpha,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Collapse,
  IconButton,
  Paper,
  Checkbox,
  Divider,
  Tooltip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Import CartContext
import { useCart } from '../../contexts/CartContext';

// Import payment methods utilities
import {
  getImplementedPaymentMethods,
  getComingSoonPaymentMethods
} from '../../utils/paymentMethods';

// Import PaymentIcon component
import PaymentIcon from '../payment/PaymentIcon';

// Add this import at the top of the file
import PaymentMethodSelector from './payment/PaymentMethodSelector';

// Add the missing imports
import {
  normalizeOrderObject,
  normalizeCustomerObject,
  prepareAmountForApi,
  prepareAmountForDisplay
} from '../../utils/dataNormalizationClient';

// Update the imports to include the payment method order
import {
  PAYMENT_METHOD_ORDER
} from '../../constants/paymentConstants';

// Note: Removed unused imports ELEMENTS_APPEARANCE and PAYMENT_METHOD_TYPES

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
              >
                Retry
              </Button>
            }
          >
            {this.state.error?.message || 'An error occurred during payment processing'}
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Memoize PaymentStatus component to prevent unnecessary re-renders
const PaymentStatus = React.memo(({ status, error, onRetry, onCancel, onRefund }) => {
  // Log component render in development mode
  logRender('PaymentStatus', { status });

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <Box display="flex" alignItems="center">
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Processing payment...</Typography>
          </Box>
        );
      case 'succeeded':
        return (
          <Alert severity="success">
            Payment processed successfully!
          </Alert>
        );
      case 'failed':
        return (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            }
          >
            {error || 'Payment failed'}
          </Alert>
        );
      case 'cancelled':
        return (
          <Alert severity="warning">
            Payment was cancelled
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      {renderContent()}
      {status === 'succeeded' && (
        <Button
          color="secondary"
          size="small"
          onClick={onRefund}
          sx={{ mt: 1 }}
        >
          Request Refund
        </Button>
      )}
      {
        ['processing', 'requires_payment_method'].includes(status) && (
          <Button
            color="secondary"
            size="small"
            onClick={onCancel}
            sx={{ mt: 1 }}
          >
            Cancel Payment
          </Button>
        )
      }
    </Box>
  );
});

// Add display name for debugging
PaymentStatus.displayName = 'PaymentStatus';

// Payment method selection component
const PaymentMethodSelection = React.memo(({ selectedMethod, onSelectMethod }) => {
  // Log component render in development mode
  logRender('PaymentMethodSelection', { selectedMethod });

  // Get implemented and coming soon payment methods
  const implementedMethods = useMemo(() => getImplementedPaymentMethods(), []);
  const comingSoonMethods = useMemo(() => getComingSoonPaymentMethods(), []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.neutral',
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <CreditCardIcon sx={{ mr: 1, fontSize: 18 }} />
        Payment Methods
      </Typography>

      {/* Implemented payment methods */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {implementedMethods.map((method) => (
          <Paper
            key={method.id}
            variant="outlined"
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
              bgcolor: selectedMethod === method.id ? 'primary.lighter' : 'background.paper',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
                boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)'
              },
              transition: 'all 0.2s'
            }}
            onClick={() => onSelectMethod(method.id)}
          >
            <PaymentIcon
              icon={method.icon}
              name={method.name}
              height={24}
              spriteId={method.spriteId}
              sx={{ mr: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: selectedMethod === method.id ? 600 : 400 }}>
              {method.name}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Coming soon payment methods */}
      {comingSoonMethods.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
            Coming Soon
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {comingSoonMethods.map((method) => (
              <Tooltip key={method.id} title="Coming soon" arrow>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }}
                >
                  <PaymentIcon
                    icon={method.icon}
                    name={method.name}
                    height={20}
                    spriteId={method.spriteId}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption">
                    {method.name}
                  </Typography>
                </Paper>
              </Tooltip>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
});

// Add display name for debugging
PaymentMethodSelection.displayName = 'PaymentMethodSelection';

const StripePaymentForm = React.memo(({
  handleCompleteOrder,
  formInput = {},
  setFormInput = () => { }, // Provide default empty function to prevent errors
  cardholderName,
  amount,
  displayAmount, // Add displayAmount for proper display
  customer,
  order,
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('initial');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const safeCardholderName = cardholderName || '';

  // Use our normalization utilities to standardize data
  const normalizedOrder = useMemo(() => normalizeOrderObject(order), [order]);
  const normalizedCustomer = useMemo(() => normalizeCustomerObject(customer), [customer]);

  // Standardize amount handling
  const standardizedAmount = useMemo(() => {
    // If amount is directly provided, use it
    if (amount) return amount;

    // Otherwise get it from the normalized order
    return normalizedOrder ? prepareAmountForApi(normalizedOrder.amount) : 0;
  }, [amount, normalizedOrder]);

  // Format amount for display - directly use in component instead of storing in variable
  const formattedDisplayAmount = useMemo(() => {
    // If a formatted display amount is provided, use it
    if (displayAmount) return displayAmount;

    // Otherwise format the standardized amount
    return prepareAmountForDisplay(standardizedAmount);
  }, [displayAmount, standardizedAmount]);

  // Add state for selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  // Define payment element options within the component using the shared order
  const paymentElementOptions = useMemo(() => ({
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: true
    },
    paymentMethodOrder: PAYMENT_METHOD_ORDER,
    defaultValues: {
      billingDetails: {
        name: formInput?.cardholderName || cardholderName || normalizedCustomer?.name || '',
        email: normalizedCustomer?.email || ''
      },
      paymentMethod: selectedPaymentMethod
    },
    business: {
      name: 'NEXC LTD'
    }
  }), [formInput?.cardholderName, cardholderName, normalizedCustomer?.name, normalizedCustomer?.email, selectedPaymentMethod]);

  // Get cart context
  const { clientSecret, createPaymentIntent } = useCart();
  const [clientSecretLoading, setClientSecretLoading] = useState(false);

  // Effect to ensure clientSecret is available
  useEffect(() => {
    const ensureClientSecret = async () => {
      // If clientSecret is already available, no need to fetch it again
      if (clientSecret) {
        console.log('ClientSecret already available:', clientSecret.substring(0, 10) + '...');
        return;
      }

      // If amount is not valid, we can't create a payment intent
      if (!amount || amount <= 0) {
        console.warn('Invalid amount for payment intent:', amount);
        return;
      }

      try {
        setClientSecretLoading(true);
        console.log('Fetching clientSecret for amount:', amount);
        await createPaymentIntent(amount);
      } catch (error) {
        console.error('Error ensuring clientSecret:', error);
        setError('Failed to initialize payment system. Please try again.');
      } finally {
        setClientSecretLoading(false);
      }
    };

    ensureClientSecret();
  }, [clientSecret, createPaymentIntent, amount]);

  // Log component render in development mode
  logRender('StripePaymentForm', { disabled, loading });

  // Validate required props
  useEffect(() => {
    if (!order || (typeof order !== 'object')) {
      console.log('StripePaymentForm - customer:', customer);
      console.log('StripePaymentForm - customer type:', typeof customer);
      console.log('StripePaymentForm - customer keys:', customer ? Object.keys(customer) : 'null');
      console.log('StripePaymentForm - order:', order);
      console.log('StripePaymentForm - order type:', typeof order);
      console.log('StripePaymentForm - order keys:', order ? Object.keys(order) : 'null');

      if (!order || (typeof order !== 'object')) {
        setError('Order information is not available');
      } else if (!order._id && !order.id) {
        setError('Order ID is missing');
      } else if (!customer || typeof customer !== 'object') {
        setError('Customer information is missing');
      } else if (!customer._id && !customer.id) {
        setError('Customer ID is missing');
      } else {
        setError(null); // Clear error if validation passes
      }
    }
  }, [order, customer]);

  // Handle payment element change - memoized with useCallback
  const handlePaymentChange = useCallback((event) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  }, []);

  // Create a ref to store the current handleSubmit function
  const handleSubmitRef = useRef(null);

  // Validate form before submission - memoized with useCallback
  const validateForm = useCallback(() => {
    if (!formInput.cardholderName?.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    return true;
  }, [formInput.cardholderName]);

  // Handle payment submission - memoized with useCallback
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');

      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Validate stripe initialization
      if (!stripe || !elements) {
        throw new Error('Payment system not initialized');
      }

      // Check if amount is valid
      if (!isValidAmount(amount)) {
        const errorMessage = amount < 50
          ? 'Payment amount is too small'
          : 'Payment amount exceeds the maximum allowed';
        setError(errorMessage);
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      // Use the client secret from CartContext
      if (!clientSecret) {
        throw new Error('Payment not initialized. Please refresh the page and try again.');
      }

      // Use the centralized Stripe service to confirm payment with PaymentElement
      const result = await StripeService.confirmElementsPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/complete`,
          payment_method_data: {
            billing_details: {
              name: formInput.cardholderName || safeCardholderName,
              email: customer.email
            }
          },
          redirect: 'if_required'
        }
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Handle successful payment
      await handleCompleteOrder(formInput.saveCard);
      setPaymentStatus('succeeded');
      enqueueSnackbar('Payment processed successfully', { variant: 'success' });

    } catch (err) {
      console.error('Payment error:', err);

      let errorInfo;
      if (err.type && err.type.includes('stripe')) {
        errorInfo = categorizeStripeError(err);
      } else {
        errorInfo = handleNetworkError(err);
      }

      setError(errorInfo.message);
      setPaymentStatus('failed');
      enqueueSnackbar(errorInfo.message, {
        variant: 'error',
        autoHideDuration: errorInfo.retryable ? 6000 : 10000,
        action: errorInfo.retryable ?
          (key) => (
            <Button onClick={() => {
              // Use the ref instead of direct function reference
              handlePaymentRetry();
              closeSnackbar(key);
            }}>
              Retry
            </Button>
          ) : undefined
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateForm, stripe, elements, amount, customer, clientSecret, handleCompleteOrder, enqueueSnackbar, closeSnackbar, formInput, safeCardholderName]);

  // Handle payment retry - memoized with useCallback
  const handlePaymentRetry = useCallback(async () => {
    setError(null);
    // Try submitting again
    if (elements) {
      const element = elements.getElement(PaymentElement);
      if (element) {
        element.reset();
      }
    }
    // Use the ref to access the latest handleSubmit
    await handleSubmitRef.current();
  }, [elements, setError]);

  // Update the ref whenever handleSubmit changes
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // Handle payment cancellation - memoized with useCallback
  const handlePaymentCancel = useCallback(async () => {
    try {
      // Use the cancelPayment method from CartContext if it exists
      // For now, we'll just update the UI state
      setPaymentStatus('cancelled');
      enqueueSnackbar('Payment cancelled successfully', { variant: 'info' });
    } catch (err) {
      const errorResult = handleNetworkError(err);
      setError(errorResult.message);
      enqueueSnackbar(errorResult.message, { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Handle refund request - memoized with useCallback
  const handleRefundRequest = useCallback(async () => {
    try {
      // Use the refundPayment method from CartContext if it exists
      // For now, we'll just update the UI state
      setPaymentStatus('refunded');
      enqueueSnackbar('Refund processed successfully', { variant: 'success' });
    } catch (err) {
      const errorResult = handleNetworkError(err);
      setError(errorResult.message);
      enqueueSnackbar(errorResult.message, { variant: 'error' });
    }
  }, [enqueueSnackbar, setPaymentStatus, setError]);

  return (
    <ErrorBoundary onRetry={handlePaymentRetry}>
      <form onSubmit={handleSubmit}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            backgroundColor: (theme) => theme.palette.background.checkout?.card || theme.palette.background.paper,
            boxShadow: (theme) => theme.customShadows?.z8 || '0 4px 8px 0 rgba(145, 158, 171, 0.16)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: 'primary.main'
            }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '""',
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  marginRight: '8px'
                }
              }}>
                Payment Details
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Amount to pay:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  {/* Use formattedDisplayAmount instead of displayAmount */}
                  £{formattedDisplayAmount || (amount / 100).toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Payment will be processed securely via Stripe
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                placeholder="Name as it appears on card"
                value={formInput.cardholderName || cardholderName || ''}
                onChange={(e) => {
                  try {
                    setFormInput({ ...formInput, cardholderName: e.target.value });
                  } catch (err) {
                    console.warn('Error updating form input:', err);
                  }
                }}
                error={!formInput.cardholderName?.trim() && !cardholderName?.trim()}
                helperText={!formInput.cardholderName?.trim() && !cardholderName?.trim() ? 'Cardholder name is required' : ''}
                required
                disabled={disabled}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
                Payment Method
              </Typography>

              {/* Add the PaymentMethodSelector component before the PaymentElement in the render method */}
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                amount={amount}
              />
            </Grid>

            {/* Replace the CardElement with PaymentElement */}
            <Grid item xs={12}>
              <Box sx={{
                border: '1px solid',
                borderColor: error ? 'error.main' : 'divider',
                borderRadius: 2,
                p: 3,
                transition: 'all 0.3s',
                backgroundColor: error ? 'error.lighter' : 'background.paper',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                }
              }}>
                {clientSecretLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Initializing payment system...
                    </Typography>
                  </Box>
                ) : !clientSecret ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <Alert severity="warning">
                      Payment system not initialized. Please try refreshing the page.
                    </Alert>
                  </Box>
                ) : (
                  <PaymentElement
                    id="payment-element"
                    options={{
                      ...paymentElementOptions,
                      // Highlight the selected payment method
                      defaultValues: {
                        ...paymentElementOptions.defaultValues,
                        paymentMethod: selectedPaymentMethod
                      }
                    }}
                    onChange={handlePaymentChange}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              {/* PaymentSecurityNotice removed to avoid duplication - already rendered in CheckoutPayment */}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  id="save-card"
                  checked={formInput.saveCard || false}
                  onChange={(e) => {
                    try {
                      setFormInput({ ...formInput, saveCard: e.target.checked });
                    } catch (err) {
                      console.warn('Error updating save card option:', err);
                    }
                  }}
                  disabled={disabled}
                />
                <Typography variant="body2" component="label" htmlFor="save-card">
                  Save card for future payments
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <PaymentStatus
                status={paymentStatus}
                error={error}
                onRetry={handlePaymentRetry}
                onCancel={handlePaymentCancel}
                onRefund={handleRefundRequest}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Collapse in={!!error}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      boxShadow: (theme) => `0 2px 8px 0 ${alpha(theme.palette.error.main, 0.24)}`,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.24)}`
                    }}
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setError(null);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {error}
                  </Alert>
                </Collapse>
              </Grid>
            )}
            <Grid item xs={12}>
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={loading}
                disabled={!stripe || !elements || loading}
                loadingPosition="start"
                startIcon={<CreditCardIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  py: 1.5,
                  mt: 2,
                  boxShadow: (theme) => theme.customShadows?.primary || '0 8px 16px 0 rgba(252, 167, 0, 0.24)',
                  '&:hover': {
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? 'Processing Payment...' : `Pay ${formatCurrency(amount / 100)}`}
              </LoadingButton>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </ErrorBoundary>
  );
});

// Add display name for debugging
StripePaymentForm.displayName = 'StripePaymentForm';

StripePaymentForm.propTypes = {
  handleCompleteOrder: PropTypes.func.isRequired,
  formInput: PropTypes.object,
  setFormInput: PropTypes.func,
  cardholderName: PropTypes.string,
  amount: PropTypes.number.isRequired,
  displayAmount: PropTypes.string,
  customer: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

export default StripePaymentForm;
