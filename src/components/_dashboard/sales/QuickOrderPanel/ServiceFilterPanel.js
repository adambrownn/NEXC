import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Stack,
  Chip,
  Drawer,
  IconButton
} from '@mui/material';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';

/**
 * Component for advanced filtering of services
 */
const ServiceFilterPanel = ({
  open,
  onClose,
  advancedFilters,
  setAdvancedFilters,
  serviceMetadata,
  activeCategory,
  setActiveCategory
}) => {
  // Local state for filter presets
  const [filterPresets] = useState([
    { 
      name: 'Popular Cards', 
      filters: { 
        priceRange: [0, 100], 
        category: 'cards', 
        status: 'active' 
      } 
    },
    { 
      name: 'Premium Courses', 
      filters: { 
        priceRange: [100, 500], 
        category: 'courses', 
        status: 'active' 
      } 
    },
    { 
      name: 'All Tests', 
      filters: { 
        category: 'tests', 
        status: 'active' 
      } 
    }
  ]);

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    
    if (activeCategory !== 'all') count++;
    if (advancedFilters.priceRange[0] > 0 || 
        advancedFilters.priceRange[1] < serviceMetadata.maxPrice) count++;
    if (advancedFilters.location !== 'all') count++;
    if (advancedFilters.deliveryMethod !== 'all') count++;
    if (advancedFilters.status !== 'active') count++;
    if (advancedFilters.hasPrerequisites) count++;
    
    return count;
  };
  
  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setAdvancedFilters({
      ...advancedFilters,
      priceRange: newValue
    });
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setAdvancedFilters({
      ...advancedFilters,
      [field]: value
    });
  };
  
  // Apply filter preset
  const applyPreset = (preset) => {
    const newFilters = { ...advancedFilters };
    
    if (preset.filters.priceRange) {
      newFilters.priceRange = preset.filters.priceRange;
    }
    
    if (preset.filters.status) {
      newFilters.status = preset.filters.status;
    }
    
    if (preset.filters.location) {
      newFilters.location = preset.filters.location;
    }
    
    if (preset.filters.deliveryMethod) {
      newFilters.deliveryMethod = preset.filters.deliveryMethod;
    }
    
    if (preset.filters.hasPrerequisites !== undefined) {
      newFilters.hasPrerequisites = preset.filters.hasPrerequisites;
    }
    
    setAdvancedFilters(newFilters);
    
    if (preset.filters.category) {
      setActiveCategory(preset.filters.category);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setAdvancedFilters({
      priceRange: [0, serviceMetadata.maxPrice],
      location: 'all',
      deliveryMethod: 'all',
      status: 'active',
      hasPrerequisites: false
    });
    setActiveCategory('all');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 3 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="div">
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filter Services
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Active filters summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Active Filters: {countActiveFilters()}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeCategory !== 'all' && (
            <Chip 
              label={`Category: ${activeCategory}`}
              onDelete={() => setActiveCategory('all')}
              color="primary"
              size="small"
            />
          )}
          
          {(advancedFilters.priceRange[0] > 0 || 
           advancedFilters.priceRange[1] < serviceMetadata.maxPrice) && (
            <Chip 
              label={`Price: £${advancedFilters.priceRange[0]} - £${advancedFilters.priceRange[1]}`}
              onDelete={() => handlePriceChange(null, [0, serviceMetadata.maxPrice])}
              color="primary"
              size="small"
            />
          )}
          
          {advancedFilters.location !== 'all' && (
            <Chip 
              label={`Location: ${advancedFilters.location}`}
              onDelete={() => handleFilterChange('location', 'all')}
              color="primary"
              size="small"
            />
          )}
          
          {advancedFilters.deliveryMethod !== 'all' && (
            <Chip 
              label={`Delivery: ${advancedFilters.deliveryMethod}`}
              onDelete={() => handleFilterChange('deliveryMethod', 'all')}
              color="primary"
              size="small"
            />
          )}
          
          {advancedFilters.status !== 'active' && (
            <Chip 
              label={`Status: ${advancedFilters.status}`}
              onDelete={() => handleFilterChange('status', 'active')}
              color="primary"
              size="small"
            />
          )}
          
          {advancedFilters.hasPrerequisites && (
            <Chip 
              label="Has Prerequisites"
              onDelete={() => handleFilterChange('hasPrerequisites', false)}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Box>
      
      {/* Filter presets */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Filter Presets
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {filterPresets.map((preset, index) => (
            <Chip
              key={index}
              label={preset.name}
              onClick={() => applyPreset(preset)}
              icon={<BookmarkIcon fontSize="small" />}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Price Range Slider */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Price Range (£)
        </Typography>
        <Slider
          value={advancedFilters.priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={serviceMetadata.maxPrice}
          marks={[
            { value: 0, label: '£0' },
            { value: serviceMetadata.maxPrice, label: `£${serviceMetadata.maxPrice}` }
          ]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            £{advancedFilters.priceRange[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            £{advancedFilters.priceRange[1]}
          </Typography>
        </Box>
      </Box>

      {/* Location Filter */}
      <FormControl fullWidth sx={{ mb: 3 }} size="small">
        <InputLabel>Location</InputLabel>
        <Select
          value={advancedFilters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          label="Location"
        >
          <MenuItem value="all">All Locations</MenuItem>
          {serviceMetadata.locations?.map((location) => (
            <MenuItem key={location} value={location}>
              {location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Delivery Method Filter */}
      <FormControl fullWidth sx={{ mb: 3 }} size="small">
        <InputLabel>Delivery Method</InputLabel>
        <Select
          value={advancedFilters.deliveryMethod}
          onChange={(e) => handleFilterChange('deliveryMethod', e.target.value)}
          label="Delivery Method"
        >
          <MenuItem value="all">All Methods</MenuItem>
          {serviceMetadata.deliveryMethods?.map((method) => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status Filter */}
      <FormControl fullWidth sx={{ mb: 3 }} size="small">
        <InputLabel>Status</InputLabel>
        <Select
          value={advancedFilters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          label="Status"
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>

      {/* Prerequisites Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={advancedFilters.hasPrerequisites}
            onChange={(e) => handleFilterChange('hasPrerequisites', e.target.checked)}
          />
        }
        label="Has Prerequisites"
        sx={{ mb: 3 }}
      />
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Reset Button */}
      <Button
        variant="outlined"
        startIcon={<RestartAltIcon />}
        onClick={resetFilters}
        fullWidth
        sx={{ mb: 2 }}
      >
        Reset All Filters
      </Button>
      
      <Button
        variant="contained"
        onClick={onClose}
        fullWidth
      >
        Apply Filters
      </Button>
    </Drawer>
  );
};

export default ServiceFilterPanel;