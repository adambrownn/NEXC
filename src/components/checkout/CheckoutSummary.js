import React, { useContext, useMemo, useCallback } from "react";
import { CheckoutContext } from "../../pages/EcommerceCheckout";
import { useCart } from "../../contexts/CartContext";
import { format } from "date-fns";
// material
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  CardHeader,
  Typography,
  CardContent,
  Grid,
  Paper,
  Chip,
  List,
  useTheme,
  alpha
} from "@mui/material";
import { Icon } from '@iconify/react';
import arrowIosBackFill from '@iconify/icons-eva/arrow-ios-back-fill';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import calendarFill from '@iconify/icons-eva/calendar-fill';
import personFill from '@iconify/icons-eva/person-fill';
import emailFill from '@iconify/icons-eva/email-fill';
import phoneFill from '@iconify/icons-eva/phone-fill';
import pinFill from '@iconify/icons-eva/pin-fill';
import checkmarkCircleFill from '@iconify/icons-eva/checkmark-circle-2-fill';
// custom styles
import { CATEGORY_COLORS } from './styles';
// performance utils
import { logRender, measurePerformance } from '../../utils/performanceUtils';

// ----------------------------------------------------------------------

// Memoized helper components
const OrderItem = React.memo(({ item, configurations, theme }) => {
  logRender('OrderItem', { id: item._id });
  
  // Get category color
  const getCategoryColor = (type) => {
    const category = type?.toLowerCase() || '';
    // Handle both singular and plural forms
    if (category === 'card') return 'cards';
    if (category === 'test') return 'tests';
    if (category === 'course') return 'courses';
    if (category === 'qualification') return 'qualifications';
    return category;
  };
  
  // Get category icon
  const getCategoryIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'card':
      case 'cards':
        return 'mdi:card-account-details';
      case 'test':
      case 'tests':
        return 'mdi:clipboard-text';
      case 'course':
      case 'courses':
        return 'mdi:school';
      case 'qualification':
      case 'qualifications':
        return 'mdi:certificate';
      default:
        return 'mdi:package';
    }
  };
  
  // Get configuration summary for an item
  const getConfigurationSummary = useCallback((item) => {
    const config = configurations[item._id] || {};
    const summary = [];

    if (item.type === 'card' || item.type === 'cards') {
      if (config.newRenew) {
        summary.push(`${config.newRenew.charAt(0).toUpperCase() + config.newRenew.slice(1)} Card`);
      }
      if (config.cardDetails?.cardType) {
        summary.push(`Type: ${config.cardDetails.cardType}`);
      }
      if (config.trade?.name) {
        summary.push(`Trade: ${config.trade.name}`);
      }
    }

    if (item.type === 'test' || item.type === 'tests') {
      if (config.testDetails?.testDate) {
        summary.push(`Date: ${format(new Date(config.testDetails.testDate), 'dd MMM yyyy')}`);
      }
      if (config.testDetails?.testTime) {
        summary.push(`Time: ${config.testDetails.testTime}`);
      }
      if (config.testDetails?.testCentre) {
        summary.push(`Location: ${config.testDetails.testCentre}`);
      }
    }

    if (item.type === 'course' || item.type === 'courses') {
      if (config.courseDetails?.startDate) {
        summary.push(`Start: ${format(new Date(config.courseDetails.startDate), 'dd MMM yyyy')}`);
      }
      if (config.courseDetails?.location) {
        summary.push(`Location: ${config.courseDetails.location}`);
      }
    }

    if (item.type === 'qualification' || item.type === 'qualifications') {
      if (config.qualificationDetails?.level) {
        summary.push(`Level: ${config.qualificationDetails.level}`);
      }
      if (config.qualificationDetails?.trade) {
        summary.push(`Trade: ${config.qualificationDetails.trade}`);
      }
    }

    return summary;
  }, [configurations]);
  
  const category = getCategoryColor(item.type);
  const configSummary = useMemo(() => getConfigurationSummary(item), [item, getConfigurationSummary]);
  
  return (
    <Paper
      key={item._id}
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        borderLeftWidth: 4,
        borderLeftColor: CATEGORY_COLORS[category]?.main || theme.palette.divider,
        transition: 'all 0.2s',
        backgroundColor: theme.palette.background.checkout?.card || alpha(theme.palette.background.paper, 0.9),
        borderColor: alpha(theme.palette.divider, 0.5),
        '&:hover': {
          backgroundColor: alpha(CATEGORY_COLORS[category]?.light || '#f5f5f5', 0.3),
          transform: 'translateY(-2px)',
          boxShadow: theme.customShadows.z8
        }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: alpha(CATEGORY_COLORS[category]?.main || theme.palette.primary.main, 0.12),
            color: CATEGORY_COLORS[category]?.main || 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon={getCategoryIcon(item.type)} width={28} height={28} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.validity}
          </Typography>

          {configSummary.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              {configSummary.map((detail, index) => (
                <Chip
                  key={index}
                  size="small"
                  label={detail}
                  sx={{
                    color: CATEGORY_COLORS[category]?.dark || 'primary.main',
                    bgcolor: alpha(CATEGORY_COLORS[category]?.main || theme.palette.primary.main, 0.08),
                    fontWeight: 500,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: CATEGORY_COLORS[category]?.dark || 'text.primary'
          }}
        >
          £{Number(item.price).toFixed(2)}
        </Typography>
      </Stack>
    </Paper>
  );
});

// Add display name for debugging
OrderItem.displayName = 'OrderItem';

// Memoized CustomerInfo component
const CustomerInfo = React.memo(({ customer, theme }) => {
  logRender('CustomerInfo', { customerId: customer._id });
  
  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2, 
      boxShadow: theme.customShadows.z8,
      backgroundColor: theme.palette.background.checkout?.card || alpha(theme.palette.background.paper, 0.9),
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        backgroundColor: theme.palette.info.main
      }
    }}>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: 'info.main',
            display: 'flex',
            alignItems: 'center',
            '&:before': {
              content: '""',
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'info.main',
              marginRight: '8px'
            }
          }}>
            Customer Information
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={2} sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: alpha(theme.palette.divider, 0.5), 
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.4)
            }}>
              <Typography variant="h6" sx={{ 
                color: 'info.dark', 
                fontWeight: 600,
                pb: 1,
                borderBottom: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                Personal Details
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}>
                  <Icon icon={personFill} width={18} height={18} style={{ color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {customer.name}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                }}>
                  <Icon icon={emailFill} width={18} height={18} style={{ color: theme.palette.info.main }} />
                </Box>
                <Typography variant="body1">
                  {customer.email}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                }}>
                  <Icon icon={phoneFill} width={18} height={18} style={{ color: theme.palette.success.main }} />
                </Box>
                <Typography variant="body1">
                  {customer.phoneNumber}
                </Typography>
              </Stack>

              {customer.dob && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                  }}>
                    <Icon icon={calendarFill} width={18} height={18} style={{ color: theme.palette.warning.main }} />
                  </Box>
                  <Typography variant="body1">
                    {format(new Date(customer.dob), 'dd MMM yyyy')}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={2} sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: alpha(theme.palette.divider, 0.5), 
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.4)
            }}>
              <Typography variant="h6" sx={{ 
                color: 'error.dark', 
                fontWeight: 600,
                pb: 1,
                borderBottom: `1px dashed ${alpha(theme.palette.error.main, 0.2)}`
              }}>
                Address Information
              </Typography>

              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  mt: 0.5
                }}>
                  <Icon icon={pinFill} width={18} height={18} style={{ color: theme.palette.error.main }} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {customer.address}
                  </Typography>
                  <Typography variant="body1">
                    {customer.city && `${customer.city}, `}{customer.postcode}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

// Add display name for debugging
CustomerInfo.displayName = 'CustomerInfo';

// Memoized OrderSummary component
const OrderSummary = React.memo(({ items, totalAmount, handleNext, handleBack, theme }) => {
  logRender('OrderSummary', { itemCount: items.length, totalAmount });
  
  // Get category color
  const getCategoryColor = (type) => {
    const category = type?.toLowerCase() || '';
    // Handle both singular and plural forms
    if (category === 'card') return 'cards';
    if (category === 'test') return 'tests';
    if (category === 'course') return 'courses';
    if (category === 'qualification') return 'qualifications';
    return category;
  };
  
  return (
    <Card
      sx={{
        position: 'sticky',
        top: 24,
        borderRadius: 2,
        boxShadow: theme.customShadows.z12,
        transition: theme.transitions.create(['box-shadow', 'transform']),
        backgroundColor: theme.palette.background.checkout?.card || alpha(theme.palette.background.paper, 0.9),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden',
        '&:after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
        },
        '&:hover': {
          boxShadow: theme.customShadows.z24,
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardHeader
        title={
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            '&:before': {
              content: '""',
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              marginRight: '8px'
            }
          }}>
            Order Summary
          </Typography>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Items ({items.length})
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              £{totalAmount.toFixed(2)}
            </Typography>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total
            </Typography>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                £{totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mt: 1, 
              bgcolor: alpha(theme.palette.success.main, 0.08),
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`
            }}
          >
            <Stack spacing={1.5}>
              {items.map((item, index) => {
                const category = getCategoryColor(item.type);
                return (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      color: CATEGORY_COLORS[category]?.main || 'success.main',
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: alpha(CATEGORY_COLORS[category]?.main || theme.palette.success.main, 0.12),
                    }}>
                      <Icon icon={checkmarkCircleFill} width={12} height={12} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} configuration complete
                    </Typography>
                  </Stack>
                );
              })}

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ color: 'success.main' }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                }}>
                  <Icon icon={checkmarkCircleFill} width={12} height={12} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Customer information provided
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </CardContent>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 3 }}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handleNext}
          endIcon={<Icon icon={arrowIosForwardFill} />}
          sx={{
            height: 48,
            boxShadow: theme.customShadows?.primary || '0 8px 16px 0 rgba(0,171,85,0.24)',
            transition: theme.transitions.create(['transform', 'box-shadow']),
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 20px 0 rgba(0,171,85,0.3)'
            }
          }}
        >
          Proceed to Payment
        </Button>

        <Button
          fullWidth
          size="large"
          color="inherit"
          onClick={handleBack}
          startIcon={<Icon icon={arrowIosBackFill} />}
          sx={{ 
            mt: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.24)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.08)
            }
          }}
        >
          Back
        </Button>
      </Box>
    </Card>
  );
});

// Add display name for debugging
OrderSummary.displayName = 'OrderSummary';

// Main component with memoization
const CheckoutSummary = React.memo(() => {
  // Log component render in development mode
  logRender('CheckoutSummary', {});
  
  // Get checkout context for navigation
  const { handleNext, handleBack } = useContext(CheckoutContext);
  
  // Use CartContext for all cart-related operations
  const { 
    items = [], 
    customer = {}, 
    configurations = {}
  } = useCart();
  const theme = useTheme();

  // Calculate totals - memoized to prevent unnecessary recalculations
  const totalAmount = useMemo(() => {
    return measurePerformance('CheckoutSummary - Calculate Total', () => {
      return items.reduce((total, item) => (
        total + (Number(item.price) * (item.quantity || 1))
      ), 0);
    });
  }, [items]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: theme.customShadows.z8,
            backgroundColor: theme.palette.background.checkout?.card || alpha(theme.palette.background.paper, 0.9),
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              backgroundColor: theme.palette.primary.main
            },
            transition: theme.transitions.create(['box-shadow']),
            '&:hover': {
              boxShadow: theme.customShadows.z16
            }
          }}
        >
          <CardHeader
            title={
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '""',
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  marginRight: '8px'
                }
              }}>
                Order Items
              </Typography>
            }
          />

          <CardContent>
            <List disablePadding>
              {items.map((item) => (
                <OrderItem 
                  key={item._id} 
                  item={item} 
                  configurations={configurations} 
                  theme={theme}
                />
              ))}
            </List>
          </CardContent>
        </Card>

        <CustomerInfo customer={customer} theme={theme} />
      </Grid>

      <Grid item xs={12} md={4}>
        <OrderSummary 
          items={items} 
          totalAmount={totalAmount} 
          handleNext={handleNext} 
          handleBack={handleBack} 
          theme={theme}
        />
      </Grid>
    </Grid>
  );
});

// Add display name for debugging
CheckoutSummary.displayName = 'CheckoutSummary';

export default CheckoutSummary;
