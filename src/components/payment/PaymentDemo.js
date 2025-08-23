import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import PaymentIcon from './PaymentIcon';
import PaymentSecurityNotice from '../checkout/payment/PaymentSecurityNotice';
import { 
  PAYMENT_METHODS, 
  CARD_BRANDS, 
  getImplementedPaymentMethods,
  getComingSoonPaymentMethods
} from '../../utils/paymentMethods';

/**
 * Demo component to showcase the payment system improvements
 */
const PaymentDemo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSize, setSelectedSize] = useState(32);
  const [showLabels, setShowLabels] = useState(true);
  const [useSpriteSheet, setUseSpriteSheet] = useState(true);
  
  // Get implemented and coming soon payment methods
  const implementedMethods = getImplementedPaymentMethods();
  const comingSoonMethods = getComingSoonPaymentMethods();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment System Components
      </Typography>
      <Typography variant="body1" paragraph>
        This demo showcases the improved payment system components with sprite sheet support and optimized loading.
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Payment Icons" />
        <Tab label="Card Brands" />
        <Tab label="Security Notice" />
      </Tabs>
      
      {activeTab === 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Icon Size</InputLabel>
              <Select
                value={selectedSize}
                label="Icon Size"
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <MenuItem value={24}>Small (24px)</MenuItem>
                <MenuItem value={32}>Medium (32px)</MenuItem>
                <MenuItem value={48}>Large (48px)</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant={showLabels ? "contained" : "outlined"} 
              color="primary"
              size="small"
              onClick={() => setShowLabels(!showLabels)}
            >
              {showLabels ? "Hide Labels" : "Show Labels"}
            </Button>
            
            <Button 
              variant={useSpriteSheet ? "contained" : "outlined"} 
              color="secondary"
              size="small"
              onClick={() => setUseSpriteSheet(!useSpriteSheet)}
            >
              {useSpriteSheet ? "Using Sprite Sheet" : "Using Individual Icons"}
            </Button>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Implemented Payment Methods
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {implementedMethods.map((method) => (
              <Grid item key={method.id} xs={6} sm={4} md={3} lg={2}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <PaymentIcon
                    icon={method.icon}
                    name={method.name}
                    height={selectedSize}
                    spriteId={useSpriteSheet ? method.spriteId : null}
                    showTooltip={true}
                    sx={{ mb: 1 }}
                  />
                  {showLabels && (
                    <Typography variant="caption" align="center">
                      {method.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Coming Soon Payment Methods
          </Typography>
          
          <Grid container spacing={2}>
            {comingSoonMethods.map((method) => (
              <Grid item key={method.id} xs={6} sm={4} md={3} lg={2}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  height: '100%',
                  position: 'relative',
                  opacity: 0.7
                }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 5, 
                      right: 5, 
                      bgcolor: 'info.main',
                      color: 'white',
                      fontSize: '0.6rem',
                      px: 0.5,
                      py: 0.2,
                      borderRadius: 0.5
                    }}
                  >
                    SOON
                  </Box>
                  <PaymentIcon
                    icon={method.icon}
                    name={method.name}
                    height={selectedSize}
                    spriteId={useSpriteSheet ? method.spriteId : null}
                    showTooltip={true}
                    sx={{ mb: 1 }}
                  />
                  {showLabels && (
                    <Typography variant="caption" align="center">
                      {method.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Supported Card Brands
          </Typography>
          
          <Grid container spacing={2}>
            {CARD_BRANDS.map((brand) => (
              <Grid item key={brand.id} xs={6} sm={4} md={3} lg={2}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  height: '100%'
                }}>
                  <PaymentIcon
                    icon={brand.icon}
                    name={brand.name}
                    height={selectedSize}
                    spriteId={useSpriteSheet ? brand.spriteId : null}
                    showTooltip={true}
                    sx={{ mb: 1 }}
                  />
                  {showLabels && (
                    <Typography variant="caption" align="center">
                      {brand.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Security Notice Component
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setUseSpriteSheet(!useSpriteSheet)}
            >
              {useSpriteSheet ? "Using Sprite Sheet" : "Using Individual Icons"}
            </Button>
          </Box>
          
          <PaymentSecurityNotice showComingSoon={true} />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Compact Mode
          </Typography>
          
          <PaymentSecurityNotice compact={true} showComingSoon={false} />
        </Paper>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        This demo showcases the improved payment system with sprite sheet support, lazy loading, and consistent styling.
        The payment icons are now loaded more efficiently, with proper error handling and fallback options.
      </Typography>
    </Box>
  );
};

export default PaymentDemo;
