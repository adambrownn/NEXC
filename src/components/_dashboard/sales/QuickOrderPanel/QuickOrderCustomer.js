import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Component for customer selection and display in the QuickOrderPanel
 */
const QuickOrderCustomer = ({
  selectedCustomer,
  customerBookings,
  isCustomerConfirmed,
  handleChangeCustomer,
  handleCustomerConfirmation,
  loadingStates,
  ContentSkeleton
}) => {
  // Function to render customer status chip
  const getCustomerStatusChip = (status) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'active':
          return 'success';
        case 'pending':
          return 'warning';
        case 'inactive':
        case 'blocked':
          return 'error';
        default:
          return 'default';
      }
    };

    return (
      <Chip 
        label={status} 
        color={getStatusColor(status)} 
        size="small" 
        sx={{ textTransform: 'capitalize', mt: 1 }}
      />
    );
  };

  if (loadingStates?.customerValidation) {
    return <ContentSkeleton />;
  }

  if (!selectedCustomer) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No customer selected. Please select a customer to continue.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleChangeCustomer}
          sx={{ mt: 2 }}
        >
          Select Customer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Typography variant="body1">{selectedCustomer.firstName} {selectedCustomer.lastName}</Typography>
      <Typography variant="body2" color="text.secondary">{selectedCustomer.email}</Typography>
      <Typography variant="body2" color="text.secondary">{selectedCustomer.phoneNumber}</Typography>
      
      {selectedCustomer.status && getCustomerStatusChip(selectedCustomer.status)}
      
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Customer Bookings:</Typography>
      <Box sx={{ ml: 2 }}>
        <Typography variant="body2">
          Booked: {customerBookings?.booked?.length || 0}
        </Typography>
        <Typography variant="body2">
          Reserved: {customerBookings?.reserved?.length || 0}
        </Typography>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleChangeCustomer}
          sx={{ mr: 2 }}
        >
          Change Customer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleCustomerConfirmation(true)}
          startIcon={<CheckCircleIcon />}
          disabled={isCustomerConfirmed}
        >
          {isCustomerConfirmed ? 'Details Confirmed' : 'Confirm Details'}
        </Button>
      </Box>
    </Box>
  );
};

export default QuickOrderCustomer;