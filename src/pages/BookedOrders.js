import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Paper,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  ShoppingCart as OrderIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Page from '../components/Page';
import ordersService from '../services/orders.service';
import { useAuth } from '../contexts/AuthContext';

// Styled components
const HeaderCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.secondary.contrastText,
}));

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.grey[500], 0.04),
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  minWidth: '120px',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
}));

// Role-based access control helper
const useOrderPermissions = () => {
  const { user } = useAuth();
  
  return {
    canCreateOrders: ['admin', 'superadmin', 'manager'].includes(user?.role || user?.accountType),
    canDeleteOrders: ['admin', 'superadmin'].includes(user?.role || user?.accountType),
    canEditOrders: ['admin', 'superadmin', 'manager'].includes(user?.role || user?.accountType),
    canViewAllOrders: ['admin', 'superadmin', 'manager', 'supervisor'].includes(user?.role || user?.accountType),
    canProcessPayments: ['admin', 'superadmin', 'manager'].includes(user?.role || user?.accountType),
    isAdmin: ['admin', 'superadmin'].includes(user?.role || user?.accountType)
  };
};

export default function BookedOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Filter states
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Form state for creating/editing orders
  const [orderForm, setOrderForm] = useState({
    orderType: 'ONLINE',
    customerId: '',
    paymentStatus: 0,
    orderCheckPoint: 0,
    paymentMethod: 'card',
    itemsTotal: 0,
    grandTotalToPay: 0,
    items: []
  });

  const { enqueueSnackbar } = useSnackbar();
  const permissions = useOrderPermissions();

  // Load orders function with useCallback to prevent dependency warnings
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersService.getOrders();
      const formattedData = data.map(order => ordersService.formatOrderData(order));
      setOrders(formattedData);
      enqueueSnackbar(`Loaded ${formattedData.length} orders`, { variant: 'success' });
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders');
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Filter orders function with useCallback
  const filterOrders = useCallback(() => {
    let filtered = orders;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query) ||
        order.orderReference?.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query) ||
        order.itemsDescription?.toLowerCase().includes(query)
      );
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === parseInt(paymentStatusFilter));
    }

    // Order status filter
    if (orderStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderCheckPoint === parseInt(orderStatusFilter));
    }

    // Order type filter
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(order => order.orderType === orderTypeFilter);
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRangeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      if (dateRangeFilter !== 'all') {
        filtered = filtered.filter(order => 
          new Date(order.createdAt) >= filterDate
        );
      }
    }

    setFilteredOrders(filtered);
    setPage(0);
  }, [orders, searchQuery, paymentStatusFilter, orderStatusFilter, orderTypeFilter, dateRangeFilter]);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filter orders
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  // Access control check
  if (!permissions.canViewAllOrders) {
    return (
      <Page title="Booked Orders | NEXC Construction Platform">
        <Container>
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="h6">Access Denied</Typography>
            <Typography>
              You don't have permission to view orders. 
              Contact your administrator for access.
            </Typography>
          </Alert>
        </Container>
      </Page>
    );
  }

  const handleUpdateOrder = async () => {
    if (!permissions.canEditOrders) {
      enqueueSnackbar('Access denied: Only managers and admins can edit orders', { variant: 'error' });
      return;
    }

    try {
      const updatedOrder = await ordersService.updateOrder(selectedOrder.id, orderForm);
      const formattedOrder = ordersService.formatOrderData(updatedOrder);
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id ? formattedOrder : order
      ));
      setEditDialogOpen(false);
      enqueueSnackbar('Order updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update order', { variant: 'error' });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!permissions.canDeleteOrders) {
      enqueueSnackbar('Access denied: Only admins can delete orders', { variant: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await ordersService.deleteOrder(orderId);
        setOrders(prev => prev.filter(order => order.id !== orderId));
        enqueueSnackbar('Order deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete order', { variant: 'error' });
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setOrderForm({
      orderType: order.orderType || 'ONLINE',
      customerId: order.customerId || '',
      paymentStatus: order.paymentStatus || 0,
      orderCheckPoint: order.orderCheckPoint || 0,
      paymentMethod: order.paymentMethod || 'card',
      itemsTotal: order.itemsTotal || 0,
      grandTotalToPay: order.grandTotalToPay || 0,
      items: order.items || []
    });
    setEditDialogOpen(true);
  };

  const handleExportOrders = () => {
    try {
      const exportData = ordersService.prepareOrdersForExport(filteredOrders);
      const csvContent = convertToCSV(exportData);
      downloadCSV(csvContent, 'booked-orders.csv');
      enqueueSnackbar('Orders exported successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to export orders', { variant: 'error' });
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatistics = () => {
    return ordersService.calculateOrderStatistics(orders);
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Page title="Booked Orders | NEXC Construction Platform">
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={40} />
          </Box>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Booked Orders | NEXC Construction Platform">
        <Container>
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="h6">Error Loading Orders</Typography>
            <Typography>{error}</Typography>
            <Button onClick={loadOrders} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Booked Orders | NEXC Construction Platform">
      <Container maxWidth="xl">
        {/* Header */}
        <HeaderCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                🛒 Booked Orders Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Track and manage customer orders and bookings
              </Typography>
            </Box>
            <Box>
              <ActionButton
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadOrders}
                sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Refresh
              </ActionButton>
              <ActionButton
                variant="contained"
                startIcon={<ExportIcon />}
                onClick={handleExportOrders}
                sx={{ bgcolor: 'secondary.dark', '&:hover': { bgcolor: 'secondary.main' } }}
              >
                Export CSV
              </ActionButton>
            </Box>
          </Box>
        </HeaderCard>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="primary" gutterBottom>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="success.main" gutterBottom>
                {stats.paidOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid Orders
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="warning.main" gutterBottom>
                {stats.pendingOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Orders
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" color="info.main" gutterBottom>
                £{stats.totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <SearchContainer>
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <InputBase
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </SearchContainer>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    label="Payment Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {ordersService.getPaymentStatuses().map(status => (
                      <MenuItem key={status.value} value={status.value.toString()}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order Status</InputLabel>
                  <Select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    label="Order Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {ordersService.getOrderCheckpoints().map(status => (
                      <MenuItem key={status.value} value={status.value.toString()}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={orderTypeFilter}
                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                    label="Order Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {ordersService.getOrderTypes().map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="quarter">Last Quarter</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography variant="body2" color="text.secondary" align="center">
                  {filteredOrders.length} of {orders.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Order Details</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {order.customerName?.charAt(0)?.toUpperCase() || 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {order.customerName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.customerEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {order.orderReference || order.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Badge badgeContent={order.itemCount} color="primary" sx={{ mr: 1 }}>
                              <OrderIcon fontSize="small" />
                            </Badge>
                            {order.itemsDescription}
                          </Typography>
                          <Chip
                            label={order.orderTypeLabel}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={order.paymentStatusLabel}
                            size="small"
                            color={order.paymentStatusColor}
                            variant="filled"
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {order.paymentMethodLabel}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatusLabel}
                          size="small"
                          color={order.orderStatusColor}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            £{order.grandTotalToPay.toFixed(2)}
                          </Typography>
                          {order.grandTotalPaid > 0 && (
                            <Typography variant="body2" color="success.main">
                              Paid: £{order.grandTotalPaid.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.formattedDate}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrder(order)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {permissions.canEditOrders && (
                            <Tooltip title="Edit Order">
                              <IconButton
                                size="small"
                                onClick={() => handleEditOrder(order)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {permissions.canDeleteOrders && (
                            <Tooltip title="Delete Order">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* View Order Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Customer Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedOrder.customerName}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedOrder.customerEmail}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedOrder.customerPhone || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Order Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Order Reference</Typography>
                      <Typography variant="body1">{selectedOrder.orderReference || selectedOrder.id}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Order Type</Typography>
                      <Typography variant="body1">{selectedOrder.orderTypeLabel}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1">{selectedOrder.paymentMethodLabel}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Payment Status</Typography>
                      <Chip
                        label={selectedOrder.paymentStatusLabel}
                        color={selectedOrder.paymentStatusColor}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Order Status</Typography>
                      <Chip
                        label={selectedOrder.orderStatusLabel}
                        color={selectedOrder.orderStatusColor}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">Items Total</Typography>
                      <Typography variant="body1">£{selectedOrder.itemsTotal.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">Grand Total</Typography>
                      <Typography variant="body1">£{selectedOrder.grandTotalToPay.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">Amount Paid</Typography>
                      <Typography variant="body1">£{selectedOrder.grandTotalPaid.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                      <Typography variant="body1">{selectedOrder.formattedDateTime}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Updated Date</Typography>
                      <Typography variant="body1">{selectedOrder.formattedUpdatedDate}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Order Items</Typography>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <List>
                      {selectedOrder.items.map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={item.title || item.type || 'Unknown Item'}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Quantity: {item.quantity || 1} | Price: £{item.price?.toFixed(2) || '0.00'}
                                  </Typography>
                                  {item.serviceType && (
                                    <Chip label={item.serviceType} size="small" sx={{ mt: 0.5 }} />
                                  )}
                                  {item.status && (
                                    <Chip label={item.status} size="small" sx={{ mt: 0.5, ml: 1 }} />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < selectedOrder.items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No items found
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={orderForm.orderType}
                    onChange={(e) => setOrderForm({...orderForm, orderType: e.target.value})}
                    label="Order Type"
                  >
                    {ordersService.getOrderTypes().map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    label="Payment Method"
                  >
                    {ordersService.getPaymentMethods().map(method => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={orderForm.paymentStatus}
                    onChange={(e) => setOrderForm({...orderForm, paymentStatus: parseInt(e.target.value)})}
                    label="Payment Status"
                  >
                    {ordersService.getPaymentStatuses().map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Order Status</InputLabel>
                  <Select
                    value={orderForm.orderCheckPoint}
                    onChange={(e) => setOrderForm({...orderForm, orderCheckPoint: parseInt(e.target.value)})}
                    label="Order Status"
                  >
                    {ordersService.getOrderCheckpoints().map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Items Total"
                  type="number"
                  step="0.01"
                  value={orderForm.itemsTotal}
                  onChange={(e) => setOrderForm({...orderForm, itemsTotal: parseFloat(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Grand Total to Pay"
                  type="number"
                  step="0.01"
                  value={orderForm.grandTotalToPay}
                  onChange={(e) => setOrderForm({...orderForm, grandTotalToPay: parseFloat(e.target.value) || 0})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateOrder}>
              Update Order
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}
