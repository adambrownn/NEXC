import { useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { CheckoutContext } from "../../pages/EcommerceCheckout";
import arrowIosBackFill from "@iconify/icons-eva/arrow-ios-back-fill";
// material
import {
  Grid,
  Button,
  Card,
  CardHeader,
  Backdrop,
  CircularProgress,
  Checkbox,
  Alert,
  FormControlLabel,
  Box,
  Typography,
} from "@mui/material";

//Stripe
import { Elements } from '@stripe/react-stripe-js';
import { useTheme } from '@mui/material/styles';
import StripeService from '../../services/stripe';

// Custom components and hooks
import StripePaymentForm from './StripePaymentForm';
import OrderSummaryPanel from './payment/OrderSummaryPanel';
import PaymentSecurityNotice from './payment/PaymentSecurityNotice';

// Import CartContext
import { useCart } from '../../contexts/CartContext';
import { logRender } from '../../utils/performanceUtils';

// Add the missing imports - FIXED: Use client version
import {
  normalizeCustomerObject,
} from '../../utils/dataNormalizationClient';

// Use the centralized Stripe service to get the Stripe instance
const stripePromise = StripeService.getStripe();

/**
 * CheckoutPayment component
 * Handles payment processing for checkout
 */
function CheckoutPayment() {
  // Log component render in development mode
  logRender('CheckoutPayment', {});

  // Initialize theme at the top level (not conditionally)
  const theme = useTheme();

  // Get checkout context for navigation and order management
  const {
    handleNext,
    handleBack,
    setOrderId
  } = useContext(CheckoutContext);

  // Use CartContext for all cart-related operations
  const {
    items = [],
    customer = {},
    loading: cartLoading,
    error: cartError,
    createPaymentIntent,
    confirmPayment,
    clientSecret,
    paymentStatus,
    operationInProgress,
    operationError,
    resetOperationError,
    createOrder
  } = useCart();

  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderIdState] = useState(null);
  const [formInput, setFormInput] = useState({ cardholderName: customer?.name || '', saveCard: false });
  const [paymentError, setPaymentError] = useState(null);
  const [paymentIntentLoading, setPaymentIntentLoading] = useState(false);

  // Memoize expensive calculations - using existing simple calculation
  const { totalAmountInPounds, totalAmount, displayAmount } = useMemo(() => {
    // Calculate total amount in pounds
    const totalAmountInPounds = items.reduce((total, item) => (
      total + (Number(item.price) * (item.quantity || 1))
    ), 0);

    // Convert to pence for Stripe (multiply by 100)
    const totalAmount = Math.round(totalAmountInPounds * 100);

    // Format for display (pounds)
    const displayAmount = totalAmountInPounds.toFixed(2);

    return { totalAmountInPounds, totalAmount, displayAmount };
  }, [items]);

  // Initialize payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      if (items.length > 0 && customer?.email && !clientSecret) {
        setPaymentIntentLoading(true);
        try {
          const result = await createPaymentIntent(totalAmountInPounds);
          if (!result.success) {
            throw new Error(result.error || 'Failed to initialize payment');
          }
        } catch (error) {
          setPaymentError(error.message || 'Failed to initialize payment');
        } finally {
          setPaymentIntentLoading(false);
        }
      }
    };

    initializePayment();
  }, [items, customer, clientSecret, createPaymentIntent, totalAmountInPounds]);

  // Handle payment completion - memoized with useCallback to prevent unnecessary re-renders
  const handleCompleteOrder = useCallback(async (paymentMethodId) => {
    if (!isTermsAccepted) {
      setPaymentError("Please accept Terms & Conditions before continuing");
      return;
    }

    try {
      setProcessing(true);
      setPaymentError(null);
      setOpenBackdrop(true);

      // Confirm payment using CartContext
      const confirmResult = await confirmPayment(paymentMethodId, formInput.saveCard);
      if (!confirmResult.success) {
        throw new Error(confirmResult.error || "Payment confirmation failed");
      }

      // Prepare order data
      const orderData = {
        customer: customer,
        items: items,
        paymentMethod: 'stripe',
        paymentStatus: confirmResult.status || 'succeeded',
        stripePaymentMethodId: paymentMethodId,
        amount: totalAmount
      };

      // Create order using CartContext
      const orderResult = await createOrder(orderData);
      if (!orderResult.success) {
        throw new Error(orderResult.error || "Order creation failed");
      }

      const newOrderId = orderResult.order.id;

      // Update the orderId state
      setOrderIdState(newOrderId);

      // Save order ID and advance to completion
      setOrderId(newOrderId);
      handleNext();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || "An unexpected error occurred during payment processing");
    } finally {
      setOpenBackdrop(false);
      setProcessing(false);
    }
  }, [
    isTermsAccepted,
    customer,
    items,
    totalAmount,
    confirmPayment,
    createOrder,
    formInput.saveCard,
    setOrderId,
    handleNext
  ]);

  // Use normalized data properly
  const normalizedCustomer = useMemo(() => {
    return normalizeCustomerObject(customer);
  }, [customer]);

  if (!stripePromise) {
    return (
      <Card sx={{ p: 3 }}>
        <CardHeader title="Payment Processing Unavailable" />
        <Alert severity="warning" sx={{ mb: 3 }}>
          Payment processing is currently unavailable. Please try again later.
        </Alert>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        {cartLoading || paymentIntentLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
              {paymentIntentLoading ? 'Initializing payment system...' : 'Loading cart data...'}
            </Typography>
          </Box>
        ) : cartError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {cartError}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please try refreshing the page or contact customer support if the problem persists.
            </Typography>
          </Alert>
        ) : (
          <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: theme.customShadows.z12 }}>
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Payment Method
                </Typography>
              }
            />
            {(paymentError || operationError) && (
              <Alert severity="error" sx={{ mx: 3, mb: 3 }}>
                {paymentError || operationError}
                <Button
                  size="small"
                  sx={{ ml: 2 }}
                  onClick={() => {
                    setPaymentError(null);
                    resetOperationError();
                  }}
                >
                  Dismiss
                </Button>
              </Alert>
            )}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Icon icon="mdi:shield-lock" style={{ marginRight: 8, color: theme.palette.primary.main }} />
                Secure payment processing by Stripe
              </Typography>

              {/* Payment Security Notice Component */}
              <PaymentSecurityNotice />

              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  key={clientSecret} // Add a key based on clientSecret to force proper re-mounting
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: theme.palette.primary.main,
                        fontFamily: theme.typography.fontFamily,
                        colorBackground: '#ffffff',
                        colorText: '#30313d',
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
                    }
                  }}
                >
                  <StripePaymentForm
                    handleCompleteOrder={handleCompleteOrder}
                    amount={totalAmount}
                    displayAmount={displayAmount}
                    cardholderName={normalizedCustomer?.name}
                    formInput={formInput}
                    setFormInput={setFormInput}
                    disabled={processing || operationInProgress}
                    order={{ _id: orderId || 'temp-order-id' }} // Use actual order ID if available
                    customer={{ _id: customer?.id || 'temp-customer-id', email: customer?.email }}
                    paymentStatus={paymentStatus}
                  />
                </Elements>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
                    Initializing payment system...
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isTermsAccepted}
                      onChange={(e) => setIsTermsAccepted(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the <a href="/terms" target="_blank" rel="noopener">terms and conditions</a> and <a href="/privacy" target="_blank" rel="noopener">privacy policy</a>
                    </Typography>
                  }
                />
              </Box>
            </Box>
          </Card>
        )}

        <Button
          color="inherit"
          size="large"
          onClick={handleBack}
          startIcon={<Icon icon={arrowIosBackFill} />}
          disabled={processing || cartLoading}
        >
          Back to Order Summary
        </Button>
      </Grid>

      <Grid item xs={12} md={4}>
        {/* Order Summary Panel Component */}
        <OrderSummaryPanel
          customer={customer}
          items={items}
          displayAmount={displayAmount}
          isTermsAccepted={isTermsAccepted}
          processing={processing}
          onCompleteOrder={handleCompleteOrder}
        />
      </Grid>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Grid>
  );
}

// Export the component with a display name for debugging
CheckoutPayment.displayName = 'CheckoutPayment';

export default CheckoutPayment;
