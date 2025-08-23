import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Typography,
  Stack,
  Button,
  Chip,
  Tooltip,
  Box
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';

ServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    validityPeriod: PropTypes.string,
    prerequisites: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string,
    duration: PropTypes.string,
    deliveryMethod: PropTypes.string,
    startDate: PropTypes.string
  }).isRequired,
  onAddToOrder: PropTypes.func
};

export default function ServiceCard({ service, onAddToOrder }) {
  const { 
    name, 
    price, 
    category, 
    status, 
    description,
    validityPeriod,
    prerequisites,
    location,
    duration,
    deliveryMethod,
    // startDate
  } = service;

  const handleAddToOrder = () => {
    if (onAddToOrder) {
      onAddToOrder(service);
    } else {
      console.log('Adding to order:', service);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cards':
        return <Chip size="small" color="info" label="Card" />;
      case 'courses':
        return <Chip size="small" color="primary" label="Course" />;
      case 'tests':
        return <Chip size="small" color="secondary" label="Test" />;
      default:
        return <Chip size="small" color="default" label={category} />;
    }
  };

  return (
    <Card>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
          {getCategoryIcon(category)}
        </Stack>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {description}
          </Typography>
        )}

        <Stack spacing={1}>
          {validityPeriod && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <EventIcon fontSize="small" color="action" />
              <Typography variant="body2">Valid for {validityPeriod}</Typography>
            </Stack>
          )}

          {location && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2">{location}</Typography>
            </Stack>
          )}

          {(duration || deliveryMethod) && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <SchoolIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {duration && `${duration} • `}{deliveryMethod}
              </Typography>
            </Stack>
          )}

          {prerequisites && prerequisites.length > 0 && (
            <Tooltip title={prerequisites.join(', ')} arrow>
              <Box>
                <Typography variant="body2" color="warning.main">
                  Prerequisites required
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.5}>
            <Typography variant="subtitle1">${price.toFixed(2)}</Typography>
            {status && (
              <Chip
                label={status}
                size="small"
                color={getStatusColor(status)}
                sx={{ ml: 1 }}
              />
            )}
          </Stack>
          <Tooltip title={
            prerequisites && prerequisites.length > 0 
              ? "Check prerequisites before ordering" 
              : "Add to order"
          }>
            <span>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddToOrder}
                startIcon={<AddShoppingCartIcon />}
              >
                Add
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
