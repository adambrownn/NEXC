import React from 'react';
import { 
  Stack, 
  Paper, 
  Typography, 
  TextField, 
  Box, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CardDetails from './CardDetails';
import TestDetails from './TestDetails';
import CourseDetails from './CourseDetails';
import QualificationDetails from './QualificationDetails';

/**
 * Component for rendering service-specific details based on the service category
 */
const QuickOrderServiceDetails = ({ 
  selectedServices, 
  serviceDetails, 
  handleServiceDetailsUpdate,
  orderDraft,
  ContentSkeleton,
  loadingStates,
  onNext
}) => {
  if (loadingStates?.serviceLoading) {
    return <ContentSkeleton />;
  }

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
        return <AssignmentIcon />;
    }
  };

  // Calculate completion percentage for each service
  const calculateCompletionPercentage = (service, details) => {
    const serviceId = service._id || service.id;
    const serviceDetail = details[serviceId] || {};
    
    // Different required fields based on service category
    let requiredFields = [];
    
    switch (service.category?.toLowerCase()) {
      case 'cards':
        requiredFields = ['cardDetails.cardType'];
        break;
      case 'tests':
        requiredFields = ['testDetails.testDate', 'testDetails.testTime', 'testDetails.testCentre'];
        // Add conditional required fields
        if (serviceDetail.testDetails?.citbTestId !== undefined && serviceDetail.testDetails?.citbTestId !== '') {
          requiredFields.push('testDetails.citbTestId');
        }
        if (serviceDetail.testDetails?.voiceover !== undefined && serviceDetail.testDetails?.voiceover !== '') {
          requiredFields.push('testDetails.voiceover');
        }
        break;
      case 'courses':
        requiredFields = ['courseDetails.startDate', 'courseDetails.location', 'courseDetails.courseType'];
        // Add conditional required fields
        if (serviceDetail.courseDetails?.courseId !== undefined && serviceDetail.courseDetails?.courseId !== '') {
          requiredFields.push('courseDetails.courseId');
        }
        if (serviceDetail.courseDetails?.endDate !== undefined && serviceDetail.courseDetails?.endDate !== '') {
          requiredFields.push('courseDetails.endDate');
        }
        if (serviceDetail.courseDetails?.location === 'Customer Site') {
          requiredFields.push('courseDetails.siteAddress');
        }
        if (serviceDetail.courseDetails?.courseType === 'Other') {
          requiredFields.push('courseDetails.otherCourseType');
        }
        if (serviceDetail.courseDetails?.requiresAccommodation) {
          requiredFields.push('courseDetails.accommodationNights');
        }
        if (serviceDetail.courseDetails?.attendeeDetails) {
          requiredFields.push('courseDetails.attendeeDetails.name', 'courseDetails.attendeeDetails.email');
        }
        break;
      case 'qualifications':
        requiredFields = ['qualificationDetails.level', 'qualificationDetails.type'];
        // Add conditional required fields
        if (serviceDetail.qualificationDetails?.level === 'Other') {
          requiredFields.push('qualificationDetails.otherLevel');
        }
        if (serviceDetail.qualificationDetails?.type === 'Other') {
          requiredFields.push('qualificationDetails.otherType');
        }
        if (serviceDetail.qualificationDetails?.requiresAssessor) {
          requiredFields.push('qualificationDetails.assessmentDate');
        }
        break;
      default:
        return 100; // Default to 100% if category is unknown
    }
    
    // Count completed required fields
    const completedFields = requiredFields.filter(field => {
      const fieldPath = field.split('.');
      let value = serviceDetail;
      
      for (const path of fieldPath) {
        value = value?.[path];
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
      
      return true;
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100) || 0;
  };

  // Check if all required fields are completed for all services
  const areAllServicesComplete = () => {
    return selectedServices.every(service => {
      const serviceId = service._id || service.id;
      const details = serviceDetails[serviceId] || {};
      return calculateCompletionPercentage(service, { [serviceId]: details }) === 100;
    });
  };

  // Handle next button click
  const handleNextClick = () => {
    if (onNext && typeof onNext === 'function') {
      onNext();
    }
  };

  return (
    <Stack spacing={3}>
      {selectedServices.map((service, index) => {
        const serviceId = service._id || service.id;
        const details = serviceDetails[serviceId] || {};
        const completionPercentage = calculateCompletionPercentage(service, { [serviceId]: details });
        
        return (
          <Accordion 
            key={serviceId} 
            defaultExpanded={index === 0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`service-${serviceId}-content`}
              id={`service-${serviceId}-header`}
              sx={{
                backgroundColor: 'background.neutral',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2 }}>
                  {getCategoryIcon(service.category)}
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {service.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {service.category}
                    </Typography>
                    
                    <Chip 
                      label={`£${service.price?.toFixed(2) || '0.00'}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    
                    {service.code && (
                      <Chip 
                        label={service.code}
                        size="small"
                        sx={{ ml: 1 }}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ ml: 2, minWidth: 100 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionPercentage} 
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="caption" align="center" display="block">
                    {completionPercentage}% Complete
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ p: 3 }}>
              <Stack spacing={3}>
                {service.category === 'cards' && (
                  <CardDetails 
                    service={service} 
                    details={details} 
                    onUpdate={handleServiceDetailsUpdate} 
                  />
                )}
                {service.category === 'tests' && (
                  <TestDetails 
                    service={service} 
                    details={details} 
                    onUpdate={handleServiceDetailsUpdate} 
                  />
                )}
                {service.category === 'courses' && (
                  <CourseDetails 
                    service={service} 
                    details={details} 
                    onUpdate={handleServiceDetailsUpdate} 
                  />
                )}
                {service.category === 'qualifications' && (
                  <QualificationDetails 
                    service={service} 
                    details={details} 
                    onUpdate={handleServiceDetailsUpdate} 
                  />
                )}
                
                {/* Keep service-specific notes */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={details.notes || ''}
                  onChange={(e) => handleServiceDetailsUpdate(service._id || service.id, {
                    ...details,
                    notes: e.target.value
                  })}
                  placeholder="Add any additional information or special requirements for this service"
                />
                
                {completionPercentage < 100 && (
                  <Alert severity="info">
                    Please complete all required fields for this service.
                  </Alert>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
      
      {selectedServices.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No services selected. Please go back and select services.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You need to select at least one service to proceed.
          </Typography>
        </Paper>
      )}
      
      {/* Next button to proceed to Order Summary */}
      {selectedServices.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<NavigateNextIcon />}
            onClick={handleNextClick}
            disabled={!areAllServicesComplete()}
          >
            Proceed to Order Summary
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default QuickOrderServiceDetails;