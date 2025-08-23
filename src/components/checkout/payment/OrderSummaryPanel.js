import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardHeader, 
  Stack, 
  Typography, 
  Paper, 
  Button,
  useTheme
} from '@mui/material';
import { Icon } from '@iconify/react';
import { logRender, measurePerformance } from '../../../utils/performanceUtils';

/**
 * Order Summary Panel component
 * Displays customer details, order items, and total amount
 */
const OrderSummaryPanel = ({ 
  customer, 
  items, 
  displayAmount, 
  isTermsAccepted, 
  processing, 
  onCompleteOrder 
}) => {
  const theme = useTheme();
  
  // Log component render in development mode
  logRender('OrderSummaryPanel', { itemsCount: items.length, displayAmount, processing });
  
  // Memoize the items list to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    // Measure performance of this calculation in development mode
    return measurePerformance('OrderSummaryPanel - Process Items', () => {
      return items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price).toFixed(2),
        quantity: item.quantity || 1
      }));
    });
  }, [items]); // Only recalculate when items array changes

  return (
    <Card
      sx={{
        p: 3,
        position: 'sticky',
        top: 24,
        borderRadius: 2,
        boxShadow: theme.customShadows.z12,
        transition: theme.transitions.create(['box-shadow', 'transform']),
        '&:hover': {
          boxShadow: theme.customShadows.z24,
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Order Summary
          </Typography>
        }
      />

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Customer Details
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.neutral'
            }}
          >
            <Typography variant="body1">{customer?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{customer?.email}</Typography>
          </Paper>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Order Items ({items.length})
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            {memoizedItems.map((item, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
                sx={{
                  mb: index < items.length - 1 ? 2 : 0,
                  pb: index < items.length - 1 ? 2 : 0,
                  borderBottom: index < items.length - 1 ? '1px dashed' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ maxWidth: '70%' }}>
                  <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Qty: {item.quantity || 1}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  £{Number(item.price).toFixed(2)}
                </Typography>
              </Stack>
            ))}
          </Paper>
        </Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            color: 'primary.darker'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            £{displayAmount}
          </Typography>
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={!isTermsAccepted || processing}
          onClick={onCompleteOrder}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: theme.customShadows.primary,
            '&:hover': {
              boxShadow: 'none'
            }
          }}
        >
          Complete Order
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon="mdi:shield-check" width={20} height={20} style={{ marginRight: 8 }} />
            Secure checkout
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

OrderSummaryPanel.propTypes = {
  customer: PropTypes.object,
  items: PropTypes.array.isRequired,
  displayAmount: PropTypes.string.isRequired,
  isTermsAccepted: PropTypes.bool.isRequired,
  processing: PropTypes.bool.isRequired,
  onCompleteOrder: PropTypes.func.isRequired
};

// Use React.memo with a custom comparison function to determine when to re-render
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.displayAmount === nextProps.displayAmount &&
    prevProps.isTermsAccepted === nextProps.isTermsAccepted &&
    prevProps.processing === nextProps.processing &&
    prevProps.items.length === nextProps.items.length &&
    // Only check customer name and email for equality
    prevProps.customer?.name === nextProps.customer?.name &&
    prevProps.customer?.email === nextProps.customer?.email
    // Deep comparison of items would be expensive, so we rely on length
    // and assume that if the length is the same and displayAmount is the same,
    // the items are effectively the same for rendering purposes
  );
};

export default React.memo(OrderSummaryPanel, areEqual);
