import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`bookings-tabpanel-${index}`}
      aria-labelledby={`bookings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function getCustomerName(customer) {
  if (!customer) return 'N/A';
  return customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';
}

function getCustomerStatusChip(status) {
  let color = 'default';
  let label = status;

  switch (status?.toLowerCase()) {
    case 'active':
      color = 'success';
      break;
    case 'pending':
      color = 'warning';
      break;
    case 'cancelled':
      color = 'error';
      break;
    case 'completed':
      color = 'info';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip
      label={label || 'Unknown'}
      color={color}
      size="small"
      variant="outlined"
    />
  );
}

function BookingsTable({ bookings, onCustomerSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(booking => {
    const searchString = searchTerm.toLowerCase();
    const customerName = getCustomerName(booking.customer).toLowerCase();
    const serviceId = (booking.serviceId || '').toLowerCase();
    const status = (booking.status || '').toLowerCase();
    
    return customerName.includes(searchString) ||
           serviceId.includes(searchString) ||
           status.includes(searchString);
  });

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {filteredBookings.length === 0 ? (
        <Alert severity="info">No bookings found</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id || booking._id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {getCustomerName(booking.customer)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {booking.customer?.email || 'No email'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {booking.service?.name || booking.serviceId || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {booking.serviceId || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {booking.bookingDate ? (
                      format(new Date(booking.bookingDate), 'dd MMM yyyy')
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {getCustomerStatusChip(booking.status)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Customer">
                      <IconButton
                        size="small"
                        onClick={() => onCustomerSelect(booking.customer)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

BookingsTable.propTypes = {
  bookings: PropTypes.array.isRequired,
  onCustomerSelect: PropTypes.func.isRequired,
};

export default function BookingsOverview({ bookings, onCustomerSelect }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label={`Booked (${bookings.booked?.length || 0})`} />
          <Tab label={`Reserved (${bookings.reserved?.length || 0})`} />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <BookingsTable
          bookings={bookings.booked || []}
          onCustomerSelect={onCustomerSelect}
        />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <BookingsTable
          bookings={bookings.reserved || []}
          onCustomerSelect={onCustomerSelect}
        />
      </TabPanel>
    </Box>
  );
}

BookingsOverview.propTypes = {
  bookings: PropTypes.shape({
    booked: PropTypes.array.isRequired,
    reserved: PropTypes.array.isRequired,
  }).isRequired,
  onCustomerSelect: PropTypes.func.isRequired,
};
