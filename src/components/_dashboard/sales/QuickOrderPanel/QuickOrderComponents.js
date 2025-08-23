import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Drawer,
  Stack,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Autocomplete,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

/**
 * SearchBar component for searching services
 */
export const SearchBar = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [recentSearches] = useState(['card renewal', 'training course', 'qualification test']);

  const handleInputChange = (_, newInputValue) => {
    setInputValue(newInputValue);
    // Trigger search as user types
    onSearch(newInputValue);
  };

  const handleChange = (_, newValue) => {
    if (newValue) {
      setInputValue(newValue);
      onSearch(newValue);
    }
  };

  // This is now only needed for clearing the search
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setInputValue('');
      onSearch('');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '100%', md: '100%' } }}>
      <Autocomplete
        freeSolo
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        options={recentSearches}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search services..."
            variant="outlined"
            size="small"
            fullWidth
            onKeyDown={handleKeyDown}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {inputValue && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setInputValue('');
                          onSearch('');
                        }}
                        edge="end"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )}
                </>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&:hover': {
                  boxShadow: 1
                },
                transition: 'box-shadow 0.3s ease'
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              {option}
            </Box>
          </li>
        )}
      />
    </Box>
  );
};

/**
 * FilterDrawer component for advanced filtering
 */
export const FilterDrawer = ({ 
  open, 
  onClose, 
  advancedFilters, 
  setAdvancedFilters, 
  serviceMetadata 
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 320, p: 3 } }}
    >
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Advanced Filters</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <FormControl fullWidth>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={advancedFilters.priceRange}
            onChange={(_, value) => setAdvancedFilters(prev => ({ ...prev, priceRange: value }))}
            valueLabelDisplay="auto"
            min={0}
            max={serviceMetadata.maxPrice || 1000}
            valueLabelFormat={value => `£${value}`}
          />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={advancedFilters.location}
            onChange={e => setAdvancedFilters(prev => ({ ...prev, location: e.target.value }))}
            label="Location"
          >
            {(serviceMetadata.locations || ['all']).map(location => (
              <MenuItem key={location} value={location}>
                {location === 'all' ? 'All Locations' : location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Delivery Method</InputLabel>
          <Select
            value={advancedFilters.deliveryMethod}
            onChange={e => setAdvancedFilters(prev => ({ ...prev, deliveryMethod: e.target.value }))}
            label="Delivery Method"
          >
            {(serviceMetadata.deliveryMethods || ['all']).map(method => (
              <MenuItem key={method} value={method}>
                {method === 'all' ? 'All Methods' : method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={advancedFilters.hasPrerequisites}
              onChange={e => setAdvancedFilters(prev => ({ ...prev, hasPrerequisites: e.target.checked }))}
            />
          }
          label="Has Prerequisites"
        />

        <Button 
          variant="outlined" 
          onClick={() => setAdvancedFilters({
            priceRange: [0, serviceMetadata.maxPrice || 1000],
            location: 'all',
            deliveryMethod: 'all',
            status: 'active',
            hasPrerequisites: false,
            rating: 0
          })}
        >
          Clear Filters
        </Button>
      </Stack>
    </Drawer>
  );
};

/**
 * StatusChip component for displaying status
 */
export const StatusChip = ({ status, label }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
      case 'in_progress':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={label || status} 
      color={getStatusColor(status)} 
      size="small" 
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

/**
 * ContentSkeleton component for loading states
 */
export const ContentSkeleton = () => (
  <Stack spacing={2}>
    <Skeleton variant="rectangular" height={60} />
    <Skeleton variant="rectangular" height={40} />
    <Skeleton variant="rectangular" height={40} />
    <Stack direction="row" spacing={2}>
      <Skeleton variant="rectangular" width={100} height={40} />
      <Skeleton variant="rectangular" width={100} height={40} />
    </Stack>
  </Stack>
);

/**
 * StepTransition component for step animations
 */
export const StepTransition = ({ children, index, activeStep }) => (
  <Box
    sx={{
      display: activeStep === index ? 'block' : 'none',
      opacity: activeStep === index ? 1 : 0,
      transition: 'opacity 300ms ease-in-out'
    }}
  >
    {children}
  </Box>
);