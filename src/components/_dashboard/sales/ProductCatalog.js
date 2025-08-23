import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
  Drawer,
  IconButton,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import ServiceCard from './ServiceCard';
import { salesService } from '../../../services/sales.service';

export default function ServiceCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [filteredServices, setFilteredServices] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    location: 'all',
    deliveryMethod: 'all',
    status: 'all',
    hasPrerequisites: false
  });

  const [locations, setLocations] = useState(['all']);
  const [deliveryMethods, setDeliveryMethods] = useState(['all']);
  const [maxPrice, setMaxPrice] = useState(1000);

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'cards', label: 'Cards' },
    { value: 'courses', label: 'Courses' },
    { value: 'tests', label: 'Tests' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  // Fetch all services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await salesService.getServices();
      setServices(data);
      
      // Extract unique locations and delivery methods
      const uniqueLocations = ['all', ...new Set(data.map(s => s.location).filter(Boolean))];
      const uniqueDeliveryMethods = ['all', ...new Set(data.map(s => s.deliveryMethod).filter(Boolean))];
      const highestPrice = Math.max(...data.map(s => s.price));
      
      setLocations(uniqueLocations);
      setDeliveryMethods(uniqueDeliveryMethods);
      setMaxPrice(Math.ceil(highestPrice));
      setFilters(prev => ({
        ...prev,
        priceRange: [0, Math.ceil(highestPrice)]
      }));
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to fetch services', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Apply filters
  useEffect(() => {
    let filtered = services;
    
    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(service => service.category === category);
    }
    
    // Search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(lowercaseQuery) ||
        service.description?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Price range filter
    filtered = filtered.filter(service => 
      service.price >= filters.priceRange[0] && 
      service.price <= filters.priceRange[1]
    );
    
    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(service => service.location === filters.location);
    }
    
    // Delivery method filter
    if (filters.deliveryMethod !== 'all') {
      filtered = filtered.filter(service => service.deliveryMethod === filters.deliveryMethod);
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(service => service.status === filters.status);
    }
    
    // Prerequisites filter
    if (filters.hasPrerequisites) {
      filtered = filtered.filter(service => 
        service.prerequisites && service.prerequisites.length > 0
      );
    }
    
    setFilteredServices(filtered);
  }, [services, category, searchQuery, filters]);

  // Initial fetch
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setFilters({
      priceRange: [0, maxPrice],
      location: 'all',
      deliveryMethod: 'all',
      status: 'all',
      hasPrerequisites: false
    });
  };

  const handleAddToOrder = useCallback((service) => {
    // This will be implemented in the next phase with order management
    enqueueSnackbar(`Added ${service.name} to order`, { 
      variant: 'success',
      autoHideDuration: 2000
    });
  }, [enqueueSnackbar]);

  const renderFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={isFilterDrawerOpen}
      onClose={() => setIsFilterDrawerOpen(false)}
      PaperProps={{
        sx: { width: 320, p: 3 }
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setIsFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={filters.priceRange}
            onChange={(_, value) => handleFilterChange('priceRange', value)}
            valueLabelDisplay="auto"
            min={0}
            max={maxPrice}
            valueLabelFormat={value => `$${value}`}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">${filters.priceRange[0]}</Typography>
            <Typography variant="body2">${filters.priceRange[1]}</Typography>
          </Stack>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={filters.location}
            label="Location"
            onChange={e => handleFilterChange('location', e.target.value)}
          >
            {locations.map(location => (
              <MenuItem key={location} value={location}>
                {location === 'all' ? 'All Locations' : location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Delivery Method</InputLabel>
          <Select
            value={filters.deliveryMethod}
            label="Delivery Method"
            onChange={e => handleFilterChange('deliveryMethod', e.target.value)}
          >
            {deliveryMethods.map(method => (
              <MenuItem key={method} value={method}>
                {method === 'all' ? 'All Methods' : method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasPrerequisites}
                onChange={e => handleFilterChange('hasPrerequisites', e.target.checked)}
              />
            }
            label="Has Prerequisites"
          />
        </FormGroup>

        <Button
          variant="outlined"
          onClick={handleClearFilters}
          fullWidth
        >
          Clear All Filters
        </Button>
      </Stack>
    </Drawer>
  );

  return (
    <Card>
      <CardHeader 
        title="Service Catalog" 
        subheader={`${filteredServices.length} services available`}
        action={
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setIsFilterDrawerOpen(true)}
          >
            Filters
          </Button>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name or description..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              value={category}
              onChange={handleCategoryChange}
              label="Category"
            >
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {(category !== 'all' || searchQuery || 
            filters.location !== 'all' || 
            filters.deliveryMethod !== 'all' || 
            filters.status !== 'all' ||
            filters.hasPrerequisites ||
            filters.priceRange[0] !== 0 ||
            filters.priceRange[1] !== maxPrice) && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {category !== 'all' && (
                    <Chip
                      label={`Category: ${categories.find(c => c.value === category)?.label}`}
                      onDelete={() => setCategory('all')}
                    />
                  )}
                  {searchQuery && (
                    <Chip
                      label={`Search: ${searchQuery}`}
                      onDelete={() => setSearchQuery('')}
                    />
                  )}
                  {filters.location !== 'all' && (
                    <Chip
                      label={`Location: ${filters.location}`}
                      onDelete={() => handleFilterChange('location', 'all')}
                    />
                  )}
                  {filters.deliveryMethod !== 'all' && (
                    <Chip
                      label={`Delivery: ${filters.deliveryMethod}`}
                      onDelete={() => handleFilterChange('deliveryMethod', 'all')}
                    />
                  )}
                  {filters.status !== 'all' && (
                    <Chip
                      label={`Status: ${filters.status}`}
                      onDelete={() => handleFilterChange('status', 'all')}
                    />
                  )}
                  {filters.hasPrerequisites && (
                    <Chip
                      label="Has Prerequisites"
                      onDelete={() => handleFilterChange('hasPrerequisites', false)}
                    />
                  )}
                  {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice) && (
                    <Chip
                      label={`Price: $${filters.priceRange[0]} - $${filters.priceRange[1]}`}
                      onDelete={() => handleFilterChange('priceRange', [0, maxPrice])}
                    />
                  )}
                </Stack>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredServices.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                No services found. Try adjusting your filters.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredServices.map((service) => (
                  <Grid key={service.id} item xs={12} sm={6} md={4}>
                    <ServiceCard 
                      service={service}
                      onAddToOrder={handleAddToOrder}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardContent>
      {renderFilterDrawer()}
    </Card>
  );
}
