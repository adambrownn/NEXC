import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Info as InfoIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { 
  SECURE_PAYMENT_ICONS, 
  CARD_BRANDS,
  getComingSoonPaymentMethods 
} from '../../../utils/paymentMethods';
import PaymentIcon from '../../payment/PaymentIcon';
import { logRender, measurePerformance } from '../../../utils/performanceUtils';

/**
 * Payment Security Notice component
 * Displays security information and accepted payment methods
 * Includes support for sprite sheet icons and coming soon indicators
 */
const PaymentSecurityNotice = ({ compact = false, showComingSoon = true }) => {
  // Log component render in development mode
  logRender('PaymentSecurityNotice', { compact, showComingSoon });
  
  // Get theme for styling
  const theme = useTheme();
  
  // Memoize the payment icons to prevent unnecessary re-renders
  const memoizedPaymentIcons = useMemo(() => {
    return measurePerformance('PaymentSecurityNotice - Process Icons', () => {
      return SECURE_PAYMENT_ICONS.map(method => ({
        id: method.id,
        icon: method.icon,
        name: method.name,
        isComponent: method.isComponent,
        color: method.color,
        spriteId: method.id
      }));
    });
  }, []);
  
  // Memoize card brands to prevent unnecessary re-renders
  const memoizedCardBrands = useMemo(() => {
    return measurePerformance('PaymentSecurityNotice - Process Card Brands', () => {
      return CARD_BRANDS.map(brand => ({
        id: brand.id,
        icon: brand.icon,
        name: brand.name,
        spriteId: brand.spriteId
      }));
    });
  }, []);
  
  // Memoize coming soon payment methods
  const comingSoonMethods = useMemo(() => {
    if (!showComingSoon) return [];
    return getComingSoonPaymentMethods();
  }, [showComingSoon]);
  
  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 2,
          bgcolor: theme.palette.background.checkout?.card || alpha(theme.palette.background.paper, 0.9),
          boxShadow: `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 1.5,
          borderBottom: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            mr: 1.5
          }}>
            <LockIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 600 }}>
            Secure Payment Processing
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ 
          mb: 3, 
          color: 'text.secondary',
          px: 1,
          py: 1,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.background.default, 0.5)
        }}>
          Your payment is processed securely with industry-standard encryption. We accept the following payment methods:
        </Typography>
        
        {/* Security Icons */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          mb: 3, 
          justifyContent: 'center',
          p: 2,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.background.default, 0.3)
        }}>
          {memoizedPaymentIcons.map((method) => (
            <Box 
              key={method.id} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: alpha(theme.palette.background.paper, 0.8)
                }
              }}
            >
              <PaymentIcon
                icon={method.icon}
                name={method.name}
                height={36}
                isComponent={method.isComponent}
                color={method.color}
                spriteId={method.spriteId}
                showTooltip={true}
                sx={{ mb: 1 }}
              />
            </Box>
          ))}
        </Box>
        
        {/* Card Brands */}
        <Box sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.success.light, 0.1),
          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
          mb: 3
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 2, 
            color: 'success.dark', 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600
          }}>
            <VerifiedUserIcon sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
            Accepted Card Brands
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            justifyContent: 'center',
            p: 1
          }}>
            {memoizedCardBrands.map((brand) => (
              <Box 
                key={brand.id} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <PaymentIcon
                  icon={brand.icon}
                  name={brand.name}
                  height={32}
                  spriteId={brand.spriteId}
                  showTooltip={true}
                  lazyLoad={true}
                  sx={{ mb: 0.5 }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  {brand.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Coming Soon Payment Methods */}
        {showComingSoon && comingSoonMethods.length > 0 && (
          <Box sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.info.light, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
          }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 2, 
              color: 'info.dark', 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}>
              <InfoIcon sx={{ mr: 1, fontSize: 18, color: 'info.main' }} />
              Coming Soon
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3, 
              justifyContent: 'center',
              p: 1
            }}>
              {comingSoonMethods.map((method) => (
                <Box 
                  key={method.id} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    position: 'relative',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <PaymentIcon
                    icon={method.icon}
                    name={method.name}
                    height={28}
                    spriteId={method.spriteId}
                    opacity={0.7}
                    showTooltip={true}
                    sx={{ mb: 0.5 }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }}
                  >
                    {method.name}
                  </Typography>
                  <Chip 
                    label="Soon" 
                    size="small" 
                    color="info" 
                    sx={{ 
                      position: 'absolute', 
                      top: -8, 
                      right: -20, 
                      transform: 'scale(0.7)', 
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      boxShadow: `0 2px 4px 0 ${alpha(theme.palette.info.main, 0.3)}`
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {!compact && (
        <Alert
          severity="info"
          icon={<ShieldIcon />}
          sx={{ 
            mt: 3, 
            '& .MuiAlert-message': { display: 'flex', alignItems: 'center' },
            borderRadius: 2,
            boxShadow: `0 2px 8px 0 ${alpha(theme.palette.info.main, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Your payment information is protected with industry-standard encryption and security measures.
          </Typography>
        </Alert>
      )}
    </>
  );
};

PaymentSecurityNotice.propTypes = {
  compact: PropTypes.bool,
  showComingSoon: PropTypes.bool
};

// Use React.memo with a custom comparison function
// Since this component has minimal props, we can use a simple equality check
const areEqual = (prevProps, nextProps) => {
  return prevProps.compact === nextProps.compact && 
         prevProps.showComingSoon === nextProps.showComingSoon;
};

export default React.memo(PaymentSecurityNotice, areEqual);
