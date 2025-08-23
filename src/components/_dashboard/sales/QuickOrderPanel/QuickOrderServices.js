import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Badge
} from '@mui/material';
import { SearchBar } from './QuickOrderComponents';
import ServiceFilterPanel from './ServiceFilterPanel';
import ServiceSelectionSummary from './ServiceSelectionSummary';

// Import icons
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

/**
 * Component for service selection and filtering in the QuickOrderPanel
 */
const QuickOrderServices = ({
  filteredServices,
  selectedServices,
  handleServiceSelect,
  serviceMetadata,
  activeCategory,
  setActiveCategory,
  setSearchQuery,
  loading,
  priceValidation,
  advancedFilters,
  setAdvancedFilters,
  handleNext
}) => {
  // Local state for UI enhancements
  const [viewMode, setViewMode] = useState('grid');
  const [previewService, setPreviewService] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Helper function to get the appropriate icon for a service category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cards':
        return <CardMembershipIcon />;
      case 'courses':
        return <SchoolIcon />;
      case 'tests':
        return <AssignmentIcon />;
      case 'qualifications':
        return <WorkspacePremiumIcon />;
      default:
        return null;
    }
  };
  
  // Helper function to get color for service category
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'cards':
        return 'info';
      case 'courses':
        return 'success';
      case 'tests':
        return 'warning';
      case 'qualifications':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // Handle view mode toggle
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Handle service preview
  const handlePreview = (event, service) => {
    event.stopPropagation();
    setPreviewService(service);
  };
  
  // Close preview dialog
  const handleClosePreview = () => {
    setPreviewService(null);
  };
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };
  
  return (
    <Box>
      {/* Top toolbar with search, view toggle, and filter button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <SearchBar onSearch={setSearchQuery} />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Tooltip title="Filter options">
            <IconButton onClick={toggleFilterPanel}>
              <Badge color="primary" variant="dot" invisible={!showFilterPanel}>
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Main content with services */}
        <Grid item xs={12} md={8} lg={9}>

          {/* Categories */}
           <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Filterlist
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                key="all"
                label="All Services"
                icon={null}
                onClick={() => {
                  setActiveCategory('all');
                  // Also reset advanced filters
                  setAdvancedFilters({
                    priceRange: [0, serviceMetadata.maxPrice],
                    location: 'all',
                    deliveryMethod: 'all',
                    status: 'all',
                    hasPrerequisites: false
                  });
                  // Reset search query if needed
                  setSearchQuery('');
                }}
                color={activeCategory === 'all' ? 'primary' : 'default'}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 1
                  }
                }}
              />
              {serviceMetadata?.categories?.filter(cat => cat !== 'all').map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  icon={getCategoryIcon(cat)}
                  onClick={() => setActiveCategory(cat)}
                  color={activeCategory === cat ? 'primary' : 'default'}
                  variant={activeCategory === cat ? 'filled' : 'outlined'}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: activeCategory === cat ? `${getCategoryColor(cat)}.main` : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                      bgcolor: activeCategory !== cat ? `${getCategoryColor(cat)}.lighter` : `${getCategoryColor(cat)}.main`
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Quick Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Quick Filters
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip 
                label="Cards" 
                variant="outlined" 
                icon={<CardMembershipIcon fontSize="small" />}
                onClick={() => {
                  setActiveCategory('cards');
                }}
                color={activeCategory === 'cards' ? 'primary' : 'default'}
              />
              <Chip 
                label="Courses" 
                variant="outlined" 
                icon={<SchoolIcon fontSize="small" />}
                onClick={() => {
                  setActiveCategory('courses');
                }}
                color={activeCategory === 'courses' ? 'primary' : 'default'}
              />
              <Chip 
                label="Tests" 
                variant="outlined" 
                icon={<AssignmentIcon fontSize="small" />}
                onClick={() => {
                  setActiveCategory('tests');
                }}
                color={activeCategory === 'tests' ? 'primary' : 'default'}
              />
              <Chip 
                label="Qualifications" 
                variant="outlined" 
                icon={<WorkspacePremiumIcon fontSize="small" />}
                onClick={() => {
                  setActiveCategory('qualifications');
                }}
                color={activeCategory === 'qualifications' ? 'primary' : 'default'}
              />
              <Chip 
                label="Reset Filters" 
                variant="outlined" 
                color="error"
                icon={<RestartAltIcon />}
                onClick={() => {
                  setAdvancedFilters({
                    priceRange: [0, serviceMetadata.maxPrice],
                    location: 'all',
                    deliveryMethod: 'all',
                    status: 'all',
                    hasPrerequisites: false
                  });
                  setActiveCategory('all');
                }}
              />
            </Stack>
          </Box>

          {!priceValidation.isValid && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {priceValidation.errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          {/* Service Grid/List View */}
          <Grid container spacing={2}>
            {!loading && filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                const isSelected = selectedServices.some(s => (s._id || s.id) === (service._id || service.id));
                const categoryColor = getCategoryColor(service.category);
                
                return (
                  <Grid 
                    item 
                    xs={12} 
                    sm={viewMode === 'grid' ? 6 : 12} 
                    md={viewMode === 'grid' ? 6 : 12} 
                    key={service._id || service.id}
                  >
                    <Paper
                      elevation={isSelected ? 3 : 1}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: viewMode === 'grid' ? 'column' : 'row',
                        alignItems: viewMode === 'list' ? 'center' : 'stretch',
                        transition: 'all 0.3s ease',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        },
                        ...(isSelected && {
                          border: '2px solid',
                          borderColor: 'primary.main',
                          bgcolor: `${categoryColor}.lighter`
                        }),
                        borderLeft: `4px solid ${categoryColor}.main`
                      }}
                      onClick={() => handleServiceSelect(service)}
                    >
                      {/* Service Icon */}
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1,
                          mr: viewMode === 'list' ? 2 : 0,
                          mb: viewMode === 'grid' ? 2 : 0,
                          borderRadius: '50%',
                          bgcolor: `${categoryColor}.lighter`,
                          color: `${categoryColor}.dark`,
                          ...(viewMode === 'grid' ? { alignSelf: 'flex-start' } : {})
                        }}
                      >
                        {getCategoryIcon(service.category)}
                      </Box>
                      
                      {/* Service Content */}
                      <Box sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        ...(viewMode === 'list' ? { ml: 2 } : {})
                      }}>
                        <Typography variant="h6">{service.title || service.name}</Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mt: 1,
                            ...(viewMode === 'grid' && {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            })
                          }}
                        >
                          {service.description}
                        </Typography>
                        
                        <Box sx={{ 
                          mt: 'auto', 
                          pt: 2, 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="h6" color={isSelected ? `${categoryColor}.dark` : 'text.primary'}>
                            £{service.price}
                          </Typography>
                          
                          <Box>
                            <Tooltip title="Quick preview">
                              <IconButton 
                                size="small" 
                                onClick={(e) => handlePreview(e, service)}
                                sx={{ mr: 1 }}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {service.category && (
                              <Chip 
                                label={service.category} 
                                size="small"
                                color={categoryColor}
                                variant={isSelected ? "filled" : "outlined"}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  {loading ? 'Loading services...' : 'No services found matching your criteria'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        
        {/* Selection Summary Sidebar */}
        <Grid item xs={12} md={4} lg={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <ServiceSelectionSummary 
            selectedServices={selectedServices}
            handleServiceSelect={handleServiceSelect}
            handleNext={handleNext}
          />
        </Grid>
      </Grid>
      
      {/* Service Preview Dialog */}
      <Dialog 
        open={!!previewService} 
        onClose={handleClosePreview}
        maxWidth="sm"
        fullWidth
      >
        {previewService && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getCategoryIcon(previewService.category)}
                {previewService.title || previewService.name}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {previewService.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Service Details:
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                  <Chip 
                    label={previewService.category} 
                    size="small"
                    color={getCategoryColor(previewService.category)}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Price:</Typography>
                  <Typography variant="body2" fontWeight="bold">£{previewService.price}</Typography>
                </Box>
                
                {previewService.deliveryMethod && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Delivery Method:</Typography>
                    <Typography variant="body2">{previewService.deliveryMethod}</Typography>
                  </Box>
                )}
                
                {previewService.location && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Location:</Typography>
                    <Typography variant="body2">{previewService.location}</Typography>
                  </Box>
                )}
                
                {previewService.duration && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Duration:</Typography>
                    <Typography variant="body2">{previewService.duration}</Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreview}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleServiceSelect(previewService);
                  handleClosePreview();
                }}
              >
                {selectedServices.some(s => (s._id || s.id) === (previewService._id || previewService.id)) 
                  ? 'Remove from Selection' 
                  : 'Add to Selection'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Filter Panel */}
      <ServiceFilterPanel
        open={showFilterPanel}
        onClose={toggleFilterPanel}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        serviceMetadata={serviceMetadata}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
    </Box>
  );
};

export default QuickOrderServices;
