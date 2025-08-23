import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
  IconButton,
  Tab,
  Tabs,
  LinearProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CardMembership as CardMembershipIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Page from '../../../components/Page';
import QuickOrderPanel from '../../../components/_dashboard/sales/QuickOrderPanel';
import CustomerManagement from '../../../components/_dashboard/sales/CustomerManagement';
import ProductCatalog from '../../../components/_dashboard/sales/ProductCatalog';
import BookingsOverview from '../../../components/_dashboard/sales/BookingsOverview';
import { salesService } from '../../../services/sales.service';

function SalesMetricCard({ title, value, icon, trend, color }) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="body2"
                sx={{
                  color: trend >= 0 ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}
              >
                <TrendingUpIcon
                  sx={{
                    mr: 0.5,
                    transform: trend < 0 ? 'rotate(180deg)' : 'none'
                  }}
                />
                {Math.abs(trend)}% from last month
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.lighter`,
              color: `${color}.darker`
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SalesPortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState({ booked: [], reserved: [] });
  const { enqueueSnackbar } = useSnackbar();

  // Add state for customer selection
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchSalesData = useCallback(async () => {
  try {
    setLoading(true);
    
    // Fetch services
    const data = await salesService.getServices();
    
    // Verify that each service has a price
    const servicesWithPrices = data.map(service => {
      if (typeof service.price !== 'number' || isNaN(service.price)) {
        console.warn(`Service ${service.id} is missing a valid price. Setting to 0.`);
        return { ...service, price: 0 };
      }
      return service;
    });

    setSalesData(servicesWithPrices);
    
    // Update metrics
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      totalServices: servicesWithPrices.length,
      activeServices: servicesWithPrices.filter(s => s.status === 'active').length,
      totalRevenue: servicesWithPrices.reduce((sum, s) => sum + s.price, 0)
    }));

      // Only fetch bookings data if we're on the bookings tab
      if (activeTab === 3) {
        const orders = await salesService.getOrders();
        setBookings({ 
          booked: orders.filter(order => order.orderType === 'ONLINE'),
          reserved: orders.filter(order => order.orderType === 'PHONE')
        });
      }

      // Clear any existing errors
      setError(null);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError(error.message || 'Failed to fetch sales data');
      enqueueSnackbar('Failed to load sales data. Please try again.', { 
        variant: 'error',
        action: (
          <IconButton color="inherit" onClick={fetchSalesData}>
            <RefreshIcon />
          </IconButton>
        )
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, activeTab]);

  useEffect(() => {
  if (activeTab !== 0) {
    setSelectedCustomer(null);
  }
}, [activeTab]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleRefresh = () => {
    fetchSalesData();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCustomerSelect = useCallback((customer) => {
  console.log('Customer selected in SalesPortal:', customer);
  console.log('Switching to Quick Order tab with customer:', customer);  // <-- Add this line here
  setSelectedCustomer(customer);
  setActiveTab(0); // Automatically switch to the Quick Order tab
  console.log('Switching to Quick Order tab with customer:', customer);
}, []);

  // Add handler for customer needed action
  const handleCustomerNeeded = () => {
    setActiveTab(1); // Switch to Customer Management tab
  };

  if (loading && !salesData) {
    return (
      <Page title="Sales Portal">
        <Container>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Loading sales data...
          </Typography>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Sales Portal">
      <Container>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRefresh}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Metrics Section */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <SalesMetricCard
                  title="Total Services"
                  value={metrics?.totalServices || 0}
                  icon={<CardMembershipIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <SalesMetricCard
                  title="Active Services"
                  value={metrics?.activeServices || 0}
                  icon={<SchoolIcon />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <SalesMetricCard
                  title="Total Revenue"
                  value={`$${(metrics?.totalRevenue || 0).toFixed(2)}`}
                  icon={<TrendingUpIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <SalesMetricCard
                  title="Active Customers"
                  value={metrics?.activeCustomers || 0}
                  icon={<PeopleIcon />}
                  color="warning"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="Quick Order" />
                  <Tab label="Customer Management" />
                  <Tab label="Product Catalog" />
                  <Tab label="Bookings" />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
               {activeTab === 0 && (
  selectedCustomer ? (
    <QuickOrderPanel 
      key={selectedCustomer ? selectedCustomer._id : 'no-customer'}  // Force re-render
      customer={selectedCustomer}
      onCustomerNeeded={handleCustomerNeeded}
      services={salesData || []}
      onSuccess={handleRefresh}
    />
  ) : (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="h6" gutterBottom>
        No customer selected
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleCustomerNeeded}
        startIcon={<PeopleIcon />}
      >
        Select a Customer
      </Button>
    </Box>
  )
)}
                {activeTab === 1 && (
                  <CustomerManagement 
                    onCustomerSelect={handleCustomerSelect}
                    onCustomerConfirmed={null}  // Remove redundant callback
                  />
                )}
                {activeTab === 2 && (
                  <ProductCatalog 
                    services={salesData || []}
                    onSuccess={handleRefresh}
                  />
                )}
                {activeTab === 3 && (
                  <BookingsOverview 
                    bookings={bookings}
                    onCustomerSelect={handleCustomerSelect}
                  />
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
