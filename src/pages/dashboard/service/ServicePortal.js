import React, { useState, useEffect, useCallback, useMemo, createContext } from 'react';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Tab,
  Tabs,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  // Chip,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  // InputAdornment,
  Menu
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Check as CheckIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon
  // ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
// import { Link } from 'react-router-dom';

// Components
import Page from '../../../components/Page';
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import CustomerManagement from '../../../components/_dashboard/sales/CustomerManagement';
// import { fCurrency } from '../../../utils/formatNumber';

// API services
import { salesService } from '../../../services/sales.service';
import axiosInstance from '../../../axiosConfig';

// Import services
import serviceRequestService from '../../../services/ServiceRequestService';

export const ServiceCustomerContext = createContext();

function ServicePortal() {
  const [activeTab, setActiveTab] = useState(0);
  const [serviceRequests, setServiceRequests] = useState([]);
  // const [searchTerm, setSearchTerm] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailOpen, setServiceDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterByCustomer, setFilterByCustomer] = useState(selectedCustomer ? true : false);
  const [customerServiceHistory, setCustomerServiceHistory] = useState([]);

  // State for action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Analytics state
  const [analytics, setAnalytics] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalServices: 0,
    serviceTypeBreakdown: {}
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    serviceType: 'all',
    searchQuery: ''
  });

  // Fetch service data from Sales orders
  const fetchServiceData = useCallback(async () => {
    try {
      setLoading(true);

      // Get orders from the API
      const orders = await salesService.getOrders();

      // Transform orders into service requests format
      const serviceRequests = orders.map(order => ({
        id: order._id,
        orderId: order.orderReference,
        customerId: order.customer?._id,
        customerName: order.customer?.name ||
          `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
        services: order.services || [],
        status: order.status,
        priority: order.priority || 'normal',
        createdAt: order.createdAt,
        scheduledDate: order.scheduledDate,
        description: order.notes || '',
        assignedTechnician: order.assignedTechnician
      }));

      setServiceRequests(serviceRequests);
      setError(null);
    } catch (err) {
      console.error('Error fetching service data:', err);
      setError(err.message || 'Failed to load service data');
      enqueueSnackbar('Failed to load service data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Fetch technicians
  const fetchTechnicians = useCallback(async () => {
    try {
      // Replace with actual API call when available
      const response = await axiosInstance.get('/technicians');

      setTechnicians(response.data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      enqueueSnackbar('Failed to load technicians', { variant: 'error' });
      // Fallback to mock data for now
      setTechnicians([
        { id: 1, name: 'John Smith', specialty: 'Cards', availability: 'available' },
        { id: 2, name: 'Sarah Johnson', specialty: 'Tests', availability: 'busy' },
        { id: 3, name: 'Michael Brown', specialty: 'Courses', availability: 'available' }
      ]);
    }
  }, [enqueueSnackbar]);

  // Calculate analytics from service data
  const fetchServiceAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate analytics from current data
      const pending = serviceRequests.filter(r => r.status === 'pending').length;
      const inProgress = serviceRequests.filter(r => r.status === 'in_progress').length;
      const completed = serviceRequests.filter(r => r.status === 'completed').length;
      const cancelled = serviceRequests.filter(r => r.status === 'cancelled').length;

      // Count services by type
      const serviceTypeBreakdown = {};
      serviceRequests.forEach(request => {
        request.services?.forEach(service => {
          const type = service.serviceType || 'unknown';
          serviceTypeBreakdown[type] = (serviceTypeBreakdown[type] || 0) + 1;
        });
      });

      setAnalytics({
        pending,
        inProgress,
        completed,
        cancelled,
        totalServices: serviceRequests.reduce((sum, req) => sum + (req.services?.length || 0), 0),
        serviceTypeBreakdown
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceRequests]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Apply filters to service requests
  const filteredServiceRequests = useMemo(() => {
    return serviceRequests.filter(request => {
      // Status filter
      if (filters.status !== 'all' && request.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && request.priority !== filters.priority) {
        return false;
      }

      // Service type filter
      if (filters.serviceType !== 'all') {
        const hasServiceType = request.services?.some(
          service => service.serviceType === filters.serviceType
        );
        if (!hasServiceType) return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = request.customerName?.toLowerCase().includes(query);
        const matchesOrderId = request.orderId?.toLowerCase().includes(query);
        const matchesDescription = request.description?.toLowerCase().includes(query);

        if (!matchesName && !matchesOrderId && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }, [serviceRequests, filters]);

  // View service details
  const handleViewServiceDetails = (service) => {
    setSelectedService(service);
    setServiceDetailOpen(true);
  };

  // Assign technician
  const handleAssignTechnician = (request) => {
    setSelectedRequest(request);
    setAssignmentDialogOpen(true);
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async () => {
    if (!selectedTechnician) {
      enqueueSnackbar('Please select a technician', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      // API call to assign technician
      await axiosInstance.patch(`/orders/${selectedRequest.id}/assign`, {
        technicianId: selectedTechnician,
        status: 'in_progress'
      });

      // Update local state
      const updatedRequests = serviceRequests.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'in_progress', assignedTechnician: selectedTechnician }
          : req
      );

      setServiceRequests(updatedRequests);
      setAssignmentDialogOpen(false);
      setSelectedTechnician('');
      enqueueSnackbar('Technician assigned successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error assigning technician:', error);
      enqueueSnackbar(error.message || 'Failed to assign technician', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Update service status
  const handleUpdateStatus = async (requestId, newStatus, notes = '') => {
    try {
      setLoading(true);
      // Call API to update status
      await axiosInstance.patch(`/orders/${requestId}/status`, {
        status: newStatus,
        notes,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedRequests = serviceRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      );

      setServiceRequests(updatedRequests);
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar(error.message || 'Failed to update status', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Handle tab change
  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };



  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    // If you want to automatically switch to service requests for this customer
    setActiveTab(0); // Switch to service requests tab
  };

  // Effect to load service requests
  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        setLoading(true);
        let requests;

        if (filterByCustomer && selectedCustomer?.id) {
          // Fetch requests filtered by customer
          requests = await serviceRequestService.getByCustomerId(selectedCustomer.id);

          if (requests.length === 0) {
            enqueueSnackbar('No service requests found for this customer', { variant: 'info' });
          }
        } else {
          // Fetch all requests
          requests = await serviceRequestService.getAll();
        }

        setServiceRequests(requests);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch service requests:', error);
        setLoading(false);
        setError('Failed to load service requests');
      }
    };

    fetchServiceRequests();
  }, [filterByCustomer, selectedCustomer, enqueueSnackbar]);

  // // Toggle filtering by selected customer
  // const toggleCustomerFilter = () => {
  //   setFilterByCustomer(prev => !prev);
  // };

  // Handle menu open
  const handleMenuOpen = (event, request) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedRequest(request);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleViewCustomerDetails = async (customerId) => {
    try {
      const customerData = await salesService.getCustomerById(customerId);
      if (customerData) {
        setSelectedCustomer(customerData);
        setActiveTab(2); // Switch to Customer Management tab
      } else {
        enqueueSnackbar('Customer details not found', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      enqueueSnackbar('Failed to load customer details', { variant: 'error' });
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchServiceData();
    fetchTechnicians();
  }, [fetchServiceData, fetchTechnicians]);

  // Fetch analytics when switching to analytics tab
  useEffect(() => {
    if (activeTab === 2) {
      fetchServiceAnalytics();
    }
  }, [activeTab, fetchServiceAnalytics]);

  useEffect(() => {
    const fetchCustomerHistory = async () => {
      if (selectedCustomer && selectedCustomer.id) {
        try {
          // Fetch customer history from API
          const history = await salesService.getCustomerHistory(selectedCustomer.id);
          setCustomerServiceHistory(history || []);
        } catch (error) {
          console.error('Error fetching customer history:', error);
          enqueueSnackbar('Failed to load customer history', { variant: 'error' });
        }
      }
    };

    fetchCustomerHistory();
  }, [selectedCustomer, enqueueSnackbar]);

  // Render service requests list/grid
  const renderServiceRequests = () => {
    if (filteredServiceRequests.length === 0) {
      return (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No service requests found
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {filterByCustomer && selectedCustomer && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              Showing service requests for customer: <strong>{selectedCustomer.name || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</strong>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilterByCustomer(false)}
              startIcon={<FilterListIcon />}
            >
              Show All
            </Button>
          </Box>
        )}
        {/* Filter toolbar */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Service Type</InputLabel>
            <Select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              label="Service Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="card">Cards</MenuItem>
              <MenuItem value="test">Tests</MenuItem>
              <MenuItem value="course">Courses</MenuItem>
              <MenuItem value="qualification">Qualifications</MenuItem>
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            size="small"
            label="Search"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon color="action" />
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredServiceRequests.map((request) => (
            <Grid item xs={12} md={6} lg={4} key={request.id}>
              <Card>
                <CardHeader
                  title={`Order #${request.orderId}`}
                  subheader={`Created: ${new Date(request.createdAt).toLocaleString()}`}
                  action={
                    <>
                      <Label color={getStatusColor(request.status)}>
                        {request.status ? request.status.replace('_', ' ') : 'Unknown'}
                      </Label>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, request)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </>
                  }
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer: {request.customerName}
                    {request.customerId && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewCustomerDetails(request.customerId)}
                        sx={{ mt: 1 }}
                      >
                        View Customer Profile
                      </Button>
                    )}
                  </Typography>

                  {request.services && request.services.length > 0 && (
                    <Box sx={{ my: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Services:
                      </Typography>
                      <Stack spacing={1}>
                        {request.services.map((service, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              p: 1,
                              '&:hover': { bgcolor: 'action.hover', borderRadius: 1 }
                            }}
                            onClick={() => handleViewServiceDetails(service)}
                          >
                            <Typography variant="body2">
                              {service.title || `${service.serviceType} Service`}
                            </Typography>
                            <Typography variant="body2" color="primary">
                              £{service.price}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Label color={getPriorityColor(request.priority)}>
                      {request.priority} priority
                    </Label>
                    {request.scheduledDate && (
                      <Typography variant="body2">
                        Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    {request.status === 'pending' && (
                      <Button
                        startIcon={<AssignmentIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => handleAssignTechnician(request)}
                      >
                        Assign Technician
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        startIcon={<CheckIcon />}
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedRequest) {
              handleViewServiceDetails(selectedRequest.services[0]);
            }
          }}>
            View Service Details
          </MenuItem>

          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedRequest) {
              handleAssignTechnician(selectedRequest);
            }
          }}>
            Assign Technician
          </MenuItem>
        </Menu>
      </>
    );
  };

  // Render technician management view
  const renderTechnicianManagement = () => {
    return (
      <Grid container spacing={3}>
        {technicians.map((tech) => (
          <Grid item xs={12} md={4} key={tech.id}>
            <Card>
              <CardHeader
                title={tech.name}
                subheader={`Specialty: ${tech.specialty}`}
                action={
                  <Label color={tech.availability === 'available' ? 'success' : 'warning'}>
                    {tech.availability}
                  </Label>
                }
              />
              <CardContent>
                <Typography variant="body2">
                  ID: {tech.id}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                  >
                    View Schedule
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render analytics view
  const renderServiceAnalytics = () => {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.lighter', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="warning.main">
                  {analytics.pending}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Pending Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.lighter', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="info.main">
                  {analytics.inProgress}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.lighter', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="success.main">
                  {analytics.completed}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.lighter', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="primary.main">
                  {analytics.totalServices}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Total Services
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardHeader title="Service Type Distribution" />
          <CardContent>
            <Box sx={{ px: 3 }}>
              {Object.entries(analytics.serviceTypeBreakdown).map(([type, count]) => (
                <Box key={type} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{type}</Typography>
                    <Typography variant="body2">{count}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / analytics.totalServices) * 100}
                    color={
                      type === 'card' ? 'primary' :
                        type === 'test' ? 'secondary' :
                          type === 'course' ? 'info' :
                            'warning'
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderCustomerManagement = () => {
    return (
      <CustomerManagement
        onCustomerSelect={handleCustomerSelect}
        onCustomerConfirmed={(customer) => {
          setSelectedCustomer(customer);
          setFilterByCustomer(true);
          setActiveTab(0); // Switch to service requests tab to see filtered results
        }}
      />
    );
  };

  // Main component render
  return (
    <ServiceCustomerContext.Provider value={{
      selectedCustomer,
      setSelectedCustomer,
      customerServiceHistory,
      filterByCustomer,
      setFilterByCustomer
    }}>
      <Page title="Service Portal">
        <Container maxWidth="xl">
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom>
              Service Portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage service requests and technician assignments
            </Typography>
          </Box>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <IconButton color="inherit" onClick={fetchServiceData}>
                  <RefreshIcon />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          <Card sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleChangeTab}
              sx={{ px: 2, pt: 2 }}
            >
              <Tab label="Service Requests" icon={<BuildIcon />} iconPosition="start" />
              <Tab label="Technician Management" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Customer Management" icon={<PeopleIcon />} iconPosition="start" />
              <Tab label="Service Analytics" icon={<TimelineIcon />} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Scrollbar>
                  {renderServiceRequests()}
                </Scrollbar>
              )}

              {activeTab === 1 && (
                <Scrollbar>
                  {renderTechnicianManagement()}
                </Scrollbar>
              )}

              {activeTab === 2 && (
                <Scrollbar>
                  {renderCustomerManagement()}
                </Scrollbar>
              )}

              {activeTab === 3 && (
                <Scrollbar>
                  {renderServiceAnalytics()}
                </Scrollbar>
              )}
            </Box>
          </Card>
        </Container>

        {/* Service Details Dialog */}
        <Dialog
          open={serviceDetailOpen}
          onClose={() => setServiceDetailOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                {selectedService?.title || 'Service Details'}
              </Typography>
              <IconButton onClick={() => setServiceDetailOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedService && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Service Type:</Typography>
                <Typography paragraph>{selectedService.serviceType}</Typography>

                <Typography variant="subtitle1" gutterBottom>Description:</Typography>
                <Typography paragraph>{selectedService.description || 'No description available.'}</Typography>

                <Typography variant="subtitle1" gutterBottom>Price:</Typography>
                <Typography paragraph>£{selectedService.price}</Typography>

                {/* Additional service-specific details can be rendered based on service type */}
                {selectedService.serviceType === 'card' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Card Details:</Typography>
                    <Typography paragraph>{selectedService.cardDetails || 'No specific details available.'}</Typography>
                  </Box>
                )}

                {selectedService.serviceType === 'test' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Test Details:</Typography>
                    <Typography paragraph>{selectedService.testDetails || 'No specific details available.'}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setServiceDetailOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                handleUpdateStatus(selectedService.id, 'completed');
                setServiceDetailOpen(false);
              }}
            >
              Mark Complete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Technician Assignment Dialog */}
        <Dialog
          open={assignmentDialogOpen}
          onClose={() => setAssignmentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Assign Technician</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Technician</InputLabel>
                <Select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  label="Select Technician"
                >
                  {technicians.map((tech) => (
                    <MenuItem
                      key={tech.id}
                      value={tech.id}
                      disabled={tech.availability !== 'available'}
                    >
                      {tech.name} - {tech.specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAssignmentSubmit}>Assign</Button>
          </DialogActions>
        </Dialog>
      </Page>
    </ServiceCustomerContext.Provider>
  );
}

export default ServicePortal;