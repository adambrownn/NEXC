import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Alert,
  Button,
  TextField
} from '@mui/material';
import { StatusChip } from './QuickOrderComponents';

/**
 * Component for displaying order summary and handling order creation
 */
const QuickOrderSummary = ({
  orderSummary,
  selectedCustomer,
  selectedServices,
  serviceDetails,
  orderNotes,
  setOrderNotes,
  handleCreateOrder,
  createdOrder,
  orderDraft,
  loadingStates,
  ContentSkeleton
}) => {
  // Function to render customer status chip
  const getCustomerStatusChip = (status) => {
    return <StatusChip status={status} />;
  };

  if (loadingStates?.orderCreation) {
    return <ContentSkeleton />;
  }

  // Guard clause for when selectedCustomer is null
  if (!selectedCustomer) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">
          No customer selected. Please go back and select a customer.
        </Typography>
      </Paper>
    );
  }

  if (!orderSummary) {
    return (
      <Stack spacing={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Review Order Details
          </Typography>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Customer Information
            </Typography>
            <Typography>
              {selectedCustomer.firstName} {selectedCustomer.lastName}
              <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                ({selectedCustomer.email})
              </Typography>
            </Typography>
            {selectedCustomer.status && getCustomerStatusChip(selectedCustomer.status)}
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Services
            </Typography>
            {selectedServices.length > 0 ? (
              <Stack spacing={2}>
                {selectedServices.map((service) => {
                  const serviceId = service._id || service.id;
                  return (
                    <Alert severity="info" key={serviceId}>
                      <Typography variant="subtitle1">
                        {service.title || service.name}
                      </Typography>
                      {serviceDetails[serviceId] && (
                        <Typography variant="body2" color="text.secondary">
                          {service.category === 'cards' && 'Card Service'}
                          {service.category === 'tests' && 'Test Service'}
                          {service.category === 'courses' && 'Course Service'}
                          {service.category === 'qualifications' && 'Qualification Service'}
                        </Typography>
                      )}
                      <Typography variant="subtitle1" color="primary">
                        £{service.price || 0}
                      </Typography>
                    </Alert>
                  );
                })}
                <Typography variant="h6" align="right">
                  Total: £{selectedServices.reduce((sum, service) => sum + (service.price || 0), 0).toFixed(2)}
                </Typography>
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No services selected. Please go back and select services.
              </Typography>
            )}
          </Paper>

          <TextField
            multiline
            rows={3}
            label="Order Notes"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateOrder}
            fullWidth
            sx={{ mt: 2 }}
            disabled={selectedServices.length === 0}
          >
            Create Order
          </Button>
        </Paper>
      </Stack>
    );
  }

  // Only render if orderSummary exists
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Order Created Successfully
        </Typography>
        <Typography>
          Order Reference: {createdOrder?.orderReference || orderSummary?.orderReference || orderDraft?.orderReference || 'N/A'}
        </Typography>
        <Typography>
          Order ID: {createdOrder?._id || createdOrder?.id || orderSummary?._id || orderSummary?.id || 'N/A'}
        </Typography>
        <Typography>
          Total Amount: £{(
            createdOrder?.grandTotalToPay || 
            createdOrder?.itemsTotal || 
            createdOrder?.amount || 
            orderSummary?.grandTotalToPay || 
            orderSummary?.itemsTotal || 
            orderSummary?.amount || 
            0
          ).toFixed(2)}
        </Typography>
        <Typography>
          Created At: {(createdOrder?.createdAt || orderSummary?.createdAt) ? new Date(createdOrder?.createdAt || orderSummary?.createdAt).toLocaleString() : 'N/A'}
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.dispatchEvent(new CustomEvent('nextStep'))}
          fullWidth
          sx={{ mt: 2 }}
        >
          Proceed to Payment
        </Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>
        <Typography>
          {selectedCustomer.firstName} {selectedCustomer.lastName}
          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
            ({selectedCustomer.email})
          </Typography>
        </Typography>
        {selectedCustomer.status && getCustomerStatusChip(selectedCustomer.status)}
      </Paper>
    </Stack>
  );
};

export default QuickOrderSummary;