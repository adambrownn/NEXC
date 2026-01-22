import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  Collapse,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import trashFill from '@iconify/icons-eva/trash-2-fill';
import editFill from '@iconify/icons-eva/edit-fill';
import personFill from '@iconify/icons-eva/person-fill';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../../../axiosConfig';
import { useAuth } from '../../../../contexts/AuthContext';

// Import subcomponents
import QuickOrderCustomer from './QuickOrderCustomer';
import QuickOrderServices from './QuickOrderServices';
import QuickOrderDetails from './QuickOrderDetails';
import QuickOrderSummary from './QuickOrderSummary';
import QuickOrderPayment from './QuickOrderPayment';
import QuickOrderServiceDetails from './ServiceDetails/QuickOrderServiceDetails';
import { ContentSkeleton, StepTransition } from './QuickOrderComponents';

// Import services
import { salesService } from '../../../../services/sales.service';

// Import utility functions
import {
  getStripePromise
} from './QuickOrderUtils';

// Import normalization utilities - FIXED: Use client version
import {
  normalizeOrderObject
} from '../../../../utils/dataNormalizationClient';

// Import order helper utilities
import { prepareOrderData, generateOrderReference } from '../../../../utils/orderHelpers';

// Import property access utilities - FIXED: Use client version
import {
  getId
} from '../../../../utils/dataNormalizationClient';

// Constants
const STEPS = ['Customer Selection', 'Service Selection', 'Order Configuration', 'Review & Create Order', 'Payment', 'Confirmation'];
const INITIAL_FILTERS = {
  priceRange: [0, 1000],
  location: 'all',
  deliveryMethod: 'all',
  status: 'active',
  hasPrerequisites: false
};

const QuickOrderPanel = React.memo(({
  customer,
  onCustomerNeeded,
  services: initialServices = [],
  onSuccess,
  qualifications = [],
  initialGroupBookingMode = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const stripePromise = useMemo(() => getStripePromise(), []);

  // Core state
  const [activeStep, setActiveStep] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [selectedCustomer, setSelectedCustomer] = useState(customer || null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [orderNotes, setOrderNotes] = useState('');
  const [isCustomerConfirmed, setIsCustomerConfirmed] = useState(false);

  // Services state
  const [services, setServices] = useState(initialServices);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceMetadata, setServiceMetadata] = useState({
    categories: ['all'],
    maxPrice: 1000,
    locations: ['all'],
    deliveryMethods: ['all']
  });
  const [advancedFilters, setAdvancedFilters] = useState(INITIAL_FILTERS);

  // Order state
  const [orderDraft, setOrderDraft] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderScheduledDate, setOrderScheduledDate] = useState('');
  const [orderPriority, setOrderPriority] = useState('normal');

  // Payment state
  const [stripe, setStripe] = useState(null);
  const [stripeError, setStripeError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [formInput, setFormInput] = useState({});
  const [clientSecret, setClientSecret] = useState(null);

  // Group Booking state - initialized from prop or auto-detected from customer type
  const [isGroupBooking, setIsGroupBooking] = useState(
    initialGroupBookingMode || customer?.customerType === 'COMPANY'
  );
  const [organizationInfo, setOrganizationInfo] = useState({
    organizationName: customer?.companyName || customer?.name || '',
    contactName: customer?.contactPerson || '',
    contactEmail: customer?.email || '',
    contactPhone: customer?.phone || '',
    notes: ''
  });
  const [recipients, setRecipients] = useState([]);
  const [recipientDialogOpen, setRecipientDialogOpen] = useState(false);
  const [editingRecipientIndex, setEditingRecipientIndex] = useState(null);
  const [currentRecipient, setCurrentRecipient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    niNumber: '',
    address: '',
    postcode: ''
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    customerValidation: false,
    serviceLoading: false,
    orderCreation: false,
    paymentProcessing: false
  });

  // Validation
  const [priceValidation] = useState({
    isValid: true,
    errors: []
  });

  // Memoized customer bookings (simplified)
  const customerBookings = useMemo(() => ({
    booked: [],
    reserved: []
  }), []);

  // Initialize Stripe
  useEffect(() => {
    if (!stripePromise) return;

    const initializeStripe = async () => {
      try {
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
  }, [stripePromise]);

  // Fetch services if not provided
  useEffect(() => {
    if (initialServices && initialServices.length > 0) {
      setServices(initialServices);
      return;
    }

    const fetchServices = async () => {
      setLoadingStates(prev => ({ ...prev, serviceLoading: true }));
      try {
        const data = await salesService.getServices();
        setServices(data);

        const uniqueCategories = ['all', ...new Set(data.map(s => s.category).filter(Boolean))];
        setServiceMetadata(prev => ({
          ...prev,
          categories: uniqueCategories
        }));
      } catch (error) {
        console.error('Error fetching services:', error);
        enqueueSnackbar('Failed to fetch services', { variant: 'error' });
      } finally {
        setLoadingStates(prev => ({ ...prev, serviceLoading: false }));
      }
    };

    fetchServices();
  }, [initialServices, enqueueSnackbar]);

  // Update currentOrder when createdOrder changes
  useEffect(() => {
    if (createdOrder && (!currentOrder || getId(currentOrder) !== getId(createdOrder))) {
      const normalizedOrder = normalizeOrderObject(createdOrder);
      setCurrentOrder(normalizedOrder);
    }
  }, [createdOrder, currentOrder]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];

    return services.filter(service => {
      // Category filter
      if (activeCategory !== 'all' && service.category !== activeCategory) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!service.title?.toLowerCase().includes(searchLower) &&
            !service.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Price range filter
      if (service.price < advancedFilters.priceRange[0] ||
          service.price > advancedFilters.priceRange[1]) {
        return false;
      }

      // Status filter
      if (advancedFilters.status !== 'all' && service.status !== advancedFilters.status) {
        return false;
      }

      return true;
    });
  }, [services, activeCategory, searchQuery, advancedFilters]);

  // Event handlers
  const handleServiceSelect = useCallback((service) => {
    setSelectedServices(prev => {
      const serviceId = service._id || service.id;
      const exists = prev.some(s => (s._id || s.id) === serviceId);

      if (exists) {
        return prev.filter(s => (s._id || s.id) !== serviceId);
      } else {
        return [...prev, service];
      }
    });
  }, []);

  const handleServiceDetailsUpdate = useCallback((serviceId, details) => {
    setServiceDetails(prev => ({
      ...prev,
      [serviceId]: details
    }));
  }, []);

  const handleCustomerConfirmation = useCallback((confirmed) => {
    setIsCustomerConfirmed(confirmed);
    if (confirmed) {
      setActiveStep(1);
    }
  }, []);

  const handleChangeCustomer = useCallback(() => {
    setIsCustomerConfirmed(false);
    if (onCustomerNeeded) {
      onCustomerNeeded();
    }
  }, [onCustomerNeeded]);

  // Group Booking handlers
  const handleOpenRecipientDialog = useCallback((index = null) => {
    if (index !== null) {
      setEditingRecipientIndex(index);
      setCurrentRecipient(recipients[index]);
    } else {
      setEditingRecipientIndex(null);
      setCurrentRecipient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        niNumber: '',
        address: '',
        postcode: ''
      });
    }
    setRecipientDialogOpen(true);
  }, [recipients]);

  const handleCloseRecipientDialog = useCallback(() => {
    setRecipientDialogOpen(false);
    setEditingRecipientIndex(null);
    setCurrentRecipient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      niNumber: '',
      address: '',
      postcode: ''
    });
  }, []);

  const handleSaveRecipient = useCallback(() => {
    if (!currentRecipient.firstName?.trim() || !currentRecipient.lastName?.trim()) {
      enqueueSnackbar('First name and last name are required', { variant: 'error' });
      return;
    }
    if (editingRecipientIndex !== null) {
      setRecipients(prev => prev.map((r, i) => i === editingRecipientIndex ? { ...currentRecipient, id: r.id } : r));
    } else {
      setRecipients(prev => [...prev, { ...currentRecipient, id: `recipient_${Date.now()}` }]);
    }
    handleCloseRecipientDialog();
    enqueueSnackbar(editingRecipientIndex !== null ? 'Recipient updated' : 'Recipient added', { variant: 'success' });
  }, [currentRecipient, editingRecipientIndex, handleCloseRecipientDialog, enqueueSnackbar]);

  const handleRemoveRecipient = useCallback((index) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
    enqueueSnackbar('Recipient removed', { variant: 'info' });
  }, [enqueueSnackbar]);

  const handleOrganizationChange = useCallback((field) => (event) => {
    setOrganizationInfo(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const handleRecipientChange = useCallback((field) => (event) => {
    setCurrentRecipient(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const handleCreateOrder = useCallback(async () => {
    if (!selectedCustomer?._id) {
      enqueueSnackbar('No customer selected', { variant: 'error' });
      return;
    }

    if (selectedServices.length === 0) {
      enqueueSnackbar('No services selected', { variant: 'error' });
      return;
    }

    setLoadingStates(prev => ({ ...prev, orderCreation: true }));

    try {
      // Build items with recipient details for group bookings
      let orderItems = selectedServices;
      if (isGroupBooking && recipients.length > 0) {
        // For group bookings, create items for each recipient
        orderItems = [];
        recipients.forEach(recipient => {
          selectedServices.forEach(service => {
            orderItems.push({
              ...service,
              recipientId: recipient.id,
              recipientDetails: {
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                dateOfBirth: recipient.dateOfBirth,
                email: recipient.email,
                phone: recipient.phone,
                NINumber: recipient.niNumber,
                address: recipient.address,
                postcode: recipient.postcode
              }
            });
          });
        });
      }

      // Use existing orderHelpers utility to prepare standardized order data
      const orderData = prepareOrderData({
        orderType: 'PHONE',
        customer: selectedCustomer,
        customerId: selectedCustomer._id,
        items: orderItems,
        configurations: serviceDetails,
        orderReference: orderDraft?.orderReference || generateOrderReference(),
        paymentStatus: 0, // Not initiated for phone orders
        paymentMethod: 'pending',
        createdBy: user?.userId || user?._id, // Staff member creating the order
        notes: orderNotes,
        status: orderStatus || 'pending'
      });

      // Add group booking fields if enabled
      if (isGroupBooking) {
        orderData.isGroupBooking = true;
        orderData.organizationName = organizationInfo.organizationName;
        orderData.bookingContact = {
          name: organizationInfo.contactName,
          email: organizationInfo.contactEmail,
          phone: organizationInfo.contactPhone
        };
        orderData.groupBookingNotes = organizationInfo.notes;
        orderData.recipientIds = recipients.map(r => r.id);
      }

      // Create order draft if not exists
      if (!orderDraft) {
        setOrderDraft({
          orderReference: orderData.orderReference,
          customer: selectedCustomer._id,
          services: selectedServices,
          notes: orderNotes,
          status: orderStatus,
          priority: orderPriority,
          scheduledDate: orderScheduledDate || null
        });
      }

      // Create order in backend with correct structure
      const response = await axiosInstance.post('/v1/orders', orderData);

      const createdOrderData = response.data.order || response.data;
      
      setCreatedOrder(createdOrderData);
      setOrderSummary(createdOrderData);
      setActiveStep(3);
      enqueueSnackbar('Order created successfully', { variant: 'success' });

    } catch (error) {
      console.error('Error creating order:', error);
      enqueueSnackbar(error.response?.data?.error || error.response?.data?.message || 'Failed to create order', { variant: 'error' });
    } finally {
      setLoadingStates(prev => ({ ...prev, orderCreation: false }));
    }
  }, [selectedCustomer, selectedServices, serviceDetails, orderNotes, orderStatus, orderPriority, orderScheduledDate, orderDraft, user, enqueueSnackbar, isGroupBooking, organizationInfo, recipients]);

  const handlePayment = useCallback(async (paymentIntent) => {
    if (!stripe || !paymentIntent?.id) {
      throw new Error('Payment initialization failed');
    }

    setLoadingStates(prev => ({ ...prev, paymentProcessing: true }));
    setPaymentError(null);

    try {
      // Generate service references
      const serviceReferences = selectedServices.map((service, index) => ({
        serviceId: service._id || service.id,
        serviceReference: `${createdOrder.orderReference}-S${index + 1}`
      }));

      // Update order with payment success
      await axiosInstance.put(`/v1/orders/${createdOrder._id}`, {
        paymentStatus: 2, // paid
        paymentIntentId: paymentIntent.id,
        serviceReferences: serviceReferences
      });

      // Fetch updated order
      const updatedOrderResponse = await axiosInstance.get(`/v1/orders/${createdOrder._id}`);
      const completeOrder = updatedOrderResponse.data;

      setCreatedOrder(completeOrder);
      setCurrentOrder(completeOrder);
      setOrderSummary(completeOrder);
      setActiveStep(5);

      enqueueSnackbar('Payment processed successfully', { variant: 'success' });

      if (onSuccess) {
        onSuccess(completeOrder);
      }

      return paymentIntent;

    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError(error.response?.data?.message || error.message);
      
      // Update order with payment failure
      if (createdOrder?._id) {
        await axiosInstance.put(`/v1/orders/${createdOrder._id}`, {
          paymentStatus: 3, // cancelled
          paymentError: error.message
        }).catch(console.error);
      }

      return {
        id: paymentIntent?.id || 'error',
        status: 'failed',
        error: error.message
      };
    } finally {
      setLoadingStates(prev => ({ ...prev, paymentProcessing: false }));
    }
  }, [stripe, selectedServices, createdOrder, enqueueSnackbar, onSuccess]);

  // Create payment intent when moving to payment step
  const createPaymentIntent = useCallback(async (order) => {
    try {
      const normalizedOrder = normalizeOrderObject(order);
      const amount = normalizedOrder.amount || normalizedOrder.grandTotalToPay || 0;
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid order amount for payment');
      }

      // Calculate amount in pence for Stripe (convert from pounds)
      const amountInPence = Math.round(amount * 100);

      const response = await axiosInstance.post('/v1/payments/create-payment-intent', {
        amount: amountInPence,
        customerId: selectedCustomer?._id || selectedCustomer?.id,
        email: selectedCustomer?.email,
        orderId: normalizedOrder.id,
        automatic_payment_methods: { enabled: true }
      });

      if (response.data?.client_secret) {
        setClientSecret(response.data.client_secret);
        return response.data.client_secret;
      } else {
        throw new Error('No client secret returned from payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentError(error.response?.data?.message || error.message || 'Failed to initialize payment');
      return null;
    }
  }, [selectedCustomer]);

  const handleNext = useCallback(async () => {
    if (activeStep === 3 && !currentOrder && createdOrder) {
      const normalizedOrder = normalizeOrderObject(createdOrder);
      setCurrentOrder(normalizedOrder);
      
      // Create payment intent before moving to payment step
      setLoadingStates(prev => ({ ...prev, paymentProcessing: true }));
      try {
        const clientSecretResult = await createPaymentIntent(normalizedOrder);
        // Only advance to payment step if payment intent was created successfully
        if (clientSecretResult) {
          setTimeout(() => setActiveStep(prev => prev + 1), 0);
        } else {
          enqueueSnackbar('Unable to initialize payment. Please check the order amount.', { variant: 'error' });
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, paymentProcessing: false }));
      }
    } else if (activeStep === 3 && currentOrder) {
      // Payment intent already needs to be created
      setLoadingStates(prev => ({ ...prev, paymentProcessing: true }));
      try {
        const clientSecretResult = await createPaymentIntent(currentOrder);
        // Only advance to payment step if payment intent was created successfully
        if (clientSecretResult) {
          setActiveStep(prev => prev + 1);
        } else {
          enqueueSnackbar('Unable to initialize payment. Please check the order amount.', { variant: 'error' });
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, paymentProcessing: false }));
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep, currentOrder, createdOrder, createPaymentIntent, enqueueSnackbar]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  // Step content renderer
  const renderStepContent = useCallback((step) => {
    const props = {
      loadingStates,
      ContentSkeleton
    };

    switch (step) {
      case 0:
        return (
          <QuickOrderCustomer
            selectedCustomer={selectedCustomer}
            customerBookings={customerBookings}
            isCustomerConfirmed={isCustomerConfirmed}
            handleChangeCustomer={handleChangeCustomer}
            handleCustomerConfirmation={handleCustomerConfirmation}
            {...props}
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
            loading={loadingStates.serviceLoading}
            priceValidation={priceValidation}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            handleNext={handleNext}
            {...props}
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
              onNext={handleNext}
              {...props}
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
            {...props}
          />
        );

      case 4:
        // Payment step with proper validation
        if (!currentOrder && createdOrder) {
          const normalizedOrder = normalizeOrderObject(createdOrder);
          setCurrentOrder(normalizedOrder);
          return <ContentSkeleton />;
        }

        if (!currentOrder || !getId(currentOrder)) {
          return (
            <Alert severity="warning" sx={{ my: 2 }}>
              <Typography variant="body1">
                Loading order data... Please wait.
              </Typography>
              <LinearProgress sx={{ mt: 1 }} />
            </Alert>
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
            clientSecret={clientSecret}
            paymentProcessing={loadingStates.paymentProcessing}
            setPaymentError={setPaymentError}
            {...props}
          />
        );

      case 5:
        return (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" gutterBottom>
              🎉 Payment Successful!
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Create New Order
            </Button>
          </Paper>
        );

      default:
        return <Alert severity="error">Invalid step</Alert>;
    }
  }, [
    selectedCustomer,
    customerBookings,
    isCustomerConfirmed,
    handleChangeCustomer,
    handleCustomerConfirmation,
    filteredServices,
    selectedServices,
    handleServiceSelect,
    serviceMetadata,
    activeCategory,
    setActiveCategory,
    setSearchQuery,
    loadingStates,
    priceValidation,
    advancedFilters,
    setAdvancedFilters,
    handleNext,
    orderStatus,
    setOrderStatus,
    orderScheduledDate,
    setOrderScheduledDate,
    orderPriority,
    setOrderPriority,
    serviceDetails,
    handleServiceDetailsUpdate,
    orderDraft,
    orderSummary,
    orderNotes,
    setOrderNotes,
    handleCreateOrder,
    createdOrder,
    currentOrder,
    formInput,
    setFormInput,
    handlePayment,
    stripeError,
    paymentError,
    clientSecret
  ]);

  // Main render
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Group Booking Toggle */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isGroupBooking}
                onChange={(e) => setIsGroupBooking(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="eva:people-fill" width={20} />
                <Typography variant="subtitle1">Group Booking</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            Enable for bulk orders with multiple recipients
          </Typography>
        </Box>

        {/* Group Booking Details */}
        <Collapse in={isGroupBooking}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="eva:briefcase-fill" width={20} />
              Organization Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Organization Name"
                  value={organizationInfo.organizationName}
                  onChange={handleOrganizationChange('organizationName')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Name"
                  value={organizationInfo.contactName}
                  onChange={handleOrganizationChange('contactName')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Email"
                  type="email"
                  value={organizationInfo.contactEmail}
                  onChange={handleOrganizationChange('contactEmail')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Contact Phone"
                  value={organizationInfo.contactPhone}
                  onChange={handleOrganizationChange('contactPhone')}
                />
              </Grid>
            </Grid>

            {/* Recipients Section */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon={personFill} width={20} />
                  Recipients ({recipients.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon={plusFill} />}
                  onClick={() => handleOpenRecipientDialog()}
                >
                  Add Recipient
                </Button>
              </Box>

              {recipients.length === 0 ? (
                <Alert severity="info" sx={{ py: 1 }}>
                  No recipients added. Each selected service will be assigned to all recipients.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recipients.map((recipient, index) => (
                        <TableRow key={recipient.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={index + 1}
                                size="small"
                                sx={{ minWidth: 24, height: 24 }}
                              />
                              {recipient.firstName} {recipient.lastName}
                            </Box>
                          </TableCell>
                          <TableCell>{recipient.email || '-'}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => handleOpenRecipientDialog(index)}>
                              <Icon icon={editFill} width={18} />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleRemoveRecipient(index)}>
                              <Icon icon={trashFill} width={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Recipient Dialog */}
      <Dialog open={recipientDialogOpen} onClose={handleCloseRecipientDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRecipientIndex !== null ? 'Edit Recipient' : 'Add Recipient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={currentRecipient.firstName}
                onChange={handleRecipientChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={currentRecipient.lastName}
                onChange={handleRecipientChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={currentRecipient.email}
                onChange={handleRecipientChange('email')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={currentRecipient.phone}
                onChange={handleRecipientChange('phone')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={currentRecipient.dateOfBirth}
                onChange={handleRecipientChange('dateOfBirth')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NI Number"
                value={currentRecipient.niNumber}
                onChange={handleRecipientChange('niNumber')}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Address"
                value={currentRecipient.address}
                onChange={handleRecipientChange('address')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postcode"
                value={currentRecipient.postcode}
                onChange={handleRecipientChange('postcode')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecipientDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRecipient}>
            {editingRecipientIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {loadingStates.serviceLoading && <LinearProgress sx={{ mb: 2 }} />}

      <StepTransition index={activeStep} activeStep={activeStep}>
        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </StepTransition>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || Object.values(loadingStates).some(Boolean)}
          sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
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
              Object.values(loadingStates).some(Boolean)
            }
          >
            {Object.values(loadingStates).some(Boolean) ? (
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

QuickOrderPanel.displayName = 'QuickOrderPanel';

export default QuickOrderPanel;
