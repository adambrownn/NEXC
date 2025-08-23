import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

/**
 * Component for rendering order-level details in the QuickOrderPanel
 */
const QuickOrderDetails = ({
  orderStatus,
  setOrderStatus,
  orderScheduledDate,
  setOrderScheduledDate,
  orderPriority,
  setOrderPriority
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Order Details
      </Typography>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Order Status</InputLabel>
          <Select
            value={orderStatus || 'pending'}
            onChange={(e) => setOrderStatus(e.target.value)}
            label="Order Status"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Scheduled Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={orderScheduledDate || ''}
          onChange={(e) => setOrderScheduledDate(e.target.value)}
        />
        
        <FormControl fullWidth>
          <InputLabel>Order Priority</InputLabel>
          <Select
            value={orderPriority || 'normal'}
            onChange={(e) => setOrderPriority(e.target.value)}
            label="Order Priority"
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
};

export default QuickOrderDetails;