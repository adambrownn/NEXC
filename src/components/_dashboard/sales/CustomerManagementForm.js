import React, { useState } from 'react';
import {
  TextField,
  Stack,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { CUSTOMER_STATUS } from '../../../types/customer.types';

const CUSTOMER_TYPES = {
  NEW_FIRST_TIME: 'NEW_FIRST_TIME',
  NEW_PROSPECT: 'NEW_PROSPECT',
  EXISTING_COMPLETED: 'EXISTING_COMPLETED',
  EXISTING_ACTIVE: 'EXISTING_ACTIVE'
};

export default function CustomerManagementForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    NINumber: initialData?.NINumber || '',
    address: initialData?.address || '',
    zipcode: initialData?.zipcode || '',
    status: initialData?.status || CUSTOMER_STATUS.NEW_FIRST_TIME,
    customerType: initialData?.customerType || CUSTOMER_TYPES.NEW_FIRST_TIME,
    ...initialData // Preserve any additional fields from initialData
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure backward compatibility by setting the name field
    const submissionData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim()
    };
    await onSubmit(submissionData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h6">Customer Information</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="National Insurance Number"
                name="NINumber"
                value={formData.NINumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Customer Status"
                >
                  {Object.entries(CUSTOMER_STATUS).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  label="Customer Type"
                >
                  {Object.entries(CUSTOMER_TYPES).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" type="button">
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              type="submit"
            >
              Save Customer
            </LoadingButton>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
}
