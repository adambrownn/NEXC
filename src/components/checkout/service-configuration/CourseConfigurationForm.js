import React, { useState, useEffect } from 'react';
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
    Chip,
    Divider,
    FormControlLabel,
    Collapse,
    Switch
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import Alert from '@mui/material/Alert';


const CourseConfigurationForm = ({ service, details, onUpdate }) => {
    const courseDetails = details?.courseDetails || {};

    // State for additional attendees
    const [hasAdditionalAttendees, setHasAdditionalAttendees] = useState(!!courseDetails.additionalAttendees);
    
    // State for location handling
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    // Initialize location based on course type when component mounts or when courseType changes
    useEffect(() => {
        if (courseDetails.courseType) {
            // If we already have a location set, use that
            if (courseDetails.location) {
                setSelectedLocation({
                    id: courseDetails.location,
                    name: courseDetails.locationName || 'Selected Location',
                    address: courseDetails.locationAddress || '',
                    type: courseDetails.locationType || ''
                });
            } else {
                // Otherwise set default location based on course type
                // Using a local version of handleCourseTypeChange to avoid dependency cycle
                const type = courseDetails.courseType;
                let locationData = {};
                
                if (type === 'virtual') {
                    locationData = {
                        location: 'loc-virtual',
                        locationName: 'Online / Virtual',
                        locationAddress: 'Remote Learning',
                        locationType: 'Virtual'
                    };
                    
                    setSelectedLocation({
                        id: 'loc-virtual',
                        name: 'Online / Virtual',
                        address: 'Remote Learning',
                        type: 'Virtual'
                    });
                } else if (type === 'inPerson' || type === 'blended') {
                    locationData = {
                        location: 'loc-pending',
                        locationName: 'To Be Determined',
                        locationAddress: 'Our support team will contact you to arrange the most convenient location',
                        locationType: type === 'inPerson' ? 'In-person' : 'Blended'
                    };
                    
                    setSelectedLocation({
                        id: 'loc-pending',
                        name: 'To Be Determined',
                        address: 'Our support team will contact you to arrange the most convenient location',
                        type: type === 'inPerson' ? 'In-person' : 'Blended'
                    });
                }
                
                // Update with the new location data
                handleUpdate({
                    ...locationData
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseDetails.courseType]);
    


    // Handler for updating course details
    const handleUpdate = (updatedDetails) => {
        console.log('Updating course details:', updatedDetails);
        // Always wrap updates in courseDetails to maintain the structure
        onUpdate({
            courseDetails: {
                ...courseDetails,
                ...updatedDetails
            }
        });
    };
    
    // Handle course type change
    const handleCourseTypeChange = (type) => {
        console.log('Course type selected:', type);
        
        // Create a new details object with the updated course type
        let updatedDetails = {
            courseType: type
        };
        
        // Set appropriate location based on course type
        if (type === 'virtual') {
            // For virtual courses, set a virtual location
            updatedDetails.location = 'loc-virtual';
            updatedDetails.locationName = 'Online / Virtual';
            updatedDetails.locationAddress = 'Remote Learning';
            updatedDetails.locationType = 'Virtual';
            
            setSelectedLocation({
                id: 'loc-virtual',
                name: 'Online / Virtual',
                address: 'Remote Learning',
                type: 'Virtual'
            });
        } else if (type === 'inPerson' || type === 'blended') {
            // For in-person or blended courses, set a pending location
            updatedDetails.location = 'loc-pending';
            updatedDetails.locationName = 'To Be Determined';
            updatedDetails.locationAddress = 'Our support team will contact you to arrange the most convenient location';
            updatedDetails.locationType = type === 'inPerson' ? 'In-person' : 'Blended';
            
            setSelectedLocation({
                id: 'loc-pending',
                name: 'To Be Determined',
                address: 'Our support team will contact you to arrange the most convenient location',
                type: type === 'inPerson' ? 'In-person' : 'Blended'
            });
        } else {
            // Clear location if no course type is selected
            updatedDetails.location = null;
            updatedDetails.locationName = null;
            updatedDetails.locationAddress = null;
            updatedDetails.locationType = null;
            setSelectedLocation(null);
        }
        
        // Send the updated details to the parent component
        handleUpdate(updatedDetails);
    };


    
    // Note: Location selection is now handled directly in handleCourseTypeChange
    

    // Get earliest available date for course booking (2 weeks from today)
    const getEarliestDate = () => {
        const today = new Date();
        return new Date(today.getTime() + 14 * 86400000); // 14 days from today
    };

    // Handler for additional attendees input
    const handleAttendeesChange = (index, field, value) => {
        const attendees = [...(courseDetails.additionalAttendees || [])];
        if (!attendees[index]) {
            attendees[index] = {};
        }
        attendees[index] = {
            ...attendees[index],
            [field]: value
        };
        handleUpdate({ additionalAttendees: attendees });
    };

    // Remove an attendee
    const removeAttendee = (index) => {
        const attendees = [...(courseDetails.additionalAttendees || [])];
        attendees.splice(index, 1);
        handleUpdate({ additionalAttendees: attendees });
    };

    // Add a new attendee
    const addAttendee = () => {
        const attendees = [...(courseDetails.additionalAttendees || []), { name: '', email: '' }];
        handleUpdate({ additionalAttendees: attendees });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
                <Typography variant="subtitle2" gutterBottom>
                    Course Booking Details
                </Typography>

                {/* Course type selection */}
                <FormControl fullWidth required>
                    <InputLabel>Course Type</InputLabel>
                    <Select
                        value={courseDetails.courseType || ''}
                        onChange={(e) => {
                            console.log('Course type dropdown changed to:', e.target.value);
                            handleCourseTypeChange(e.target.value);
                        }}
                        label="Course Type"
                    >
                        <MenuItem value="inPerson">In-Person</MenuItem>
                        <MenuItem value="virtual">Virtual / Online</MenuItem>
                        <MenuItem value="blended">Blended Learning</MenuItem>
                    </Select>
                    <FormHelperText>Select your preferred course delivery method</FormHelperText>
                </FormControl>

                {/* Location information - show only if in-person or blended */}
                {['inPerson', 'blended'].includes(courseDetails.courseType) && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Training Location Information
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <LocationOnIcon sx={{ mt: 0.5, mr: 1, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="subtitle2">{selectedLocation?.name || 'To Be Determined'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedLocation?.address || 'Our support team will contact you to arrange the most convenient location'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                For {courseDetails.courseType === 'inPerson' ? 'in-person' : 'blended'} training, our support team will contact you to discuss available training centers near you. 
                                This allows us to find the most convenient location based on the number of attendees and your preferences.
                            </Typography>
                        </Alert>
                    </Paper>
                )}
                
                {/* Virtual location info - show only if virtual */}
                {courseDetails.courseType === 'virtual' && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Virtual Training Information
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <SchoolIcon sx={{ mt: 0.5, mr: 1, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="subtitle2">Online / Virtual Training</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    You will receive access details via email before the course start date
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Date selection */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Course Date Selection
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="Course Start Date"
                                value={courseDetails.startDate ? new Date(courseDetails.startDate) : null}
                                onChange={(date) => handleUpdate({ 
                                    startDate: date ? date.toISOString() : null,
                                    duration: courseDetails.duration || '2 days' // Preserve existing duration
                                })}
                                minDate={getEarliestDate()}
                                format="dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        helperText: "Select when you would like to start the course"
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Course Duration</InputLabel>
                                <Select
                                    value={courseDetails.duration || '2 days'}
                                    onChange={(e) => handleUpdate({ duration: e.target.value })}
                                    label="Course Duration"
                                >
                                    <MenuItem value="1 day">1 Day</MenuItem>
                                    <MenuItem value="2 days">2 Days</MenuItem>
                                    <MenuItem value="3 days">3 Days</MenuItem>
                                    <MenuItem value="5 days">5 Days (1 Week)</MenuItem>
                                </Select>
                                <FormHelperText>Select the course duration</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Alternative date */}
                <DatePicker
                    label="Alternative Date (If preferred dates unavailable)"
                    value={courseDetails.alternativeDate ? new Date(courseDetails.alternativeDate) : null}
                    onChange={(date) => handleUpdate({ alternativeDate: date ? date.toISOString() : null })}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            helperText: "We'll try to accommodate your preferred date if possible"
                        }
                    }}
                />

                <Divider />



                {/* Additional attendees toggle */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={hasAdditionalAttendees}
                            onChange={(e) => {
                                setHasAdditionalAttendees(e.target.checked);
                                if (!e.target.checked) handleUpdate({ additionalAttendees: [] });
                            }}
                            color="primary"
                        />
                    }
                    label="Add additional attendees for this course"
                />

                <Collapse in={hasAdditionalAttendees}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Additional Attendees
                        </Typography>

                        {(courseDetails.additionalAttendees || []).map((attendee, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={5}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        value={attendee.name || ''}
                                        onChange={(e) => handleAttendeesChange(index, 'name', e.target.value)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={attendee.email || ''}
                                        onChange={(e) => handleAttendeesChange(index, 'email', e.target.value)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                                        <Chip
                                            label="Remove"
                                            color="error"
                                            size="small"
                                            onClick={() => removeAttendee(index)}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        ))}

                        <Box sx={{ mt: 1 }}>
                            <Chip
                                label="Add Another Attendee"
                                color="primary"
                                variant="outlined"
                                onClick={addAttendee}
                                icon={<SchoolIcon />}
                                clickable
                            />
                        </Box>
                    </Paper>
                </Collapse>

                {/* Information paper */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter', borderColor: 'info.light' }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <InfoOutlinedIcon color="info" sx={{ mt: 0.5 }} />
                        <Stack>
                            <Typography variant="body2">
                                Important information about your course:
                            </Typography>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li><Typography variant="body2">Confirmation details will be sent via email</Typography></li>
                                <li><Typography variant="body2">Please arrive 15 minutes before the course start time</Typography></li>
                                <li><Typography variant="body2">Courses can be rescheduled up to 7 days before the start date</Typography></li>
                            </ul>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Requirements chip section */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Requirements for this course:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                            size="small"
                            label="Photo ID"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label="Booking confirmation"
                            variant="outlined"
                        />
                        {courseDetails.courseType === 'virtual' && (
                            <Chip
                                size="small"
                                label="Computer with webcam"
                                variant="outlined"
                                color="primary"
                            />
                        )}
                        {service.title.toLowerCase().includes('practical') && (
                            <Chip
                                size="small"
                                label="Safety footwear"
                                variant="outlined"
                                color="warning"
                            />
                        )}
                    </Box>
                </Box>
            </Stack>
        </LocalizationProvider>
    );
};

CourseConfigurationForm.propTypes = {
    service: PropTypes.object.isRequired,
    details: PropTypes.object,
    onUpdate: PropTypes.func.isRequired
};

export default CourseConfigurationForm;