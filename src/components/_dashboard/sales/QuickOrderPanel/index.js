import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../../../axiosConfig';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Container,
  Paper,
  Stack,
  CircularProgress,
  LinearProgress,
  Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';

// Import subcomponents
import QuickOrderCustomer from './QuickOrderCustomer';
import QuickOrderServices from './QuickOrderServices';
import QuickOrderDetails from './QuickOrderDetails';
import QuickOrderSummary from './QuickOrderSummary';
import QuickOrderPayment from './QuickOrderPayment';
import QuickOrderServiceDetails from './ServiceDetails/QuickOrderServiceDetails';
import { ContentSkeleton, StepTransition } from './QuickOrderComponents';
import { salesService } from '../../../../services/sales.service';

// Import utility functions
import {
  generateOrderReference,
  getStripePromise
} from './QuickOrderUtils';

// Add these imports at the top of the file
import {
  normalizeOrderObject,
  normalizeCustomerObject
} from '../../../../utils/dataNormalization';
import {
  getId,
  getOrderAmount,
  getOrderReference
} from '../../../../utils/propertyAccessUtils';

const steps = ['Customer Selection', 'Service Selection', 'Service Details', 'Order Summary', 'Payment', 'Confirmation'];
const stripePromise = getStripePromise();

const QuickOrderPanel = React.memo(({
  customer,
  onCustomerNeeded,
  services: initialServices,
  onSuccess,
  qualifications = []
}) => {
  // Memoize initial state
  const initialState = useMemo(() => ({
    customer: customer || null,
    services: initialServices || [],
    qualifications: qualifications || [],
  }), [customer, initialServices, qualifications]);

  // Core states with proper initialization
  const [activeStep, setActiveStep] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [selectedCustomer, setSelectedCustomer] = useState(initialState.customer);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [orderNotes, setOrderNotes] = useState('');
  const [isCustomerConfirmed, setIsCustomerConfirmed] = useState(false);
  const [services, setServices] = useState(initialState.services);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerBookings] = useState({ booked: [], reserved: [] });
  const [orderSummary, setOrderSummary] = useState(null);
  const [orderDraft, setOrderDraft] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [formInput, setFormInput] = useState({});
  const [stripe, setStripe] = useState(null);
  const [stripeError, setStripeError] = useState(null);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderScheduledDate, setOrderScheduledDate] = useState('');
  const [orderPriority, setOrderPriority] = useState('normal');


  // Advanced filters state
  const [serviceMetadata, setServiceMetadata] = useState({
    categories: ['all'],
    maxPrice: 1000,
    locations: ['all'],
    deliveryMethods: ['all']
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: [0, serviceMetadata.maxPrice],
    location: 'all',
    deliveryMethod: 'all',
    status: 'active',
    hasPrerequisites: false
  });

  // Loading states for better UX
  const [loadingStates, setLoadingStates] = useState({
    customerValidation: false,
    serviceLoading: false,
    orderCreation: false,
    paymentProcessing: false
  });

  // Snackbar for notifications
  const { enqueueSnackbar } = useSnackbar();

  // Update currentOrder when createdOrder changes
  useEffect(() => {
    if (createdOrder && (!currentOrder || getId(currentOrder) !== getId(createdOrder))) {
      console.log('Setting currentOrder from createdOrder in useEffect:', createdOrder);

      // Use normalizeOrderObject instead of manual property access
      const normalizedOrder = normalizeOrderObject(createdOrder);

      // Set the normalized order
      setCurrentOrder(normalizedOrder);
    }
  }, [createdOrder, currentOrder]);

  // Event listener for proceeding to payment
  useEffect(() => {
    const handleNextStep = () => {
      // Ensure currentOrder is set before moving to payment step
      if (!currentOrder && createdOrder) {
        setCurrentOrder(createdOrder);
      }
      setActiveStep(4); // Move to payment step
    };

    window.addEventListener('nextStep', handleNextStep);

    return () => {
      window.removeEventListener('nextStep', handleNextStep);
    };
  }, [currentOrder, createdOrder]);

  // Price validation
  const [priceValidation] = useState({
    isValid: true,
    errors: []
  });

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        if (!stripePromise) {
          throw new Error('Stripe could not be initialized - missing publishable key');
        }
        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          throw new Error('Failed to initialize Stripe');
        }
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Stripe initialization error:', error);
        setStripeError(error.message);
      }
    };

    initializeStripe();
  }, []);

  // Filtered services based on search and filters
  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) {
      return [];
    }

    return services.filter(service => {
      // Category filter
      if (activeCategory !== 'all' && service.category !== activeCategory) {
        return false;
      }

      // Search query
      if (searchQuery && !service.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !service.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Price range filter
      if (service.price < advancedFilters.priceRange[0] ||
        service.price > advancedFilters.priceRange[1]) {
        return false;
      }

      // Location filter
      if (advancedFilters.location !== 'all' &&
        service.location !== advancedFilters.location) {
        return false;
      }

      // Delivery method filter
      if (advancedFilters.deliveryMethod !== 'all' &&
        service.deliveryMethod !== advancedFilters.deliveryMethod) {
        return false;
      }

      // Status filter
      if (advancedFilters.status !== 'all' && service.status !== advancedFilters.status) {
        return false;
      }

      // Prerequisites filter
      if (advancedFilters.hasPrerequisites && !service.hasPrerequisites) {
        return false;
      }

      return true;
    });
  }, [services, activeCategory, searchQuery, advancedFilters]);

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedServices(prev => {
      const serviceId = service._id || service.id;
      const exists = prev.some(s => (s._id || s.id) === serviceId);

      if (exists) {
        return prev.filter(s => (s._id || s.id) !== serviceId);
      } else {
        return [...prev, service];
      }
    });
  };

  // Handle service details update
  const handleServiceDetailsUpdate = (serviceId, details) => {
    setServiceDetails(prev => ({
      ...prev,
      [serviceId]: details
    }));
  };

  // Handle customer confirmation
  const handleCustomerConfirmation = (confirmed) => {
    setIsCustomerConfirmed(confirmed);
    if (confirmed) {
      setActiveStep(1);
    }
  };

  // Handle change customer
  const handleChangeCustomer = () => {
    setIsCustomerConfirmed(false);
    if (onCustomerNeeded) {
      onCustomerNeeded();
    }
  };

  // Handle create order
  const handleCreateOrder = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, orderCreation: true }));

      if (!selectedCustomer || !selectedCustomer._id) {
        throw new Error('No customer selected');
      }

      if (selectedServices.length === 0) {
        throw new Error('No services selected');
      }

      // Create order draft if not exists
      if (!orderDraft) {
        const orderReference = generateOrderReference();
        setOrderDraft({
          orderReference,
          customer: selectedCustomer._id,
          services: selectedServices.map(service => ({
            service: service._id || service.id,
            price: service.price,
            details: serviceDetails[service._id || service.id] || {}
          })),
          notes: orderNotes,
          status: orderStatus,
          priority: orderPriority,
          scheduledDate: orderScheduledDate || null
        });
      }

      // Create order in backend
      const response = await axiosInstance.post('/v1/orders', {
        customer: selectedCustomer._id,
        services: selectedServices.map(service => {
          // Determine service type based on category
          let serviceType = '';
          switch (service.category?.toLowerCase()) {
            case 'cards':
              serviceType = 'card';
              break;
            case 'tests':
              serviceType = 'test';
              break;
            case 'courses':
              serviceType = 'course';
              break;
            case 'qualifications':
              serviceType = 'qualification';
              break;
            default:
              serviceType = 'service';
          }

          return {
            service: service._id || service.id,
            price: service.price,
            serviceType, // Add serviceType field
            details: serviceDetails[service._id || service.id] || {}
          };
        }),
        notes: orderNotes,
        status: orderStatus,
        priority: orderPriority,
        scheduledDate: orderScheduledDate || null,
        orderReference: orderDraft?.orderReference,
        // Calculate total amount
        itemsTotal: selectedServices.reduce((total, service) => total + (service.price || 0), 0),
        grandTotalToPay: selectedServices.reduce((total, service) => total + (service.price || 0), 0)
      });

      // Set amount in the response data if not already set
      if (!response.data.amount && response.data.itemsTotal) {
        response.data.amount = response.data.itemsTotal;
      }

      setCreatedOrder(response.data);
      setCurrentOrder(response.data);
      setOrderSummary(response.data);
      setActiveStep(3);
      enqueueSnackbar('Order created successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error creating order:', error);
      enqueueSnackbar(error.message || 'Failed to create order', { variant: 'error' });
    } finally {
      setLoadingStates(prev => ({ ...prev, orderCreation: false }));
    }
  };

  // Handle payment
  const handlePayment = async (paymentIntent) => {
    try {
      setLoadingStates(prev => ({ ...prev, paymentProcessing: true }));
      setPaymentError(null);

      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      if (!paymentIntent?.id) {
        throw new Error('Payment intent not created');
      }

      // Use the paymentIntent directly as it's already confirmed by the StripePaymentForm
      const confirmedPayment = paymentIntent;

      // Generate service references based on the order reference
      const generateServiceReferences = (orderRef, services) => {
        return services.map((service, index) => ({
          serviceId: service._id || service.id,
          serviceReference: `${orderRef}-S${index + 1}`
        }));
      };

      const serviceReferences = generateServiceReferences(
        createdOrder.orderReference,
        selectedServices
      );

      // Update order with payment success and service references
      await axiosInstance.put(`/v1/orders/${createdOrder._id}`, {
        paymentStatus: 2, // 2 = paid
        paymentIntentId: confirmedPayment.id,
        serviceReferences: serviceReferences
      });

      // Fetch the complete updated order with payment details
      const updatedOrderResponse = await axiosInstance.get(`/v1/orders/${createdOrder._id}`);
      const completeOrder = updatedOrderResponse.data;

      // Update all state variables with the complete order
      setCreatedOrder(completeOrder);
      setCurrentOrder(completeOrder);
      setOrderSummary(completeOrder);

      setActiveStep(prevStep => prevStep + 1);
      enqueueSnackbar('Payment processed successfully', { variant: 'success' });

      // Pass the complete updated order
      if (onSuccess) {
        onSuccess(completeOrder); // Changed from createdOrder to completeOrder
      }

      return confirmedPayment;
    } catch (error) {
      console.error('Error updating order after payment:', error);
      enqueueSnackbar(`Error updating order: ${error.response?.data?.message || error.message}`, { variant: 'error' });
      // Don't advance to the next step if order update fails
      setPaymentError(`Order update failed: ${error.response?.data?.message || error.message}`);


      // Update order with payment failure
      if (createdOrder?._id) {
        await axiosInstance.put(`/v1/orders/${createdOrder._id}`, {
          paymentStatus: 3, // 3 = cancelled
          paymentError: error.message
        });
      }

      // Return an error object with id property to prevent TypeError in StripePaymentForm
      return {
        id: paymentIntent?.id || 'error',
        status: 'failed',
        error: error.message
      };
    } finally {
      setLoadingStates(prev => ({ ...prev, paymentProcessing: false }));
    }
  };

  // Handle next step
  const handleNext = () => {
    // If moving from order summary to payment, ensure currentOrder is set
    if (activeStep === 3) {
      if (!currentOrder && createdOrder) {
        // Use normalizeOrderObject instead of manual property access
        const normalizedOrder = normalizeOrderObject(createdOrder);
        console.log('Setting currentOrder in handleNext:', normalizedOrder);
        setCurrentOrder(normalizedOrder);

        // Use setTimeout to ensure state is updated before advancing
        setTimeout(() => {
          setActiveStep(prevActiveStep => prevActiveStep + 1);
        }, 0);
      } else {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      }
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Render step content
  const renderStepContent = (step) => (
    <StepTransition index={step} activeStep={activeStep}>
      {(() => {
        switch (step) {
          case 0:
            return (
              <QuickOrderCustomer
                selectedCustomer={selectedCustomer}
                customerBookings={customerBookings}
                isCustomerConfirmed={isCustomerConfirmed}
                handleChangeCustomer={handleChangeCustomer}
                handleCustomerConfirmation={handleCustomerConfirmation}
                loadingStates={loadingStates}
                ContentSkeleton={ContentSkeleton}
              />
            );
          case 1:
            return (
              <QuickOrderServices
                filteredServices={filteredServices}
                selectedServices={selectedServices}
                handleServiceSelect={handleServiceSelect}
                serviceMetadata={serviceMetadata}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                setSearchQuery={setSearchQuery}
                loading={loading}
                priceValidation={priceValidation}
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
                handleNext={handleNext}
              />
            );
          case 2:
            return (
              <Stack spacing={3}>
                <QuickOrderDetails
                  orderStatus={orderStatus}
                  setOrderStatus={setOrderStatus}
                  orderScheduledDate={orderScheduledDate}
                  setOrderScheduledDate={setOrderScheduledDate}
                  orderPriority={orderPriority}
                  setOrderPriority={setOrderPriority}
                />
                <QuickOrderServiceDetails
                  selectedServices={selectedServices}
                  serviceDetails={serviceDetails}
                  handleServiceDetailsUpdate={handleServiceDetailsUpdate}
                  orderDraft={orderDraft}
                  ContentSkeleton={ContentSkeleton}
                  loadingStates={loadingStates}
                  onNext={handleNext}
                />
              </Stack>
            );
          case 3:
            return (
              <QuickOrderSummary
                orderSummary={orderSummary}
                selectedCustomer={selectedCustomer}
                selectedServices={selectedServices}
                serviceDetails={serviceDetails}
                orderNotes={orderNotes}
                setOrderNotes={setOrderNotes}
                handleCreateOrder={handleCreateOrder}
                createdOrder={createdOrder}
                orderDraft={orderDraft}
                loadingStates={loadingStates}
                ContentSkeleton={ContentSkeleton}
              />
            );
          case 4:
            console.log('Rendering QuickOrderPayment with currentOrder:', currentOrder);

            // Ensure currentOrder is set before rendering the payment step
            if (!currentOrder && createdOrder) {
              console.log('Setting currentOrder from createdOrder in renderStepContent:', createdOrder);
              const normalizedOrder = normalizeOrderObject(createdOrder);
              setCurrentOrder(normalizedOrder);

              // Return a loading state while the state updates
              return <ContentSkeleton />;
            }

            // Add a more explicit guard to ensure we don't render with invalid data
            if (!currentOrder || typeof currentOrder !== 'object' || !getId(currentOrder)) {
              return (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body1" color="error">
                    Loading order data... Please wait.
                  </Typography>
                  <LinearProgress />
                  <ContentSkeleton />
                </Paper>
              );
            }

            return (
              <QuickOrderPayment
                currentOrder={currentOrder}
                selectedCustomer={selectedCustomer}
                formInput={formInput}
                setFormInput={setFormInput}
                handlePayment={handlePayment}
                stripeError={stripeError}
                paymentError={paymentError}
                loadingStates={loadingStates}
                ContentSkeleton={ContentSkeleton}
              />
            );
          case 5:
            // Order Confirmation Step (after successful payment)
            return (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    Payment Successful!
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Thank you for your order
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Order Reference: {createdOrder?.orderReference || 'N/A'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    A confirmation email has been sent to {selectedCustomer?.email || 'your email address'}.
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        // Reset the form and start a new order
                        window.location.reload();
                      }}
                    >
                      Create New Order
                    </Button>
                  </Box>
                </Box>
              </Paper>
            );
          default:
            return null;
        }
      })()}
    </StepTransition>
  );

  // Fetch services if not provided
  useEffect(() => {
    const fetchServices = async () => {
      if (initialServices && initialServices.length > 0) {
        // If we have services from props, use those
        setServices(initialServices);
        return;
      }

      setLoading(true);
      try {
        const data = await salesService.getServices();
        setServices(data);

        // Update metadata
        const uniqueCategories = ['all', ...new Set(data.map(s => s.category).filter(Boolean))];
        setServiceMetadata(prev => ({
          ...prev,
          categories: uniqueCategories
        }));
      } catch (error) {
        console.error('Error fetching services:', error);
        enqueueSnackbar(error.message || 'Failed to fetch services', {
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [initialServices, enqueueSnackbar]);

  // Main render
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ mt: 2 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          sx={{ display: activeStep === 0 ? 'none' : 'block' }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep < 5 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !isCustomerConfirmed) ||
              (activeStep === 1 && selectedServices.length === 0) ||
              loading
            }
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Next'
            )}
          </Button>
        )}
      </Box>
    </Container>
  );
});

export default QuickOrderPanel;
