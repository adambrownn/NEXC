import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    FormHelperText,
    Paper,
    Box,
    Grid,
    Divider,
    Switch,
    FormControlLabel,
    Collapse,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, format } from 'date-fns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import mapboxgl from 'mapbox-gl';
import axiosInstance from '../../../axiosConfig';
import { calculateDistance } from '../../../utils/mapUtils';

const TestConfigurationForm = ({ service, details, onUpdate }) => {
    const testDetails = details?.testDetails || {};

    // State for special accommodations
    const [needsAccommodations, setNeedsAccommodations] = useState(!!testDetails.specialAccommodations);
    const [needsBsl, setNeedsBsl] = useState(!!testDetails.bslRequired);
    const [needsVoiceover, setNeedsVoiceover] = useState(!!testDetails.voiceover);
    const [showCitbTestId, setShowCitbTestId] = useState(!!testDetails.citbTestId);
    
    // State for test center search
    const [postcode, setPostcode] = useState('');
    const [isSearchingCenters, setIsSearchingCenters] = useState(false);
    const [testCenters, setTestCenters] = useState([]);
    const [centers, setCenters] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [nearestCenters, setNearestCenters] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState('');
    const [selectedCenter, setSelectedCenter] = useState(testDetails.testCentre || null);
    const radius = 50; // Default radius in miles
    
    // State for custom time selection
    const [useCustomTime, setUseCustomTime] = useState(!!testDetails.customTime);
    
    // State for employment status and ethnicity
    const [employmentStatus, setEmploymentStatus] = useState(testDetails.employmentStatus || '');
    const [ethnicity, setEthnicity] = useState(testDetails.ethnicity || '');
    
    // Initialize Mapbox and fetch test centers
    useEffect(() => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibmV4Y21hcCIsImEiOiJjbTY5N3Q4OTgwODduMmxzY2s5aDA0bXp1In0.wnyDsAjgVJw794zpvWf93g';
        // Fetch test centers on component mount
        fetchCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handler for updating test details
    const handleUpdate = (updatedDetails) => {
        onUpdate({
            testDetails: {
                ...testDetails,
                ...updatedDetails
            }
        });
    };

    // Fetch test centers from API
    const fetchCenters = useCallback(async () => {
        try {
            setIsSearchingCenters(true);
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
            setIsSearchingCenters(false);
        }
    }, []);

    // Search for test centers by postcode
    const searchTestCentersByPostcode = useCallback(async () => {
        if (!postcode) {
            setError("Please enter a postcode");
            return;
        }
        
        try {
            setIsSearchingCenters(true);
            setError('');
            
            // Fetch centers if not already loaded
            const availableCenters = centers.length > 0 ? centers : await fetchCenters();
            if (!availableCenters) return;
            
            // Get coordinates for the postcode
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=${mapboxgl.accessToken}&country=gb&types=postcode`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                // eslint-disable-next-line no-unused-vars
                const [lng, lat] = data.features[0].center;
                
                // Calculate distance to each center
                const centersWithDistance = availableCenters
                    .map(center => {
                        const centerLat = center.geoLocation?.coordinates?.[1] ?? center.latitude;
                        const centerLng = center.geoLocation?.coordinates?.[0] ?? center.longitude;
                        
                        if (!centerLat || !centerLng) return null;
                        
                        return {
                            ...center,
                            distance: calculateDistance(lat, lng, centerLat, centerLng)
                        };
                    })
                    .filter(item => item && item.distance <= radius)
                    .sort((a, b) => a.distance - b.distance);
                
                setNearestCenters(centersWithDistance);
                setTestCenters(centersWithDistance.map(center => ({
                    id: center._id,
                    name: center.title,
                    address: center.address,
                    postcode: center.postcode,
                    availability: center.availability || 'Medium',
                    distance: `${center.distance.toFixed(1)} miles`
                })));
                
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
            setIsSearchingCenters(false);
        }
    }, [postcode, centers, radius, fetchCenters]);
    
    // Select a test center
    const handleSelectCenter = (center) => {
        setSelectedCenter(center);
        setTestCenters([]); // Clear the search results after selection
        handleUpdate({ 
            testCentre: center.id,
            testCentreName: center.name,
            testCentreAddress: center.address,
            testCentrePostcode: center.postcode
        });
    };

    // Get available time slots
    const getTimeSlots = () => {
        return [
            { value: '08:30', label: 'Morning - 08:30 AM' },
            { value: '09:00', label: 'Morning - 09:00 AM' },
            { value: '09:30', label: 'Morning - 09:30 AM' },
            { value: '10:00', label: 'Morning - 10:00 AM' },
            { value: '10:30', label: 'Morning - 10:30 AM' },
            { value: '11:00', label: 'Morning - 11:00 AM' },
            { value: '11:30', label: 'Morning - 11:30 AM' },
            { value: '12:00', label: 'Midday - 12:00 PM' },
            { value: '12:30', label: 'Midday - 12:30 PM' },
            { value: '13:00', label: 'Afternoon - 01:00 PM' },
            { value: '13:30', label: 'Afternoon - 01:30 PM' },
            { value: '14:00', label: 'Afternoon - 02:00 PM' },
            { value: '14:30', label: 'Afternoon - 02:30 PM' },
            { value: '15:00', label: 'Afternoon - 03:00 PM' },
            { value: '15:30', label: 'Afternoon - 03:30 PM' },
            { value: '16:00', label: 'Afternoon - 04:00 PM' },
            { value: '16:30', label: 'Afternoon - 04:30 PM' },
            { value: '17:00', label: 'Evening - 05:00 PM' },
        ];
    };

    // Get earliest available date (5 days from now)
    const getEarliestDate = () => addDays(new Date(), 5);

    // Get language options for voiceover
    const getLanguageOptions = () => {
        return [
            { value: 'english', label: 'English' },
            { value: 'welsh', label: 'Welsh' },
            { value: 'german', label: 'German' },
            { value: 'lithuanian', label: 'Lithuanian' },
            { value: 'polish', label: 'Polish' },
            { value: 'portuguese', label: 'Portuguese' },
            { value: 'punjabi', label: 'Punjabi' },
            { value: 'romanian', label: 'Romanian' },
            { value: 'russian', label: 'Russian' },
            { value: 'bulgarian', label: 'Bulgarian' },
            { value: 'czech', label: 'Czech' },
            { value: 'hungarian', label: 'Hungarian' },
            { value: 'french', label: 'French' },
            { value: 'spanish', label: 'Spanish' }
        ];
    };
    
    // Get employment status options
    const getEmploymentStatusOptions = () => {
        return [
            { value: 'employed', label: 'Employed' },
            { value: 'self-employed', label: 'Self-Employed' },
            { value: 'unemployed', label: 'Unemployed' }
        ];
    };
    
    // Get ethnicity options
    const getEthnicityOptions = () => {
        return [
            { value: 'white-british', label: 'White British' },
            { value: 'irish', label: 'Irish' },
            { value: 'white-other', label: 'White Other' },
            { value: 'mixed-caribbean', label: 'Mixed (White or Black) Caribbean' },
            { value: 'mixed-african', label: 'Mixed (White or Black) African' },
            { value: 'mixed-asian', label: 'Mixed White and Asian' },
            { value: 'mixed-other', label: 'Mixed Other' },
            { value: 'asian-british', label: 'Asian (British)' },
            { value: 'indian', label: 'Indian' },
            { value: 'pakistani', label: 'Pakistani' },
            { value: 'bangladeshi', label: 'Bangladeshi' },
            { value: 'asian-other', label: 'Asian Other' }
        ];
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
                <Typography variant="subtitle2" gutterBottom>
                    Test Booking Details
                </Typography>

                {/* Test center search and selection */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Find Test Centers Near You
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={8}>
                            <TextField
                                fullWidth
                                label="Your Postcode"
                                value={postcode}
                                onChange={(e) => setPostcode(e.target.value)}
                                placeholder="Enter postcode to find nearby centers"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                onClick={searchTestCentersByPostcode}
                                disabled={isSearchingCenters || !postcode.trim()}
                                sx={{ height: '100%' }}
                                fullWidth
                                startIcon={isSearchingCenters ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                            >
                                {isSearchingCenters ? 'Searching...' : 'Find'}
                            </Button>
                        </Grid>
                    </Grid>
                    
                    {testCenters.length > 0 ? (
                        <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            {testCenters.map((center) => (
                                <ListItem 
                                    key={center.id} 
                                    button 
                                    selected={selectedCenter?.id === center.id}
                                    onClick={() => handleSelectCenter(center)}
                                    sx={{
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.lighter',
                                        },
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <LocationOnIcon color={center.availability === 'High' ? 'success' : center.availability === 'Medium' ? 'warning' : 'error'} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2">{center.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{center.distance}</Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">{center.address}</Typography>
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: center.availability === 'High' ? 'success.main' : center.availability === 'Medium' ? 'warning.main' : 'error.main',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Availability: {center.availability}
                                                    </Typography>
                                                </Box>
                                            </>
                                        }
                                    />
                                    {selectedCenter?.id === center.id && (
                                        <CheckCircleIcon color="primary" sx={{ ml: 1 }} />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        selectedCenter ? (
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <LocationOnIcon sx={{ mt: 0.5, mr: 1, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="subtitle2">{testDetails.testCentreName || selectedCenter.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{testDetails.testCentreAddress || selectedCenter.address}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Please search for a test center using your postcode above.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    No test centers are available until you search by postcode.
                                </Typography>
                            </Paper>
                        )
                    )}
                </Paper>

                {/* Date selection */}
                <Box>
                    <DatePicker
                        label="Test Date"
                        value={testDetails.testDate ? new Date(testDetails.testDate) : null}
                        onChange={(date) => handleUpdate({ testDate: date ? date.toISOString() : null })}
                        minDate={getEarliestDate()}
                        format="dd/MM/yyyy"
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required: true,
                                helperText: "Select a preferred test date (DD/MM/YYYY)"
                            }
                        }}
                    />
                </Box>

                {/* Time selection */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={useCustomTime}
                            onChange={(e) => {
                                setUseCustomTime(e.target.checked);
                                if (!e.target.checked) handleUpdate({ customTime: null });
                            }}
                            color="primary"
                        />
                    }
                    label="I need a specific time"
                />
                
                {useCustomTime ? (
                    <TimePicker
                        label="Custom Test Time"
                        value={testDetails.customTime ? new Date(`2000-01-01T${testDetails.customTime}`) : null}
                        onChange={(time) => {
                            if (time) {
                                // Round to nearest 15 minutes
                                const minutes = time.getMinutes();
                                const roundedMinutes = Math.round(minutes / 15) * 15;
                                const newTime = new Date(time);
                                newTime.setMinutes(roundedMinutes % 60);
                                if (roundedMinutes === 60) {
                                    newTime.setHours(newTime.getHours() + 1);
                                }
                                
                                const timeString = format(newTime, 'HH:mm');
                                handleUpdate({ customTime: timeString, testTime: null });
                            } else {
                                handleUpdate({ customTime: null });
                            }
                        }}
                        minutesStep={15}
                        ampm={false}
                        views={['hours', 'minutes']}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                helperText: "Select your preferred exact time (15-minute intervals)"
                            },
                            minuteSection: {
                                // Only allow 15-minute intervals
                                items: [0, 15, 30, 45].map(minute => ({ value: minute, label: String(minute).padStart(2, '0') }))
                            }
                        }}
                    />
                ) : (
                    <FormControl fullWidth required>
                        <InputLabel>Test Time</InputLabel>
                        <Select
                            value={testDetails.testTime || ''}
                            onChange={(e) => handleUpdate({ testTime: e.target.value, customTime: null })}
                            label="Test Time"
                        >
                            {getTimeSlots().map((timeOption) => (
                                <MenuItem key={timeOption.value} value={timeOption.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
                                        {timeOption.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Select your preferred time slot</FormHelperText>
                    </FormControl>
                )}

                {/* CITB Test ID */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HelpOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Previous CITB Test</Typography>
                    </Box>
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
                        label="Add CITB Testing ID"
                    />
                    
                    <Collapse in={showCitbTestId} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="CITB Testing ID"
                            value={testDetails.citbTestId || ''}
                            onChange={(e) => handleUpdate({ citbTestId: e.target.value })}
                            helperText="If previously passed a CITB Test in the past"
                        />
                    </Collapse>
                </Paper>

                <Divider />

                {/* Employment Status */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Employment Status</Typography>
                    </Box>
                    <FormControl fullWidth required>
                        <InputLabel>Current Employment Status</InputLabel>
                        <Select
                            value={employmentStatus}
                            onChange={(e) => {
                                setEmploymentStatus(e.target.value);
                                handleUpdate({ employmentStatus: e.target.value });
                            }}
                            label="Current Employment Status"
                        >
                            {getEmploymentStatusOptions().map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Required for test booking</FormHelperText>
                    </FormControl>
                </Paper>

                {/* Ethnicity */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Ethnicity</Typography>
                        <Tooltip title="This information is required as part of the test booking process" arrow>
                            <HelpOutlineIcon sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
                        </Tooltip>
                    </Box>
                    <FormControl fullWidth required>
                        <InputLabel>Ethnicity</InputLabel>
                        <Select
                            value={ethnicity}
                            onChange={(e) => {
                                setEthnicity(e.target.value);
                                handleUpdate({ ethnicity: e.target.value });
                            }}
                            label="Ethnicity"
                        >
                            {getEthnicityOptions().map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>This information is required as part of the test booking process</FormHelperText>
                    </FormControl>
                </Paper>

                <Divider />

                {/* Special accommodations */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessibilityNewIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">Special Accommodations</Typography>
                    </Box>
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={needsBsl}
                                onChange={(e) => {
                                    setNeedsBsl(e.target.checked);
                                    handleUpdate({ bslRequired: e.target.checked });
                                }}
                                color="primary"
                            />
                        }
                        label="British Sign Language (BSL) on-screen video"
                    />

                    {/* Language/voiceover options */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={needsVoiceover}
                                onChange={(e) => {
                                    setNeedsVoiceover(e.target.checked);
                                    if (!e.target.checked) handleUpdate({ voiceover: '' });
                                }}
                                color="primary"
                            />
                        }
                        label="I need voiceover in another language"
                    />

                    <Collapse in={needsVoiceover} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Voiceover Language</InputLabel>
                            <Select
                                value={testDetails.voiceover || ''}
                                onChange={(e) => handleUpdate({ voiceover: e.target.value })}
                                label="Voiceover Language"
                            >
                                {getLanguageOptions().map((lang) => (
                                    <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select your preferred language for test voiceover</FormHelperText>
                        </FormControl>
                    </Collapse>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={needsAccommodations}
                                onChange={(e) => {
                                    setNeedsAccommodations(e.target.checked);
                                    if (!e.target.checked) handleUpdate({ specialAccommodations: '' });
                                }}
                                color="primary"
                            />
                        }
                        label="I require other special accommodations"
                    />

                    <Collapse in={needsAccommodations} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Special Accommodations"
                            value={testDetails.specialAccommodations || ''}
                            onChange={(e) => handleUpdate({ specialAccommodations: e.target.value })}
                            placeholder="Please describe any special accommodations you require"
                            helperText="We'll contact you to confirm these arrangements"
                        />
                    </Collapse>
                </Paper>

                {/* Information paper */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter', borderColor: 'info.light' }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <InfoOutlinedIcon color="info" sx={{ mt: 0.5 }} />
                        <Stack>
                            <Typography variant="body2">
                                Important information about your test:
                            </Typography>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li><Typography variant="body2">Arrive 15 minutes before your appointment</Typography></li>
                                <li><Typography variant="body2">Bring your photo ID on the test day</Typography></li>
                                <li><Typography variant="body2">Rescheduling is available up to 48 hours before</Typography></li>
                                <li><Typography variant="body2">Employment status and ethnicity information are required by the testing authority</Typography></li>
                            </ul>
                        </Stack>
                    </Stack>
                </Paper>


            </Stack>
        </LocalizationProvider>
    );
};

TestConfigurationForm.propTypes = {
    service: PropTypes.object.isRequired,
    details: PropTypes.object,
    onUpdate: PropTypes.func.isRequired
};

export default TestConfigurationForm;