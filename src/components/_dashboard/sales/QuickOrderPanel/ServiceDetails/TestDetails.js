import React, { useState, useCallback } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormHelperText,
  FormControlLabel,
  Switch
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import axiosInstance from '../../../../../axiosConfig';
import { calculateDistance } from '../../../../../utils/mapUtils';


/**
 * Component for rendering test service details form
 * Updated to integrate test center selection functionality
 */
  const TestDetails = ({ service, details, onUpdate }) => {
  const serviceId = service._id || service.id;
  const testDetails = details?.testDetails || {};
  
  // State for test center selection
  const [showCenterDialog, setShowCenterDialog] = useState(false);
  const [postCode, setPostCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [nearestCenters, setNearestCenters] = useState([]);
  const [error, setError] = useState('');
  const radius = 50; // Default radius in miles
  
  // State for optional field toggles
  const [showCitbTestId, setShowCitbTestId] = useState(!!testDetails.citbTestId);
  const [showVoiceover, setShowVoiceover] = useState(!!testDetails.voiceover);
  const [showAccommodations, setShowAccommodations] = useState(!!testDetails.accommodations);
  const [showCandidateNumber, setShowCandidateNumber] = useState(!!testDetails.candidateNumber);

  const handleUpdate = (updatedTestDetails) => {
    onUpdate(serviceId, {
      ...details,
      testDetails: {
        ...testDetails,
        ...updatedTestDetails
      }
    });
  };

  // Fetch test centers
  const fetchCenters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const resp = await axiosInstance.get("/centers");
      
      if (resp.data?.success && Array.isArray(resp.data.data)) {
        setCenters(resp.data.data);
        return resp.data.data;
      }
      
      setError("Invalid data format received from server");
      return null;
    } catch (error) {
      console.error("Error fetching centers:", error);
      setError("Failed to fetch centers. Please try again later.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search for centers near a postcode
  const handlePostcodeSearch = useCallback(async () => {
    if (!postCode) {
      setError("Please enter a postcode");
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch centers if not already loaded
      const availableCenters = centers.length > 0 ? centers : await fetchCenters();
      if (!availableCenters) return;
      
      // Get coordinates for the postcode
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${postCode}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibmV4Y21hcCIsImEiOiJjbTY5N3Q4OTgwODduMmxzY2s5aDA0bXp1In0.wnyDsAjgVJw794zpvWf93g'}&country=gb&types=postcode`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        // Calculate distance to each center
        const centersWithDistance = availableCenters
          .map(center => {
            const centerLat = center.geoLocation?.coordinates?.[1] ?? center.latitude;
            const centerLng = center.geoLocation?.coordinates?.[0] ?? center.longitude;
            
            if (!centerLat || !centerLng) return null;
            
            return {
              ...center,
              distance: calculateDistance(
                lat,
                lng,
                centerLat,
                centerLng
              )
            };
          })
          .filter(item => item && item.distance <= radius)
          .sort((a, b) => a.distance - b.distance);
        
        setNearestCenters(centersWithDistance);
        
        if (centersWithDistance.length === 0) {
          setError(`No test centers found within ${radius} miles of the provided postcode.`);
        }
      } else {
        setError("Invalid postcode. Please enter a valid UK postcode.");
      }
    } catch (error) {
      console.error("Error searching by postcode:", error);
      setError("Failed to search by postcode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [postCode, centers, radius, fetchCenters]);

  // Select a test center
  const handleSelectCenter = (center) => {
    handleUpdate({ 
      testCentre: center.title,
      testCentreId: center._id,
      testCentreAddress: center.address,
      testCentrePostcode: center.postcode
    });
    setShowCenterDialog(false);
  };

  // Open center selection dialog
  const handleOpenCenterDialog = () => {
    setShowCenterDialog(true);
    if (centers.length === 0) {
      fetchCenters();
    }
  };

  // Close center selection dialog
  const handleCloseCenterDialog = () => {
    setShowCenterDialog(false);
  };

  // Format center address for display
  const formatCenterAddress = (center) => {
    return `${center.address || ''}, ${center.postcode || ''}`.trim();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Typography variant="subtitle2" gutterBottom>
          Test Information
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showCitbTestId}
              onChange={(e) => {
                setShowCitbTestId(e.target.checked);
                if (!e.target.checked) handleUpdate({ citbTestId: '' });
              }}
              color="primary"
            />
          }
          label="Add CITB Test ID"
        />
        
        <Collapse in={showCitbTestId}>
          <TextField
            fullWidth
            label="CITB Test ID"
            value={testDetails.citbTestId || ''}
            onChange={(e) => handleUpdate({ citbTestId: e.target.value })}
          />
        </Collapse>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <DatePicker
            label="Test Date *"
            value={testDetails.testDate ? new Date(testDetails.testDate) : null}
            onChange={(date) => handleUpdate({ 
              testDate: date ? date.toISOString().split('T')[0] : '' 
            })}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required
                helperText="Date of the test"
              />
            )}
          />
          
          <TimePicker
            label="Test Time *"
            value={testDetails.testTime ? new Date(`2000-01-01T${testDetails.testTime}`) : null}
            onChange={(time) => {
              if (time) {
                const hours = time.getHours().toString().padStart(2, '0');
                const minutes = time.getMinutes().toString().padStart(2, '0');
                handleUpdate({ testTime: `${hours}:${minutes}` });
              } else {
                handleUpdate({ testTime: '' });
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required
                helperText="Time of the test"
              />
            )}
          />
        </Box>
        
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                Test Centre *
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleOpenCenterDialog}
                startIcon={<SearchIcon />}
              >
                Find Centre
              </Button>
            </Box>
            
            {testDetails.testCentre ? (
              <Box sx={{ mt: 1 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'success.lighter',
                    borderColor: 'success.light'
                  }}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">
                        {testDetails.testCentre}
                      </Typography>
                    </Box>
                    
                    {testDetails.testCentreAddress && (
                      <Typography variant="body2" color="text.secondary">
                        {testDetails.testCentreAddress}
                        {testDetails.testCentrePostcode && `, ${testDetails.testCentrePostcode}`}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Box>
            ) : (
              <TextField
                fullWidth
                label="Test Centre *"
                value={testDetails.testCentre || ''}
                onChange={(e) => handleUpdate({ testCentre: e.target.value })}
                required
                placeholder="Click 'Find Centre' to search for nearby test centers"
                helperText="Required. Use the search button to find centers near the customer"
              />
            )}
          </Stack>
        </Paper>
        
        <FormControlLabel
          control={
            <Switch
              checked={showVoiceover}
              onChange={(e) => {
                setShowVoiceover(e.target.checked);
                if (!e.target.checked) handleUpdate({ voiceover: '' });
              }}
              color="primary"
            />
          }
          label="Add Voiceover Language"
        />
        
        <Collapse in={showVoiceover}>
          <FormControl fullWidth>
            <InputLabel>Voiceover Language</InputLabel>
            <Select
              value={testDetails.voiceover || ''}
              onChange={(e) => handleUpdate({ voiceover: e.target.value })}
              label="Voiceover Language"
            >
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Welsh">Welsh</MenuItem>
              <MenuItem value="Polish">Polish</MenuItem>
              <MenuItem value="Romanian">Romanian</MenuItem>
              <MenuItem value="Russian">Russian</MenuItem>
              <MenuItem value="Lithuanian">Lithuanian</MenuItem>
              <MenuItem value="Bulgarian">Bulgarian</MenuItem>
              <MenuItem value="Portuguese">Portuguese</MenuItem>
              <MenuItem value="Hungarian">Hungarian</MenuItem>
              <MenuItem value="Punjabi">Punjabi</MenuItem>
              <MenuItem value="Urdu">Urdu</MenuItem>
              <MenuItem value="Gujarati">Gujarati</MenuItem>
            </Select>
            <FormHelperText>Language for test voiceover (if applicable)</FormHelperText>
          </FormControl>
        </Collapse>
        
        <FormControlLabel
          control={
            <Switch
              checked={showAccommodations}
              onChange={(e) => {
                setShowAccommodations(e.target.checked);
                if (!e.target.checked) handleUpdate({ accommodations: '' });
              }}
              color="primary"
            />
          }
          label="Add Special Accommodations"
        />
        
        <Collapse in={showAccommodations}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Special Accommodations"
            value={testDetails.accommodations || ''}
            onChange={(e) => handleUpdate({ accommodations: e.target.value })}
            placeholder="Any special requirements or accommodations needed"
          />
        </Collapse>
        
        <FormControlLabel
          control={
            <Switch
              checked={showCandidateNumber}
              onChange={(e) => {
                setShowCandidateNumber(e.target.checked);
                if (!e.target.checked) handleUpdate({ candidateNumber: '' });
              }}
              color="primary"
            />
          }
          label="Add Candidate Number"
        />
        
        <Collapse in={showCandidateNumber}>
          <TextField
            fullWidth
            label="Candidate Number"
            value={testDetails.candidateNumber || ''}
            onChange={(e) => handleUpdate({ candidateNumber: e.target.value })}
            helperText="If the candidate already has a number"
          />
        </Collapse>
      </Stack>
      
      {/* Test Center Selection Dialog */}
      <Dialog
        open={showCenterDialog}
        onClose={handleCloseCenterDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Find Test Centre
          <IconButton
            aria-label="close"
            onClick={handleCloseCenterDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Customer Postcode"
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                placeholder="Enter postcode to find nearby centers"
                InputProps={{
                  endAdornment: postCode && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setPostCode('')} edge="end" size="small">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={handlePostcodeSearch}
                disabled={!postCode || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                Search
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            
            <Divider />
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {nearestCenters.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Nearest Test Centres ({nearestCenters.length} found)
                    </Typography>
                    
                    <List>
                      {nearestCenters.map((center) => (
                        <ListItem
                          key={center._id}
                          button
                          onClick={() => handleSelectCenter(center)}
                          sx={{
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'action.hover',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <ListItemIcon>
                            <LocationOnIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={center.title}
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {formatCenterAddress(center)}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  component="span" 
                                  color="primary"
                                  sx={{ display: 'block', fontWeight: 'bold' }}
                                >
                                  {center.distance.toFixed(1)} miles away
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {postCode ? 'No centers found. Try a different postcode or increase the search radius.' : 'Enter a postcode to find nearby test centers.'}
                    </Typography>
                  </Box>
                )}
                
                <Collapse in={centers.length > 0 && nearestCenters.length === 0}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      All Test Centres
                    </Typography>
                    
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {centers.map((center) => (
                        <ListItem
                          key={center._id}
                          button
                          onClick={() => handleSelectCenter(center)}
                          sx={{
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1
                          }}
                        >
                          <ListItemIcon>
                            <LocationOnIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={center.title}
                            secondary={formatCenterAddress(center)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseCenterDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TestDetails;