import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  FormHelperText,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  LoadingButton,
} from '@mui/lab';
import { useSnackbar } from 'notistack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { salesService } from '../../../services/sales.service';
import { format } from 'date-fns';
import { CUSTOMER_TYPE } from '../../../types/customer.types';
import mapboxgl from 'mapbox-gl';
import { debounce } from 'lodash';

// Use the same Mapbox token as in LandingMap
mapboxgl.accessToken = 'pk.eyJ1IjoibmV4Y21hcCIsImEiOiJjbTY5N3Q4OTgwODduMmxzY2s5aDA0bXp1In0.wnyDsAjgVJw794zpvWf93g';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'NEW_FIRST_TIME':
      return 'info';
    case 'NEW_PROSPECT':
      return 'warning';
    case 'EXISTING_COMPLETED':
      return 'success';
    case 'EXISTING_ACTIVE':
      return 'primary';
    default:
      return 'default';
  }
}

function CustomerManagement({ onCustomerSelect, onCustomerConfirmed }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmationDialog, setConfirmationDialog] = useState({ open: false, customer: null });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const results = await salesService.searchCustomers('');
      setCustomers(results);
    } catch (error) {
      console.error('Error fetching customers:', error);
      enqueueSnackbar('Failed to fetch customers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  fetchCustomers();
}, [enqueueSnackbar]);


  // Fetch all customers for analytics
  const fetchAllCustomers = useCallback(async () => {
    try {
      const results = await salesService.searchCustomers('');
      setAllCustomers(results);
    } catch (error) {
      console.error('Error fetching customers:', error);
      enqueueSnackbar('Failed to fetch customer statistics', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Initial load and refresh after customer creation
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // Refresh analytics when a customer is created
  useEffect(() => {
    if (!isCreateDialogOpen) {
      fetchAllCustomers();
    }
  }, [isCreateDialogOpen, fetchAllCustomers]);

  const debouncedSearch = (query) => {
    const searchCustomers = async () => {
      setLoading(true);
      try {
        const results = await salesService.searchCustomers(query.trim());
        
        // Apply filters
        const filteredResults = results.filter(customer => {
          const matchesType = !customerTypeFilter || customer.customerType === customerTypeFilter;
          const matchesStatus = !statusFilter || customer.status === statusFilter;
          return matchesType && matchesStatus;
        });
        
        setCustomers(filteredResults);
        
        if (filteredResults.length === 0) {
          enqueueSnackbar('No customers found matching your criteria', { variant: 'info' });
        }
      } catch (error) {
        console.error('Search error:', error);
        setCustomers([]);
        enqueueSnackbar(error.message || 'Failed to search customers. Please try again.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (!query.trim() && !customerTypeFilter && !statusFilter) {
      setCustomers([]);
      return;
    }

    debounce(searchCustomers, 500)();
  };

  const handleSearchQueryChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  const handleCustomerSelect = (customer) => {
    setConfirmationDialog({ open: true, customer });
  };

  const handleConfirmCustomer = () => {
    if (confirmationDialog.customer) {
      console.log('Confirming customer:', confirmationDialog.customer); // Add logging
      onCustomerSelect(confirmationDialog.customer);
      enqueueSnackbar('Customer selected successfully', { variant: 'success' });
    }
    setConfirmationDialog({ open: false, customer: null });
  };

  const handleCancelCustomerSelect = () => {
    setConfirmationDialog({ open: false, customer: null });
  };

  const CustomerSearchResults = () => (
    <List>
      {customers.length === 0 ? (
        <ListItem>
          <ListItemText
            primary="No customers found"
            secondary="Try adjusting your search terms"
          />
        </ListItem>
      ) : (
        customers.map((customer) => (
          <React.Fragment key={customer._id}>
            <ListItem button onClick={() => handleCustomerSelect(customer)}>
              <ListItemText
                primary={
                  customer.customerType === CUSTOMER_TYPE.COMPANY
                    ? customer.companyName
                    : `${customer.firstName} ${customer.lastName}`
                }
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {customer.email}
                    </Box>
                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      •
                    </Box>
                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {customer.customerType === CUSTOMER_TYPE.COMPANY ? 'Company' : 'Individual'}
                    </Box>
                    <Box component="span">
                      <Chip
                        size="small"
                        label={customer.status}
                        color={getStatusColor(customer.status)}
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(customer);
                  }}
                  title="View Details"
                >
                  <VisibilityIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))
      )}
    </List>
  );

  const CustomerDetailsDialog = ({ customer, open, onClose, onCustomerUpdated }) => {
    const [tabValue, setTabValue] = useState(0);
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);

    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

    const handleStatusUpdateClick = () => {
      setShowStatusUpdate(true);
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Customer Details</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Customer Info Section */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {customer.firstName} {customer.lastName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={customer.status?.replace(/_/g, ' ') || 'N/A'}
                    color={
                      customer.status?.startsWith('NEW_') ? 'info' :
                      customer.status === 'EXISTING_COMPLETED' ? 'success' :
                      customer.status === 'EXISTING_ACTIVE' ? 'primary' : 'default'
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={handleStatusUpdateClick}
                    title="Update Status"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                 <Typography variant="body2" color="text.secondary">
                  <strong>Date of Birth:</strong> {customer.dateOfBirth ? format(new Date(customer.dateOfBirth), 'dd/MM/yyyy') : 'N/A'}
                 </Typography>
              </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {customer.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Phone:</strong> {customer.phoneNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>NI Number:</strong> {customer.NINumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Last Contact:</strong> {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Address:</strong> {customer.address}
                    {customer.postcode && `, ${customer.postcode}`}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Orders" />
                <Tab label="Services" />
                <Tab label="History" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <CustomerOrdersTab customer={customer} />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <CustomerServicesTab customer={customer} />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <CustomerHistoryTab customer={customer} />
              </TabPanel>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>

        {/* Status Update Dialog */}
        <StatusUpdateDialog
          open={showStatusUpdate}
          customer={customer}
          onClose={() => setShowStatusUpdate(false)}
          onStatusUpdated={onCustomerUpdated}
        />
      </Dialog>
    );
  };

  const StatusUpdateDialog = ({ customer, open, onClose, onStatusUpdated }) => {
    const [status, setStatus] = useState(customer?.status || '');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const validateStatusTransition = (newStatus) => {
      // Cannot move to NEW_FIRST_TIME once they are a prospect or existing customer
      if (newStatus === 'NEW_FIRST_TIME' && customer.status !== 'NEW_FIRST_TIME') {
        setError('Cannot change status back to NEW_FIRST_TIME once customer information is collected');
        return false;
      }

      // Cannot move to NEW_PROSPECT if they have any orders
      if (newStatus === 'NEW_PROSPECT' && ['EXISTING_ACTIVE', 'EXISTING_COMPLETED'].includes(customer.status)) {
        setError('Cannot change status to NEW_PROSPECT for customers who have made purchases');
        return false;
      }

      // Only allow EXISTING_COMPLETED if all orders are completed
      if (newStatus === 'EXISTING_COMPLETED') {
        // Note: You might want to add an API check here to verify all orders are completed
        if (customer.status !== 'EXISTING_ACTIVE') {
          setError('Can only mark as completed for customers with active orders');
          return false;
        }
      }

      // Only allow EXISTING_ACTIVE if they have made a purchase
      if (newStatus === 'EXISTING_ACTIVE' && !['EXISTING_ACTIVE', 'EXISTING_COMPLETED'].includes(customer.status)) {
        setError('Can only mark as active after customer makes a purchase');
        return false;
      }

      setError('');
      return true;
    };

    const handleStatusChange = (e) => {
      const newStatus = e.target.value;
      if (validateStatusTransition(newStatus)) {
        setStatus(newStatus);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await salesService.updateCustomerStatus(customer._id, status, reason);
        enqueueSnackbar('Customer status updated successfully', { variant: 'success' });
        onStatusUpdated();
        onClose();
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to update status', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Customer Status</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <FormControl fullWidth error={!!error}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  label="New Status"
                >
                  <MenuItem value="NEW_FIRST_TIME">NEW FIRST TIME</MenuItem>
                  <MenuItem value="NEW_PROSPECT">NEW PROSPECT</MenuItem>
                  <MenuItem value="EXISTING_COMPLETED">EXISTING COMPLETED</MenuItem>
                  <MenuItem value="EXISTING_ACTIVE">EXISTING ACTIVE</MenuItem>
                </Select>
                {error && (
                  <FormHelperText error>{error}</FormHelperText>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="Reason for Change"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                helperText="Please provide a reason for this status change"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={loading}
            variant="contained"
          >
            Update Status
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  const CustomerOrdersTab = ({ customer }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const response = await salesService.getCustomerOrders(customer._id);
          setOrders(response);
        } catch (error) {
          enqueueSnackbar('Failed to fetch orders', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }, [customer._id, enqueueSnackbar]);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (orders.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No orders found for this customer.
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {orders.map((order) => (
          <React.Fragment key={order._id}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    Order #{order._id}
                  </Typography>
                }
                secondary={
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {format(new Date(order.createdAt), 'PPp')}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2">
                        Amount: £{order.grandTotal?.toFixed(2)}
                      </Typography>
                      <Chip
                        size="small"
                        label={order.payStatus ? 'Paid' : 'Pending'}
                        color={order.payStatus ? 'success' : 'warning'}
                      />
                    </Stack>
                  </Stack>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  const CustomerServicesTab = ({ customer }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
      const fetchServices = async () => {
        try {
          const response = await salesService.getCustomerServices(customer._id);
          setServices(response);
        } catch (error) {
          enqueueSnackbar('Failed to fetch services', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };

      fetchServices();
    }, [customer._id, enqueueSnackbar]);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (services.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No active services found for this customer.
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} key={service._id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">{service.title}</Typography>
                    <Chip
                      size="small"
                      label={service.status}
                      color={service.status === 'active' ? 'success' : 'default'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                  {service.expiryDate && (
                    <Typography variant="body2">
                      Expires: {format(new Date(service.expiryDate), 'PP')}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const CustomerHistoryTab = ({ customer }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
      const fetchHistory = async () => {
        try {
          const response = await salesService.getCustomerHistory(customer._id);
          setHistory(response);
        } catch (error) {
          enqueueSnackbar('Failed to fetch history', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }, [customer._id, enqueueSnackbar]);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (history.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No history records found for this customer.
          </Typography>
        </Box>
      );
    }

    return (
      <Timeline>
        {history.map((event) => (
          <TimelineItem key={event._id}>
            <TimelineSeparator>
              <TimelineDot color={getEventColor(event.type)} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(event.timestamp), 'PPp')}
                </Typography>
              </Stack>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'status_change':
        return 'primary';
      case 'order':
        return 'success';
      case 'service':
        return 'info';
      case 'contact':
        return 'warning';
      default:
        return 'grey';
    }
  };

  const debouncedFetchAddress = debounce((postcode, callback) => {
    if (postcode.length >= 5) { // Min length for UK postcode
      callback(postcode);
    }
  }, 500);

  const CreateCustomerDialog = ({ onClose, onCustomerCreated, open }) => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phoneNumber: '',
      NINumber: '',
      address: '',
      postcode: '',
      customerType: CUSTOMER_TYPE.INDIVIDUAL,
      companyName: '',
      companyRegNumber: '',
      status: 'NEW_FIRST_TIME'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Validation helper functions
    const isValidEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    };

    const isValidUKPhone = (phone) => {
      // Remove spaces and any other characters for validation
      const cleanPhone = phone.replace(/\s+/g, '').replace(/[-()+]/g, '');
      
      // UK phone number patterns:
      // Mobile: 07XXX XXX XXX or +447XXX XXX XXX
      // Landline: 01XXX XXX XXX or 02X XXXX XXXX
      // Business: 03XX XXX XXXX
      // London: 020 XXXX XXXX
      // Premium: 084X/087X XXX XXXX
      // Freephone: 0800 XXX XXXX or 0808 XXX XXXX
      
      const patterns = [
        /^(\+447|07)[0-9]{9}$/, // Mobile
        /^01[0-9]{8,9}$/, // Landline (area codes starting 01)
        /^02[0-9]{9}$/, // Landline (area codes starting 02)
        /^03[0-9]{9}$/, // Business/Non-geographic
        /^08(00|08|44|45|70|43)[0-9]{7}$/, // Freephone/Premium
      ];

      return patterns.some(pattern => pattern.test(cleanPhone));
    };

    const isValidNINumber = (ni) => {
      // Format: 2 letters, 6 numbers, 1 letter (e.g., AB123456C)
      // Removes spaces for validation
      const cleanNI = ni.replace(/\s+/g, '').toUpperCase();
      const niRegex = /^[A-Z]{2}[0-9]{6}[A-Z]$/;
      return niRegex.test(cleanNI);
    };

    const formatUKPhone = (phone) => {
      // Remove all existing spaces and characters
      const cleanPhone = phone.replace(/\s+/g, '').replace(/[-()+]/g, '');
      
      // Format based on number type
      if (cleanPhone.startsWith('07')) {
        // Mobile: 07XXX XXX XXX
        return cleanPhone.replace(/(\d{5})(\d{3})(\d{3})/, '0$1 $2 $3');
      } else if (cleanPhone.startsWith('447')) {
        // Mobile: +44 7XXX XXX XXX
        return '+' + cleanPhone.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, '$1 $2 $3 $4');
      } else if (cleanPhone.startsWith('02')) {
        // London/Cardiff/etc: 02X XXXX XXXX
        return cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
      } else if (cleanPhone.startsWith('01')) {
        // Landline: 01XXX XXX XXX
        return cleanPhone.replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3');
      } else if (cleanPhone.startsWith('03')) {
        // Business: 03XX XXX XXXX
        return cleanPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
      } else if (cleanPhone.startsWith('08')) {
        // Freephone/Premium: 08XX XXX XXXX
        return cleanPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
      }
      
      return phone; // Return original if no format matches
    };

    const formatNINumber = (ni) => {
      // Format: AB 12 34 56 C
      const cleanNI = ni.replace(/\s+/g, '').toUpperCase();
      return cleanNI.replace(/^([A-Z]{2})(\d{2})(\d{2})(\d{2})([A-Z])$/, '$1 $2 $3 $4 $5');
    };

    const fetchAddressFromPostcode = async (postcode) => {
      try {
        setIsLoadingAddress(true);
        // Use Mapbox Geocoding API to get address suggestions
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?country=GB&types=postcode&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          // Get detailed address using the coordinates
          const [lng, lat] = feature.center;
          const detailResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address&access_token=${mapboxgl.accessToken}`
          );
          const detailData = await detailResponse.json();
          
          // Extract address suggestions
          const suggestions = detailData.features.map(f => ({
            fullAddress: f.place_name,
            coordinates: f.center,
            context: f.context
          }));
          
          setAddressSuggestions(suggestions);
          
          // Auto-fill the first address if available
          if (suggestions.length > 0) {
            setFormData(prev => ({
              ...prev,
              address: suggestions[0].fullAddress
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        enqueueSnackbar('Failed to fetch address from postcode', { variant: 'error' });
      } finally {
        setIsLoadingAddress(false);
      }
    };

    const debouncedPostcodeLookup = (postcode) => {
      debouncedFetchAddress(postcode, fetchAddressFromPostcode);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      let formattedValue = value;

      // Apply formatting based on field type
      if (name === 'phoneNumber') {
        formattedValue = formatUKPhone(value);
      } else if (name === 'NINumber') {
        formattedValue = formatNINumber(value);
      }

      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));

      // Clear errors when user changes input
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }

      // Trigger address lookup when postcode changes
      if (name === 'postcode') {
        debouncedPostcodeLookup(value);
      }
    };

    const validateForm = () => {
      const newErrors = {};

      // Required fields validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!isValidUKPhone(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid UK phone number';
      }

      if (!formData.NINumber) {
        newErrors.NINumber = 'National Insurance number is required';
      } else if (!isValidNINumber(formData.NINumber)) {
        newErrors.NINumber = 'Please enter a valid NI number (e.g., AB 12 34 56 C)';
      }

      // Customer type specific validation
      if (formData.customerType === CUSTOMER_TYPE.INDIVIDUAL) {
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
      } else {
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.companyRegNumber) newErrors.companyRegNumber = 'Company registration number is required';
      }

      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.postcode) newErrors.postcode = 'Postal code is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        const customerData = {
          ...formData,
          // Status will be set automatically on the backend
          status: 'NEW_FIRST_TIME'
        };

        console.log('Creating customer with data:', customerData);
        const response = await salesService.createCustomer(customerData);
        console.log('Customer creation response:', response);
        
        if (response && response._id) {
          enqueueSnackbar('Customer created successfully', { variant: 'success' });
          onCustomerCreated(response);
          onClose();
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Customer creation error:', error);
        enqueueSnackbar(
          error.response?.data?.message || error.message || 'Failed to create customer. Please check your connection and try again.',
          { variant: 'error' }
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Create New Customer</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  label="Customer Type"
                >
                  <MenuItem value={CUSTOMER_TYPE.INDIVIDUAL}>Individual</MenuItem>
                  <MenuItem value={CUSTOMER_TYPE.COMPANY}>Company</MenuItem>
                </Select>
              </FormControl>

              {formData.customerType === CUSTOMER_TYPE.INDIVIDUAL ? (
                // Individual customer fields
                <>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </>
              ) : (
                // Company customer fields
                <>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                  />
                  <TextField
                    fullWidth
                    label="Company Registration Number"
                    name="companyRegNumber"
                    value={formData.companyRegNumber}
                    onChange={handleInputChange}
                    error={!!errors.companyRegNumber}
                    helperText={errors.companyRegNumber}
                  />
                </>
              )}

              {/* Common fields for both types */}
              <TextField
  fullWidth
  label="Date of Birth"
  name="dateOfBirth"
  type="date"
  value={formData.dateOfBirth}
  onChange={handleInputChange}
  InputLabelProps={{
    shrink: true,
  }}
  error={!!errors.dateOfBirth}
  helperText={errors.dateOfBirth}
  placeholder="Date of birth"
/>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="example@domain.com"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber || "Valid formats include:\n• Mobile: 07XXX XXX XXX\n• Landline: 01XXX XXX XXX\n• London: 020 XXXX XXXX\n• Business: 03XX XXX XXXX"}
                placeholder="Enter phone number"
              />
              <TextField
                fullWidth
                label="National Insurance Number"
                name="NINumber"
                value={formData.NINumber}
                onChange={handleInputChange}
                error={!!errors.NINumber}
                helperText={errors.NINumber || "Format: AB 12 34 56 C"}
                placeholder="AB 12 34 56 C"
              />
              <TextField
                fullWidth
                label="Postal Code"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                helperText="Enter a postcode to auto-fill the address"
              />
              <Autocomplete
                fullWidth
                options={addressSuggestions}
                getOptionLabel={(option) => option.fullAddress}
                value={addressSuggestions.find(a => a.fullAddress === formData.address) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData(prev => ({
                      ...prev,
                      address: newValue.fullAddress
                    }));
                  }
                }}
                loading={isLoadingAddress}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Address"
                    name="address"
                    error={!!errors.address}
                    helperText={errors.address}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingAddress ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            loading={isSubmitting}
            onClick={handleSubmit}
            variant="contained"
          >
            Create Customer
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  const CustomerSelectionDialog = () => (
    <Dialog open={confirmationDialog.open} onClose={handleCancelCustomerSelect}>
      <DialogTitle>Confirm Customer Selection</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to select{' '}
          {confirmationDialog.customer?.customerType === CUSTOMER_TYPE.COMPANY
            ? confirmationDialog.customer?.companyName
            : `${confirmationDialog.customer?.firstName} ${confirmationDialog.customer?.lastName}`}{' '}
          for this order?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelCustomerSelect}>Cancel</Button>
        <Button onClick={handleConfirmCustomer} variant="contained" color="primary">
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Stats calculations
  const totalCustomers = allCustomers.length;
  const activeCustomers = allCustomers.filter(c => c.status === 'EXISTING_ACTIVE').length;
  const newProspects = allCustomers.filter(c => c.status === 'NEW_PROSPECT').length;

  return (
    <Box>
      <CustomerSelectionDialog />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Customer Management
              </Typography>
            </Grid>
            
            {/* Stats Section */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ bgcolor: 'primary.lighter', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: 'primary.darker' }}>
                        Total Customers
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'primary.darker', mt: 1 }}>
                        {totalCustomers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ bgcolor: 'success.lighter', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: 'success.darker' }}>
                        Active Customers
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'success.darker', mt: 1 }}>
                        {activeCustomers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ bgcolor: 'warning.lighter', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: 'warning.darker' }}>
                        New Prospects
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'warning.darker', mt: 1 }}>
                        {newProspects}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<i className="fas fa-plus" />}
                  onClick={() => setIsCreateDialogOpen(true)}
                  fullWidth
                  sx={{ maxWidth: 250 }}
                >
                  Create New Customer
                </Button>
              </Box>
            </Grid>

            {/* Search and Filter Section */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'background.neutral', p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Search Customers"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      placeholder="Search by name, email, or company"
                      InputProps={{
                        endAdornment: loading && (
                          <CircularProgress size={20} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Customer Type</InputLabel>
                      <Select
                        value={customerTypeFilter || ''}
                        onChange={(e) => setCustomerTypeFilter(e.target.value)}
                        label="Customer Type"
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value={CUSTOMER_TYPE.INDIVIDUAL}>Individual</MenuItem>
                        <MenuItem value={CUSTOMER_TYPE.COMPANY}>Company</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter || ''}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="NEW_FIRST_TIME">New First Time</MenuItem>
                        <MenuItem value="NEW_PROSPECT">New Prospect</MenuItem>
                        <MenuItem value="EXISTING_COMPLETED">Completed</MenuItem>
                        <MenuItem value="EXISTING_ACTIVE">Active</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setCustomerTypeFilter('');
                        setStatusFilter('');
                        setSearchQuery('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : customers.length > 0 ? (
            <CustomerSearchResults />
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No customers found. Try adjusting your search or filters.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Existing dialogs */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={!!selectedCustomer}
          onClose={handleCloseDetails}
          onCustomerUpdated={(updatedCustomer) => {
            setCustomers((prevCustomers) =>
              prevCustomers.map((c) => (c._id === updatedCustomer._id ? updatedCustomer : c))
            );
          }}
        />
      )}
      <CreateCustomerDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCustomerCreated={(newCustomer) => {
          setIsCreateDialogOpen(false);
          // Optionally refresh the customer list or show success message
          enqueueSnackbar('Customer created successfully', { variant: 'success' });
        }}
      />
    </Box>
  );
}

export default CustomerManagement;
