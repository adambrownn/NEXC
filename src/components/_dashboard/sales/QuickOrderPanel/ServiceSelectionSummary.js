import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Component for displaying a summary of selected services
 */
const ServiceSelectionSummary = ({ 
  selectedServices, 
  handleServiceSelect,
  handleNext
}) => {
  const totalPrice = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  
  return (
    <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 16 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon fontSize="small" />
        Selection Summary
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Selected Services
          </Typography>
          <Typography variant="body2" fontWeight="medium" color={selectedServices.length > 0 ? "primary.main" : "text.secondary"}>
            {selectedServices.length} {selectedServices.length === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
        {selectedServices.length > 0 ? (
          <LinearProgress 
            variant="determinate" 
            value={100} 
            color="success"
            sx={{ height: 8, borderRadius: 4 }}
          />
        ) : (
          <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Add services to your selection
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {selectedServices.length > 0 ? (
        <List dense disablePadding>
          {selectedServices.map((service) => (
            <ListItem 
              key={service._id || service.id} 
              disableGutters
              sx={{ 
                px: 0,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                mb: 0.5
              }}
            >
              <ListItemText
                primary={service.title || service.name}
                secondary={`£${service.price}`}
                primaryTypographyProps={{
                  variant: 'body2',
                  noWrap: true,
                  sx: { maxWidth: '70%' }
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => handleServiceSelect(service)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            No services selected yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Select the services to proceed
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2">Total:</Typography>
        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
          £{totalPrice.toFixed(2)}
        </Typography>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
        Select any number of services that fit your requirements
      </Typography>
      
      <Button 
        variant="contained" 
        fullWidth 
        disabled={selectedServices.length === 0}
        onClick={handleNext}
        sx={{
          py: 1,
          fontWeight: 'bold'
        }}
      >
        {selectedServices.length > 0 
          ? `Continue with ${selectedServices.length} ${selectedServices.length === 1 ? 'Service' : 'Services'}` 
          : 'Select Services to Continue'}
      </Button>
    </Paper>
  );
};

export default ServiceSelectionSummary;