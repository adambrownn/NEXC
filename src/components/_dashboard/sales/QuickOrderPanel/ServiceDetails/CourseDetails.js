import React, { useState } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Box,
  Paper,
  Switch,
  Collapse,
  FormHelperText,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

/**
 * Component for rendering course service details form
 * Updated to make attendee details optional with a toggle
 */
const CourseDetails = ({ service, details, onUpdate }) => {
  const serviceId = service._id || service.id;
  const courseDetails = details?.courseDetails || {};
  
  // State to track if attendee is different from customer
  const [hasDifferentAttendee, setHasDifferentAttendee] = useState(
    !!(courseDetails.attendeeDetails?.name || courseDetails.attendeeDetails?.email || courseDetails.attendeeDetails?.phone)
  );
  
  // State for optional field toggles
  const [showCourseId, setShowCourseId] = useState(!!courseDetails.courseId);
  const [showEndDate, setShowEndDate] = useState(!!courseDetails.endDate);

  const handleUpdate = (updatedCourseDetails) => {
    onUpdate(serviceId, {
      ...details,
      courseDetails: {
        ...courseDetails,
        ...updatedCourseDetails
      }
    });
  };

  const handleAttendeeUpdate = (field, value) => {
    handleUpdate({
      attendeeDetails: {
        ...(courseDetails.attendeeDetails || {}),
        [field]: value
      }
    });
  };

  // Toggle attendee details visibility
  const handleAttendeeToggle = (event) => {
    const isChecked = event.target.checked;
    setHasDifferentAttendee(isChecked);
    
    // If toggling off, clear attendee details
    if (!isChecked) {
      handleUpdate({
        attendeeDetails: null
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Typography variant="subtitle2" gutterBottom>
          Course Information
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showCourseId}
              onChange={(e) => {
                setShowCourseId(e.target.checked);
                if (!e.target.checked) handleUpdate({ courseId: '' });
              }}
              color="primary"
            />
          }
          label="Add Course ID"
        />
        
        <Collapse in={showCourseId}>
          <TextField
            fullWidth
            label="Course ID"
            value={courseDetails.courseId || ''}
            onChange={(e) => handleUpdate({ courseId: e.target.value })}
          />
        </Collapse>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <DatePicker
            label="Start Date *"
            value={courseDetails.startDate ? new Date(courseDetails.startDate) : null}
            onChange={(date) => handleUpdate({ 
              startDate: date ? date.toISOString().split('T')[0] : '' 
            })}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required
                helperText="When the course begins"
              />
            )}
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showEndDate}
                  onChange={(e) => {
                    setShowEndDate(e.target.checked);
                    if (!e.target.checked) handleUpdate({ endDate: '' });
                  }}
                  color="primary"
                  size="small"
                />
              }
              label="Add End Date"
              sx={{ mb: 1 }}
            />
            
            <Collapse in={showEndDate} sx={{ width: '100%' }}>
              <DatePicker
                label="End Date"
                value={courseDetails.endDate ? new Date(courseDetails.endDate) : null}
                onChange={(date) => handleUpdate({ 
                  endDate: date ? date.toISOString().split('T')[0] : '' 
                })}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    helperText="When the course ends (if known)"
                  />
                )}
              />
            </Collapse>
          </Box>
        </Box>
        
        <FormControl fullWidth required>
          <InputLabel>Course Location</InputLabel>
          <Select
            value={courseDetails.location || ''}
            onChange={(e) => handleUpdate({ location: e.target.value })}
            label="Course Location"
          >
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="London">London</MenuItem>
            <MenuItem value="Manchester">Manchester</MenuItem>
            <MenuItem value="Birmingham">Birmingham</MenuItem>
            <MenuItem value="Glasgow">Glasgow</MenuItem>
            <MenuItem value="Cardiff">Cardiff</MenuItem>
            <MenuItem value="Belfast">Belfast</MenuItem>
            <MenuItem value="Customer Site">Customer Site</MenuItem>
          </Select>
          <FormHelperText>Where the course will be held</FormHelperText>
        </FormControl>
        
        {courseDetails.location === 'Customer Site' && (
          <TextField
            fullWidth
            label="Site Address *"
            value={courseDetails.siteAddress || ''}
            onChange={(e) => handleUpdate({ siteAddress: e.target.value })}
            multiline
            rows={2}
            required
            placeholder="Enter the full address of the customer site"
          />
        )}
        
        <FormControl fullWidth required>
          <InputLabel>Course Type</InputLabel>
          <Select
            value={courseDetails.courseType || ''}
            onChange={(e) => handleUpdate({ courseType: e.target.value })}
            label="Course Type"
          >
            <MenuItem value="CSCS">CSCS</MenuItem>
            <MenuItem value="CPCS">CPCS</MenuItem>
            <MenuItem value="CITB">CITB</MenuItem>
            <MenuItem value="First Aid">First Aid</MenuItem>
            <MenuItem value="Health & Safety">Health & Safety</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          <FormHelperText>Type of course being booked</FormHelperText>
        </FormControl>
        
        {courseDetails.courseType === 'Other' && (
          <TextField
            fullWidth
            label="Specify Course Type *"
            value={courseDetails.otherCourseType || ''}
            onChange={(e) => handleUpdate({ otherCourseType: e.target.value })}
            required
          />
        )}
        
        <Divider />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={courseDetails.requiresAccommodation || false}
              onChange={(e) => handleUpdate({ requiresAccommodation: e.target.checked })}
            />
          }
          label="Requires Accommodation"
        />
        
        {courseDetails.requiresAccommodation && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Number of Nights *"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={courseDetails.accommodationNights || ''}
                onChange={(e) => handleUpdate({ accommodationNights: e.target.value })}
                required={courseDetails.requiresAccommodation}
              />
              <TextField
                fullWidth
                label="Special Requirements"
                multiline
                rows={2}
                value={courseDetails.accommodationRequirements || ''}
                onChange={(e) => handleUpdate({ accommodationRequirements: e.target.value })}
                placeholder="Any special accommodation requirements"
              />
            </Stack>
          </Paper>
        )}
        
        <Divider />
        
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={hasDifferentAttendee}
                onChange={handleAttendeeToggle}
                color="primary"
              />
            }
            label="Add attendee (if different than customer)"
          />
          
          <Collapse in={hasDifferentAttendee}>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                If the customer is booking for someone else, please provide the attendee's details.
                Otherwise, the customer will be considered the attendee.
              </Alert>
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Attendee Name *"
                  value={courseDetails.attendeeDetails?.name || ''}
                  onChange={(e) => handleAttendeeUpdate('name', e.target.value)}
                  required={hasDifferentAttendee}
                />
                <TextField
                  fullWidth
                  label="Attendee Email *"
                  type="email"
                  value={courseDetails.attendeeDetails?.email || ''}
                  onChange={(e) => handleAttendeeUpdate('email', e.target.value)}
                  required={hasDifferentAttendee}
                />
                <TextField
                  fullWidth
                  label="Attendee Phone"
                  value={courseDetails.attendeeDetails?.phone || ''}
                  onChange={(e) => handleAttendeeUpdate('phone', e.target.value)}
                />
              </Stack>
            </Paper>
          </Collapse>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
};

export default CourseDetails;