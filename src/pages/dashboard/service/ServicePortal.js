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
  Chip,
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
  Person as PersonIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon
  // Support as SupportIcon - Removed, tickets available via sidebar
  // ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
// import { Link } from 'react-router-dom';

// Components
import Page from '../../../components/Page';
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
// TicketManagement removed - available via dedicated sidebar navigation
// import TicketManagement from '../../../components/_dashboard/service/TicketManagement';
import userService from '../../../services/user.service';
// import { fCurrency } from '../../../utils/formatNumber';

// API services
import { salesService } from '../../../services/sales.service';
import axiosInstance from '../../../axiosConfig';

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
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [customerForDetails, setCustomerForDetails] = useState(null);
  const [filterByCustomer, setFilterByCustomer] = useState(selectedCustomer ? true : false);
  const [customerServiceHistory, setCustomerServiceHistory] = useState([]);

  // Technician Management States
  const [technicianDialogOpen, setTechnicianDialogOpen] = useState(false);
  const [technicianFormMode, setTechnicianFormMode] = useState('create'); // 'create' or 'edit'
  const [selectedTechnicianForEdit, setSelectedTechnicianForEdit] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [technicianSearchQuery, setTechnicianSearchQuery] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('all'); // 'all', 'available', 'busy', 'offline'

  // State for action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Analytics state
  const [analytics, setAnalytics] = useState({
    ordered: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalServices: 0,
    revenue: 0,
    avgCompletionTime: 0,
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
      // CRITICAL: Create ONE service request PER ITEM (not per order)
      // Each order can have multiple services in the items array
      // CRITICAL: Only show orders that have been PAID (paymentStatus === 2)
      const serviceRequests = [];
      
      orders.forEach(order => {
        // Skip orders without items
        if (!order.items || !Array.isArray(order.items)) {
          return;
        }
        
        // CRITICAL: Only include PAID orders in Service Portal
        // paymentStatus: 0 = Not Initiated, 1 = Pending, 2 = Paid, 3 = Failed/Cancelled
        if (order.paymentStatus !== 2) {
          return;
        }

        // Create a service request for each item in the order
        order.items.forEach(item => {
          // Generate proper order reference display
          const orderId = order.id || order._id;
          const orderRef = order.orderReference || (orderId ? `ORD-${String(orderId).slice(-8)}` : 'N/A');
          const orderDisplay = order.orderReference ? order.orderReference : (orderId ? `Ref: ${String(orderId).slice(-8)}` : 'N/A');
          
          serviceRequests.push({
            // Use item ID as primary identifier
            id: item._id || item.id,
            
            // Order reference for grouping and display
            orderId: orderRef,
            orderIdDisplay: orderDisplay,
            orderMongoId: orderId,
            orderCreatedAt: order.createdAt,
            orderType: order.orderType,
            
            // Complete order object for navigation/details
            orderDetails: {
              id: orderId,
              orderReference: order.orderReference,
              orderType: order.orderType,
              paymentStatus: order.paymentStatus,
              orderCheckPoint: order.orderCheckPoint,
              itemsTotal: order.itemsTotal,
              grandTotalToPay: order.grandTotalToPay,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            },
            
            // Customer information from order
            customerId: order.customer?._id || order.customerId,
            customerName: order.customer?.name ||
              `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
            customerEmail: order.customer?.email,
            customerPhone: order.customer?.phoneNumber,
            customerDetails: order.customer, // Complete customer object
            
            // Service/Item specific details
            serviceTitle: item.title,
            serviceType: item.serviceType,
            serviceReference: item.serviceReference,
            price: item.price,
            quantity: item.quantity || 1,
            
            // Status from ITEM level (not order level)
            status: item.status || 'ordered',
            
            // Assignment and scheduling from ITEM level
            assignedTechnician: item.assignedTo,
            scheduledDate: item.scheduledDate,
            completedDate: item.completedDate,
            followUpDate: item.followUpDate,
            
            // Service-specific details based on type
            cardDetails: item.cardDetails,
            testDetails: item.testDetails,
            courseDetails: item.courseDetails,
            qualificationDetails: item.qualificationDetails,
            
            // Additional metadata
            notes: item.notes,
            serviceHistory: item.serviceHistory || [],
            
            // Priority calculation (can be enhanced based on business rules)
            priority: item.priority || calculatePriority(item, order),
            
            // Dates
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          });
        });
      });

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

  // Helper function to calculate priority based on item and order details
  const calculatePriority = (item, order) => {
    // High priority if scheduled soon
    if (item.scheduledDate) {
      const daysUntilScheduled = Math.ceil((new Date(item.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilScheduled <= 2) return 'high';
      if (daysUntilScheduled <= 7) return 'medium';
    }
    
    // High priority for tests (time-sensitive)
    if (item.serviceType === 'test') return 'high';
    
    // Medium priority for cards (compliance requirement)
    if (item.serviceType === 'card') return 'medium';
    
    // Default to normal
    return 'normal';
  };

  // Helper function to get technician name by ID
  const getTechnicianName = (technicianId) => {
    if (!technicianId) return null;
    const technician = technicians.find(t => 
      t.id === technicianId || 
      t._id === technicianId || 
      String(t.id) === String(technicianId) || 
      String(t._id) === String(technicianId)
    );
    if (!technician) return 'Unassigned Technician';
    return `${technician.firstName} ${technician.lastName}`;
  };

  // Fetch technicians
  const fetchTechnicians = useCallback(async () => {
    try {
      // Get technicians from API
      const response = await axiosInstance.get('/technicians');

      // Handle different response formats
      if (response.data) {
        // If response has success flag and data property
        if (response.data.success && Array.isArray(response.data.data)) {
          setTechnicians(response.data.data);
        }
        // If response.data is directly an array
        else if (Array.isArray(response.data)) {
          setTechnicians(response.data);
        }
        // Otherwise use empty array
        else {
          console.warn('Unexpected technicians response format:', response.data);
          setTechnicians([]);
        }
      } else {
        setTechnicians([]);
      }
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

      // Calculate analytics from current data (item-based now)
      const ordered = serviceRequests.filter(r => r.status === 'ordered').length;
      const scheduled = serviceRequests.filter(r => r.status === 'scheduled').length;
      const inProgress = serviceRequests.filter(r => r.status === 'in-progress').length;
      const completed = serviceRequests.filter(r => r.status === 'completed').length;
      const cancelled = serviceRequests.filter(r => r.status === 'cancelled').length;

      // Count services by type
      const serviceTypeBreakdown = {};
      serviceRequests.forEach(request => {
        const type = request.serviceType || 'unknown';
        serviceTypeBreakdown[type] = (serviceTypeBreakdown[type] || 0) + 1;
      });

      // Calculate revenue (completed services only)
      const revenue = serviceRequests
        .filter(r => r.status === 'completed')
        .reduce((sum, req) => sum + (req.price || 0), 0);

      // Calculate average completion time for completed services
      const completedWithDates = serviceRequests.filter(r => 
        r.status === 'completed' && r.completedDate && r.createdAt
      );
      const avgCompletionTime = completedWithDates.length > 0
        ? completedWithDates.reduce((sum, req) => {
            const timeDiff = new Date(req.completedDate) - new Date(req.createdAt);
            return sum + timeDiff;
          }, 0) / completedWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      setAnalytics({
        ordered,
        scheduled,
        inProgress,
        completed,
        cancelled,
        totalServices: serviceRequests.length,
        serviceTypeBreakdown,
        revenue,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10 // Round to 1 decimal
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

      // Service type filter - now direct property
      if (filters.serviceType !== 'all' && request.serviceType !== filters.serviceType) {
        return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = request.customerName?.toLowerCase().includes(query);
        const matchesOrderId = request.orderId?.toLowerCase().includes(query);
        const matchesServiceTitle = request.serviceTitle?.toLowerCase().includes(query);
        const matchesServiceRef = request.serviceReference?.toLowerCase().includes(query);
        const matchesNotes = request.notes?.toLowerCase().includes(query);

        if (!matchesName && !matchesOrderId && !matchesServiceTitle && !matchesServiceRef && !matchesNotes) {
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
      
      // Map priority to valid enum values (low, medium, high, urgent)
      const priorityMap = {
        'normal': 'medium',
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'urgent': 'urgent'
      };
      const validPriority = priorityMap[selectedRequest.priority] || 'medium';
      
      // API call to assign technician to specific item
      await axiosInstance.patch(`/orders/${selectedRequest.orderMongoId}/items/${selectedRequest.id}/assign`, {
        technicianId: selectedTechnician,
        priority: validPriority,
        notes: `Assigned via Service Portal`
      });

      // Refresh service requests to get updated data
      await fetchServiceData();
      
      setAssignmentDialogOpen(false);
      setSelectedTechnician('');
      enqueueSnackbar('Technician assigned successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error assigning technician:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to assign technician';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Update service status
  const handleUpdateStatus = async (requestId, newStatus, notes = '') => {
    try {
      setLoading(true);
      
      // Find the request to get orderMongoId
      const request = serviceRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Service request not found');
      }
      
      // Call API to update item status
      await axiosInstance.patch(`/orders/${request.orderMongoId}/items/${requestId}/status`, {
        status: newStatus,
        notes
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
      case 'ordered':
        return 'default';
      case 'scheduled':
        return 'info';
      case 'in-progress':
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
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



  // const handleCustomerSelect = (customer) => {
  //   setSelectedCustomer(customer);
  //   // If you want to automatically switch to service requests for this customer
  //   setActiveTab(0); // Switch to service requests tab
  // };

  // Note: Service requests are fetched from sales orders in fetchServiceData()
  // This creates one service request per order item (not a separate API endpoint)

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

  const handleViewCustomerDetails = async (request) => {
    try {
      // If we have customer details already, use them
      if (request.customerDetails) {
        setCustomerForDetails(request.customerDetails);
        setCustomerDetailsOpen(true);
      } else if (request.customerId) {
        // Otherwise fetch from API
        const customerData = await salesService.getCustomerById(request.customerId);
        if (customerData) {
          setCustomerForDetails(customerData);
          setCustomerDetailsOpen(true);
        } else {
          enqueueSnackbar('Customer details not found', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Customer information not available', { variant: 'warning' });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      enqueueSnackbar('Failed to load customer details', { variant: 'error' });
    }
  };

  // Technician Management Handlers
  const handleCreateTechnician = async () => {
    setTechnicianFormMode('create');
    setSelectedTechnicianForEdit(null);
    // Fetch available users
    try {
      const users = await userService.getUsers();
      setAvailableUsers(users);
      setTechnicianDialogOpen(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    }
  };

  const handleEditTechnician = async (technician) => {
    setTechnicianFormMode('edit');
    setSelectedTechnicianForEdit(technician);
    setTechnicianDialogOpen(true);
  };

  const handleTechnicianSubmit = async (technicianData) => {
    try {
      // Normalize field names for backend compatibility
      const backendData = {
        ...technicianData,
        phone: technicianData.phoneNumber || technicianData.phone
      };
      delete backendData.phoneNumber; // Remove frontend field name

      // Transform workSchedule to workingHours (frontend uses 'enabled', backend uses 'available')
      if (backendData.workSchedule) {
        backendData.workingHours = {};
        Object.keys(backendData.workSchedule).forEach(day => {
          backendData.workingHours[day] = {
            start: backendData.workSchedule[day].start,
            end: backendData.workSchedule[day].end,
            available: backendData.workSchedule[day].enabled !== undefined 
              ? backendData.workSchedule[day].enabled 
              : true
          };
        });
        delete backendData.workSchedule; // Remove frontend field name
      }

      // Add employmentDetails if not present (backend requires this structure)
      if (!backendData.employmentDetails) {
        backendData.employmentDetails = {
          hireDate: new Date(),
          position: 'Service Technician',
          department: 'Service',
          employmentType: 'full-time'
        };
      }

      if (technicianFormMode === 'create') {
        const response = await axiosInstance.post('/technicians', backendData);
        if (response.data.success) {
          enqueueSnackbar('Technician created successfully', { variant: 'success' });
          fetchTechnicians(); // Refresh list
          setTechnicianDialogOpen(false);
        }
      } else {
        const response = await axiosInstance.put(
          `/technicians/${selectedTechnicianForEdit.id || selectedTechnicianForEdit._id}`,
          backendData
        );
        if (response.data.success) {
          enqueueSnackbar('Technician updated successfully', { variant: 'success' });
          fetchTechnicians(); // Refresh list
          setTechnicianDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving technician:', error);
      enqueueSnackbar('Failed to save technician', { variant: 'error' });
    }
  };

  const handleUpdateTechnicianAvailability = async (technicianId, newAvailability) => {
    try {
      const response = await axiosInstance.patch(`/technicians/${technicianId}/availability`, {
        availability: newAvailability
      });
      if (response.data.success) {
        enqueueSnackbar('Availability updated', { variant: 'success' });
        fetchTechnicians();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      enqueueSnackbar('Failed to update availability', { variant: 'error' });
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
              <MenuItem value="ordered">Ordered</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
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
            <Grid item xs={12} md={6} lg={4} key={`service-${request.id}-${request.orderMongoId || Date.now()}`}>
              <Card
                sx={{
                  borderLeft: 3,
                  borderLeftColor: request.orderType === 'PHONE' ? 'secondary.main' : 'primary.main',
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" component="span">
                        Order #{request.orderIdDisplay}
                      </Typography>
                      {request.orderType === 'PHONE' && (
                        <Chip label="Phone Order" size="small" color="secondary" variant="outlined" />
                      )}
                    </Box>
                  }
                  subheader={
                    <>
                      <Typography variant="subtitle2" display="block" sx={{ mt: 0.5 }}>
                        {request.serviceTitle || `${request.serviceType?.toUpperCase()} Service`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Order Created: {new Date(request.orderCreatedAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                  action={
                    <>
                      <Label color={getStatusColor(request.status)}>
                        {request.status ? request.status.replace(/_/g, ' ').replace(/-/g, ' ') : 'Unknown'}
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Customer
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {request.customerName}
                        </Typography>
                        {request.customerEmail && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {request.customerEmail}
                          </Typography>
                        )}
                      </Box>
                      {request.customerId && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewCustomerDetails(request)}
                          title="View Customer Profile"
                        >
                          <PersonIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* Service Details - Single item per card now */}
                  <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Service Details:
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Type:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {request.serviceType?.charAt(0).toUpperCase() + request.serviceType?.slice(1)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Price:
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          £{request.price}
                        </Typography>
                      </Box>
                      {request.serviceReference && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Reference:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {request.serviceReference}
                          </Typography>
                        </Box>
                      )}
                      {request.assignedTechnician && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Assigned To:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {getTechnicianName(request.assignedTechnician)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

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

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    {(request.status === 'ordered' || request.status === 'pending') && (
                      <Button
                        startIcon={<AssignmentIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => handleAssignTechnician(request)}
                        fullWidth
                      >
                        Assign Technician
                      </Button>
                    )}
                    {(request.status === 'scheduled' || request.status === 'in-progress') && (
                      <Button
                        startIcon={<CheckIcon />}
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                        fullWidth
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
              handleViewServiceDetails(selectedRequest);
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
    // Filter technicians based on search and filter
    const filteredTechnicians = (Array.isArray(technicians) ? technicians : []).filter(tech => {
      // Search filter
      if (technicianSearchQuery) {
        const query = technicianSearchQuery.toLowerCase();
        const name = (tech.fullName || tech.name || `${tech.firstName} ${tech.lastName}`).toLowerCase();
        const specialties = Array.isArray(tech.specialties) ? tech.specialties.join(' ').toLowerCase() : (tech.specialty || '').toLowerCase();
        if (!name.includes(query) && !specialties.includes(query)) {
          return false;
        }
      }
      
      // Availability filter
      if (technicianFilter !== 'all' && tech.availability !== technicianFilter) {
        return false;
      }
      
      return true;
    });

    return (
      <Box>
        {/* Header with Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5">
            Technician Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<BuildIcon />}
            onClick={handleCreateTechnician}
          >
            Assign User as Technician
          </Button>
        </Box>

        {/* Filters and Search */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search technicians..."
            value={technicianSearchQuery}
            onChange={(e) => setTechnicianSearchQuery(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              endAdornment: <SearchIcon color="action" />
            }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Availability</InputLabel>
            <Select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              label="Availability"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="busy">Busy</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'success.lighter' }}>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {Array.isArray(technicians) ? technicians.filter(t => t.availability === 'available').length : 0}
                </Typography>
                <Typography variant="caption">Available</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'warning.lighter' }}>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {Array.isArray(technicians) ? technicians.filter(t => t.availability === 'busy').length : 0}
                </Typography>
                <Typography variant="caption">Busy</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'grey.200' }}>
              <CardContent>
                <Typography variant="h4" color="text.primary">
                  {Array.isArray(technicians) ? technicians.filter(t => t.availability === 'offline').length : 0}
                </Typography>
                <Typography variant="caption">Offline</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'primary.lighter' }}>
              <CardContent>
                <Typography variant="h4" color="primary.main">
                  {Array.isArray(technicians) ? technicians.length : 0}
                </Typography>
                <Typography variant="caption">Total</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Technician Cards */}
        {filteredTechnicians.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {technicianSearchQuery || technicianFilter !== 'all' 
                ? 'No technicians match your filters'
                : 'No technicians available'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<BuildIcon />}
              onClick={handleCreateTechnician}
              sx={{ mt: 2 }}
            >
              Create First Technician
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTechnicians.map((tech) => (
              <Grid item xs={12} md={6} lg={4} key={tech.id || tech._id}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title={tech.fullName || tech.name || `${tech.firstName} ${tech.lastName}`}
                    subheader={
                      <Box>
                        <Typography variant="caption" display="block">
                          {Array.isArray(tech.specialties) ? tech.specialties.join(', ') : tech.specialty || 'General'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Employee ID: {tech.employeeId || 'N/A'}
                        </Typography>
                      </Box>
                    }
                    action={
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={tech.availability || 'offline'}
                          onChange={(e) => handleUpdateTechnicianAvailability(tech.id || tech._id, e.target.value)}
                          variant="outlined"
                        >
                          <MenuItem value="available">
                            <Label color="success">Available</Label>
                          </MenuItem>
                          <MenuItem value="busy">
                            <Label color="warning">Busy</Label>
                          </MenuItem>
                          <MenuItem value="offline">
                            <Label color="default">Offline</Label>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    }
                  />
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Email:
                        </Typography>
                        <Typography variant="body2">
                          {tech.email || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Phone:
                        </Typography>
                        <Typography variant="body2">
                          {tech.phoneNumber || tech.phone || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Active Assignments:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {tech.assignedOrders?.filter(o => o.status === 'in-progress').length || 0}
                        </Typography>
                      </Box>
                      {tech.averageRating > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Rating:
                          </Typography>
                          <Typography variant="body2">
                            ⭐ {tech.averageRating.toFixed(1)} ({tech.totalRatings || 0} reviews)
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => handleEditTechnician(tech)}
                      >
                        Edit Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled
                      >
                        View Schedule
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  // Render analytics view
  const renderServiceAnalytics = () => {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'grey.100', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="text.primary">
                  {analytics.ordered || 0}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Ordered (New)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.lighter', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="info.main">
                  {analytics.scheduled || 0}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.lighter', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" color="primary.main">
                  {analytics.inProgress || 0}
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
                  {analytics.completed || 0}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Services
                </Typography>
                <Typography variant="h3" color="primary.main">
                  {analytics.totalServices || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Across all orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue (Completed)
                </Typography>
                <Typography variant="h3" color="success.main">
                  £{analytics.revenue?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {analytics.avgCompletionTime > 0 && (
                    `Avg completion: ${analytics.avgCompletionTime} days`
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardHeader title="Service Type Distribution" />
          <CardContent>
            <Box sx={{ px: 3 }}>
              {Object.entries(analytics.serviceTypeBreakdown || {}).map(([type, count]) => (
                <Box key={type} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.totalServices > 0 ? (count / analytics.totalServices) * 100 : 0}
                    color={
                      type === 'card' ? 'primary' :
                        type === 'test' ? 'secondary' :
                          type === 'course' ? 'info' :
                            type === 'qualification' ? 'success' :
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
              <Tab label="Service Analytics" icon={<TimelineIcon />} iconPosition="start" />
              {/* Support Tickets tab removed - available via dedicated sidebar navigation */}
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
                {selectedService.serviceType === 'card' && selectedService.cardDetails && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Card Details:</Typography>
                    {typeof selectedService.cardDetails === 'object' ? (
                      <Box sx={{ pl: 2 }}>
                        {selectedService.cardDetails.cardType && (
                          <Typography variant="body2">Type: {selectedService.cardDetails.cardType}</Typography>
                        )}
                        {selectedService.cardDetails.expiryDate && (
                          <Typography variant="body2">Expiry: {new Date(selectedService.cardDetails.expiryDate).toLocaleDateString()}</Typography>
                        )}
                        {selectedService.cardDetails.category && (
                          <Typography variant="body2">Category: {selectedService.cardDetails.category}</Typography>
                        )}
                        {selectedService.cardDetails.notes && (
                          <Typography variant="body2">Notes: {selectedService.cardDetails.notes}</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography paragraph>{String(selectedService.cardDetails)}</Typography>
                    )}
                  </Box>
                )}

                {selectedService.serviceType === 'test' && selectedService.testDetails && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Test Details:</Typography>
                    {typeof selectedService.testDetails === 'object' ? (
                      <Box sx={{ pl: 2 }}>
                        {selectedService.testDetails.testCenter && (
                          <Typography variant="body2">Test Center: {selectedService.testDetails.testCenter}</Typography>
                        )}
                        {selectedService.testDetails.testDate && (
                          <Typography variant="body2">Date: {new Date(selectedService.testDetails.testDate).toLocaleDateString()}</Typography>
                        )}
                        {selectedService.testDetails.testTime && (
                          <Typography variant="body2">Time: {selectedService.testDetails.testTime}</Typography>
                        )}
                        {selectedService.testDetails.notes && (
                          <Typography variant="body2">Notes: {selectedService.testDetails.notes}</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography paragraph>{String(selectedService.testDetails)}</Typography>
                    )}
                  </Box>
                )}
                
                {selectedService.serviceType === 'course' && selectedService.courseDetails && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Course Details:</Typography>
                    {typeof selectedService.courseDetails === 'object' ? (
                      <Box sx={{ pl: 2 }}>
                        {selectedService.courseDetails.startDate && (
                          <Typography variant="body2">Start Date: {new Date(selectedService.courseDetails.startDate).toLocaleDateString()}</Typography>
                        )}
                        {selectedService.courseDetails.location && (
                          <Typography variant="body2">Location: {selectedService.courseDetails.location}</Typography>
                        )}
                        {selectedService.courseDetails.notes && (
                          <Typography variant="body2">Notes: {selectedService.courseDetails.notes}</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography paragraph>{String(selectedService.courseDetails)}</Typography>
                    )}
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
                  {Array.isArray(technicians) && technicians.map((tech) => {
                    const techId = tech.id || tech._id;
                    const techName = tech.fullName || tech.name || `${tech.firstName} ${tech.lastName}`;
                    const techSpecialties = Array.isArray(tech.specialties) 
                      ? tech.specialties.join(', ') 
                      : tech.specialty || 'General';
                    const activeAssignments = tech.activeAssignmentsCount || 0;
                    const isAtCapacity = activeAssignments >= 5;
                    const isInactive = tech.status !== 'active';
                    const availabilityLabel = tech.availability === 'on-leave' ? ' (On Leave)' : 
                                             tech.availability === 'off-duty' ? ' (Off Duty)' : 
                                             isAtCapacity ? ' (At Capacity 5/5)' : 
                                             activeAssignments > 0 ? ` (${activeAssignments}/5 assigned)` : '';
                    
                    return (
                      <MenuItem
                        key={techId}
                        value={techId}
                        disabled={isInactive || tech.availability === 'on-leave' || isAtCapacity}
                      >
                        {techName} - {techSpecialties}{availabilityLabel}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              {selectedRequest && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Service:</strong> {selectedRequest.serviceTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Type:</strong> {selectedRequest.serviceType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Customer:</strong> {selectedRequest.customerName}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAssignmentSubmit}>Assign</Button>
          </DialogActions>
        </Dialog>

        {/* Customer Details Dialog */}
        <Dialog
          open={customerDetailsOpen}
          onClose={() => setCustomerDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Customer Details</Typography>
              <IconButton onClick={() => setCustomerDetailsOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {customerForDetails && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {customerForDetails.firstName} {customerForDetails.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {customerForDetails.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {customerForDetails.phoneNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date of Birth:</strong> {customerForDetails.dateOfBirth ? new Date(customerForDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>NI Number:</strong> {customerForDetails.NINumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Address:</strong> {customerForDetails.address || 'N/A'}
                      {customerForDetails.postcode && `, ${customerForDetails.postcode}`}
                    </Typography>
                  </Grid>
                  {customerForDetails.status && (
                    <Grid item xs={12}>
                      <Chip
                        label={customerForDetails.status.replace(/_/g, ' ')}
                        color={
                          customerForDetails.status.startsWith('NEW_') ? 'info' :
                          customerForDetails.status === 'EXISTING_COMPLETED' ? 'success' :
                          customerForDetails.status === 'EXISTING_ACTIVE' ? 'primary' : 'default'
                        }
                      />
                    </Grid>
                  )}
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setCustomerDetailsOpen(false);
                      setSelectedCustomer(customerForDetails);
                      setActiveTab(2); // Switch to Customer Management for full details
                    }}
                  >
                    View Full Details & History
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomerDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Technician Create/Edit Dialog */}
        <TechnicianDialog
          open={technicianDialogOpen}
          onClose={() => setTechnicianDialogOpen(false)}
          mode={technicianFormMode}
          technician={selectedTechnicianForEdit}
          availableUsers={availableUsers}
          onSubmit={handleTechnicianSubmit}
        />
      </Page>
    </ServiceCustomerContext.Provider>
  );
}

// Technician Dialog Component
function TechnicianDialog({ open, onClose, mode, technician, availableUsers, onSubmit }) {
  const specialtyOptions = ['Cards', 'Tests', 'Courses', 'Qualifications', 'General'];
  
  // Default work schedule (defined outside state to avoid dependency issues)
  const defaultWorkSchedule = {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' }
  };

  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialties: [],
    qualifications: [],
    availability: 'available',
    workSchedule: defaultWorkSchedule
  });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && technician) {
      setFormData({
        userId: technician.userId || '',
        firstName: technician.firstName || '',
        lastName: technician.lastName || '',
        email: technician.email || '',
        phoneNumber: technician.phoneNumber || technician.phone || '',
        specialties: Array.isArray(technician.specialties) ? technician.specialties : [],
        qualifications: Array.isArray(technician.qualifications) ? technician.qualifications : [],
        availability: technician.availability || 'available',
        workSchedule: technician.workSchedule || defaultWorkSchedule
      });
    } else {
      // Reset for create mode
      setFormData({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        specialties: [],
        qualifications: [],
        availability: 'available',
        workSchedule: defaultWorkSchedule
      });
      setSelectedUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, technician, open]);

  const handleUserSelect = (userId) => {
    const user = availableUsers.find(u => (u.id || u._id) === userId);
    if (user) {
      setSelectedUser(user);
      setFormData(prev => ({
        ...prev,
        userId: user.id || user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || user.phone || ''
      }));
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (mode === 'create' && !formData.userId) {
      alert('Please select a user');
      return;
    }
    if (!formData.firstName || !formData.lastName) {
      alert('First name and last name are required');
      return;
    }
    if (formData.specialties.length === 0) {
      alert('Please select at least one specialty');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Assign User as Technician' : 'Edit Technician Details'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {mode === 'create' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select User *</InputLabel>
                  <Select
                    value={formData.userId}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    label="Select User *"
                  >
                    <MenuItem value="">
                      <em>Select a user...</em>
                    </MenuItem>
                    {availableUsers.map(user => (
                      <MenuItem key={user.id || user._id} value={user.id || user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={mode === 'create' && !selectedUser}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={mode === 'create' && !selectedUser}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={mode === 'create' && !selectedUser}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={mode === 'create' && !selectedUser}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Specialties * (Select at least one)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {specialtyOptions.map(specialty => (
                  <Chip
                    key={specialty}
                    label={specialty}
                    onClick={() => handleSpecialtyToggle(specialty)}
                    color={formData.specialties.includes(specialty) ? 'primary' : 'default'}
                    variant={formData.specialties.includes(specialty) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Availability Status</InputLabel>
                <Select
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  label="Availability Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="busy">Busy</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Work Schedule (Optional)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Default schedule can be configured here. Individual assignments can override this.
              </Typography>
              {/* Work schedule can be expanded in future - keeping simple for now */}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === 'create' ? 'Create Technician' : 'Update Technician'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ServicePortal;