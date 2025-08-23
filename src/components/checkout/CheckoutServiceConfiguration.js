import { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    Chip,
    Grid,
    Stack,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Alert,
    TextField,
    CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import arrowIosBackFill from '@iconify/icons-eva/arrow-ios-back-fill';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CardConfigurationForm from './service-configuration/CardConfigurationForm';
import TestConfigurationForm from './service-configuration/TestConfigurationForm';
import CourseConfigurationForm from './service-configuration/CourseConfigurationForm';
import QualificationConfigurationForm from './service-configuration/QualificationConfigurationForm';
import { useCart } from '../../contexts/CartContext';
import { CheckoutContext } from '../../pages/EcommerceCheckout';

// ----------------------------------------------------------------------

export default function CheckoutServiceConfiguration() {
    // Get navigate function from React Router
    const navigate = useNavigate();
    
    // Get checkout context from the provider for navigation
    const { handleBack, handleNext } = useContext(CheckoutContext);

    // Use CartContext for all cart-related operations
    const { 
        items: cartItems, 
        loading: cartLoading, 
        error: cartError,
        configurations,
        updateConfigurations
    } = useCart();

    const [serviceDetails, setServiceDetails] = useState({});
    const [expandedService, setExpandedService] = useState(null);
    const [configErrors, setConfigErrors] = useState({});

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    
    // Helper function to deep merge service details (memoized with useCallback)
    const mergeServiceDetails = useCallback((target, source) => {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                // If property exists in target and is an object, recursively merge
                if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                    result[key] = mergeServiceDetails(target[key], source[key]);
                } else {
                    // Otherwise just assign the source value
                    result[key] = source[key];
                }
            } else {
                // For primitives and arrays, just assign
                result[key] = source[key];
            }
        });
        
        return result;
    }, []);

    // Initialize service details from cart items and configurations
    useEffect(() => {
        try {
            setIsLoading(true);
            setLoadError(null);
            
            if (cartLoading) {
                return; // Wait until cart data is loaded
            }
            
            if (cartError) {
                setLoadError(cartError);
                return;
            }
            
            // Initialize serviceDetails with enhanced structure
            const initialDetails = {};
            
            // Process each item and prepare for configuration
            for (const item of cartItems) {
                const itemId = item._id;
                
                // Base structure for all service types
                initialDetails[itemId] = {
                    ...item,
                    status: 'pending_configuration'
                };
                
                // Type-specific configuration structures
                switch (item.type?.toLowerCase()) {
                    case 'cards':
                        initialDetails[itemId].cardDetails = {
                            cardType: item.newRenew || '',
                            cardNumber: item.cardNumber || '',
                            expiryDate: item.expiryDate || '',
                            holderName: item.holderName || '',
                            deliveryMethod: item.deliveryMethod || 'standard',
                            specialRequirements: item.specialRequirements || ''
                        };
                        break;
                        
                    case 'tests':
                        initialDetails[itemId].testDetails = {
                            testDate: item.testDate || '',
                            testTime: item.testTime || '',
                            testCentre: item.testCentre || '',
                            testCentreId: item.testCentreId || '',
                            testCentreAddress: item.testCentreAddress || '',
                            voiceover: item.voiceover || '',
                            accommodations: item.accommodations || '',
                            candidateNumber: item.candidateNumber || '',
                            specialRequirements: item.specialRequirements || ''
                        };
                        break;
                        
                    case 'courses':
                        initialDetails[itemId].courseDetails = {
                            startDate: item.startDate || '',
                            endDate: item.endDate || '',
                            location: item.location || '',
                            courseType: item.courseType || '',
                            attendeeDetails: item.attendeeDetails || {
                                name: '',
                                email: '',
                                phone: ''
                            },
                            requiresAccommodation: item.requiresAccommodation || false,
                            accommodationNights: item.accommodationNights || [],
                            specialRequirements: item.specialRequirements || ''
                        };
                        break;
                        
                    case 'qualifications':
                        initialDetails[itemId].qualificationDetails = {
                            level: item.level || '',
                            type: item.type || '',
                            assessmentDate: item.assessmentDate || '',
                            requiresAssessor: item.requiresAssessor || false,
                            previousQualifications: item.previousQualifications || [],
                            specialRequirements: item.specialRequirements || ''
                        };
                        break;
                        
                    default:
                        // Generic configuration for unknown types
                        initialDetails[itemId].genericDetails = {
                            notes: item.notes || '',
                            specialRequirements: item.specialRequirements || ''
                        };
                }
            }

            // Merge with any existing configurations from CartContext
            if (configurations && Object.keys(configurations).length > 0) {
                Object.keys(configurations).forEach(itemId => {
                    if (initialDetails[itemId]) {
                        // Deep merge to preserve nested structures
                        initialDetails[itemId] = mergeServiceDetails(
                            initialDetails[itemId],
                            configurations[itemId]
                        );
                    }
                });
            }

            setServiceDetails(initialDetails);

            // Set first service as expanded if any exist
            if (cartItems && cartItems.length > 0) {
                setExpandedService(cartItems[0]._id);
            }
        } catch (error) {
            console.error('Error initializing service details:', error);
            setLoadError('Failed to initialize service configuration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [cartItems, configurations, cartLoading, cartError, mergeServiceDetails]);

    // Service details update handler
    const handleServiceDetailsUpdate = (serviceId, newDetails) => {
        console.log('Service details update received:', { serviceId, newDetails });
        
        setServiceDetails(prev => {
            const updated = {
                ...prev,
                [serviceId]: {
                    ...prev[serviceId],
                    ...newDetails
                }
            };
            console.log('Updated service details:', updated[serviceId]);
            return updated;
        });

        // Clear any error for this service
        if (configErrors[serviceId]) {
            setConfigErrors(prev => {
                const updated = { ...prev };
                delete updated[serviceId];
                return updated;
            });
        }
    };

    // Helper function to get the icon for a service category
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

    // Calculate completion percentage for a service
    const calculateCompletionPercentage = (service) => {
        const serviceId = service._id;
        const serviceDetail = serviceDetails[serviceId] || {};

        // Initialize required fields array (no longer including customer information)
        let requiredFields = [];

        // Add service-specific required fields based on service type
        switch (service.type) {
            case 'cards':
                requiredFields.push('cardDetails.cardType');
                // Add conditional fields if needed
                break;

            case 'tests':
                requiredFields.push('testDetails.testDate', 'testDetails.testTime', 'testDetails.testCentre');
                break;

            case 'courses':
                requiredFields.push('courseDetails.startDate', 'courseDetails.location', 'courseDetails.courseType');
                break;

            case 'qualifications':
                requiredFields.push('qualificationDetails.level', 'qualificationDetails.type');
                break;

            default:
                return 100; // Default to 100% if type is unknown
        }

        // If there are no required fields, return 100% completion
        if (requiredFields.length === 0) {
            return 100;
        }
        
        // Count completed fields
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

    // // Check if all services are properly configured
    // const areAllServicesComplete = () => {
    //     return cartItems.every(service => {
    //         return calculateCompletionPercentage(service) === 100;
    //     });
    // };

    // Handle accordion expansion
    const handleAccordionChange = (serviceId) => {
        setExpandedService(expandedService === serviceId ? null : serviceId);
    };

    // Get missing required fields for a service
    const getMissingFields = (service) => {
        const serviceId = service._id;
        const updatedService = serviceDetails[serviceId] || service;
        const missingFields = [];
        let requiredFields = [];
        
        // Determine required fields based on service type
        switch (service.type?.toLowerCase()) {
            case 'tests':
                requiredFields = [
                    { path: 'testDetails.testDate', label: 'Test Date' },
                    { path: 'testDetails.testTime', label: 'Test Time' },
                    { path: 'testDetails.testCentre', label: 'Test Centre' }
                ];
                break;
                
            case 'courses':
                requiredFields = [
                    { path: 'courseDetails.startDate', label: 'Course Start Date' },
                    { path: 'courseDetails.location', label: 'Course Location' },
                    { path: 'courseDetails.courseType', label: 'Course Type' }
                ];
                break;
                
            case 'qualifications':
                requiredFields = [
                    { path: 'qualificationDetails.level', label: 'Qualification Level' },
                    { path: 'qualificationDetails.type', label: 'Qualification Type' }
                ];
                break;
                
            default:
                return [];
        }
        
        // Check each required field
        requiredFields.forEach(field => {
            const fieldPath = field.path.split('.');
            let value = updatedService; // Use the updated service details
            
            for (const path of fieldPath) {
                value = value?.[path];
                if (value === undefined || value === null || value === '') {
                    missingFields.push(field.label);
                    break;
                }
            }
        });
        
        return missingFields;
    };

    // Save configurations and proceed
    const handleContinue = async () => {
        // Use non-async initial function to avoid promise chain issues
        const newErrors = {};

        // Validate each service
        cartItems.forEach(service => {
            const missingFields = getMissingFields(service);
            if (missingFields.length > 0) {
                newErrors[service._id] = `Please complete the following field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`;
                // Automatically expand the accordion with errors
                setExpandedService(service._id);
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setConfigErrors(newErrors);
            return;
        }

        // Set a loading state to prevent multiple clicks
        setIsLoading(true);
        
        // Extract configurations from serviceDetails
        const newConfigurations = {};
        Object.keys(serviceDetails).forEach(serviceId => {
            newConfigurations[serviceId] = serviceDetails[serviceId];
        });

        try {
            // Save configurations using CartContext
            const result = await updateConfigurations(newConfigurations);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to save configurations');
            }
            
            console.log('Cart configurations saved successfully');
            
            // Proceed to next step using CheckoutContext
            if (handleNext) {
                handleNext();
            } else {
                // Fallback if context not available
                navigate('/checkout?step=2');
            }
        } catch (error) {
            console.error('Error saving configurations:', error);
            setConfigErrors({
                general: 'An error occurred while saving your configuration. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                    {isLoading || cartLoading ? (
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Loading your services
                            </Typography>
                            <LinearProgress sx={{ mt: 2, mb: 3, mx: 'auto', maxWidth: 400 }} />
                            <Typography variant="body2" color="text.secondary">
                                Please wait while we prepare your service configuration...
                            </Typography>
                        </Card>
                    ) : loadError || cartError ? (
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {loadError || cartError}
                            </Alert>
                            <Button 
                                variant="outlined" 
                                onClick={() => window.location.reload()}
                                sx={{ mt: 2 }}
                            >
                                Reload Page
                            </Button>
                        </Card>
                    ) : cartItems.length > 0 ? (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                    Configure Your Services
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Please provide the required details for each service to continue with your purchase.
                                </Typography>
                            </Box>
                            
                            {/* Display general errors */}
                            {configErrors.general && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {configErrors.general}
                                </Alert>
                            )}

                            <Stack spacing={2}>
                                {cartItems.map((service) => {
                                    const serviceId = service._id;
                                    const completionPercentage = calculateCompletionPercentage(service);

                                    return (
                                <Accordion
                                    key={serviceId}
                                    expanded={expandedService === serviceId}
                                    onChange={() => handleAccordionChange(serviceId)}
                                    disableGutters
                                    sx={{
                                        mb: 2.5,
                                        border: '1px solid',
                                        borderColor: configErrors[serviceId] ? 'error.main' : expandedService === serviceId ? 'primary.main' : 'divider',
                                        boxShadow: configErrors[serviceId] ? '0 0 0 2px rgba(255, 72, 66, 0.2)' : expandedService === serviceId ? '0 8px 16px 0 rgba(0, 171, 85, 0.24)' : '0 2px 8px 0 rgba(145, 158, 171, 0.16)',
                                        '&:before': { display: 'none' },
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            borderColor: configErrors[serviceId] ? 'error.main' : 'primary.main',
                                            boxShadow: expandedService === serviceId ? '0 8px 16px 0 rgba(0, 171, 85, 0.32)' : '0 4px 12px 0 rgba(145, 158, 171, 0.24)'
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            backgroundColor: configErrors[serviceId] ? 'error.lighter' : expandedService === serviceId ? 'primary.lighter' : 'background.neutral',
                                            borderBottom: '1px solid',
                                            borderColor: configErrors[serviceId] ? 'error.main' : expandedService === serviceId ? 'primary.main' : 'divider',
                                            transition: 'all 0.2s ease-in-out',
                                            borderRadius: '8px 8px 0 0',
                                            '& .MuiAccordionSummary-expandIconWrapper': {
                                                color: configErrors[serviceId] ? 'error.main' : expandedService === serviceId ? 'primary.main' : 'text.secondary',
                                                transform: expandedService === serviceId ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.2s ease-in-out',
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ 
                                                mr: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                backgroundColor: configErrors[serviceId] ? 'error.lighter' : expandedService === serviceId ? 'primary.lighter' : 'background.default',
                                                color: configErrors[serviceId] ? 'error.main' : expandedService === serviceId ? 'primary.main' : 'text.secondary',
                                                transition: 'all 0.2s ease-in-out',
                                            }}>
                                                {getCategoryIcon(service.type)}
                                            </Box>

                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" sx={{ 
                                                    fontWeight: expandedService === serviceId ? 600 : 500,
                                                    color: configErrors[serviceId] ? 'error.main' : expandedService === serviceId ? 'primary.main' : 'text.primary',
                                                }}>
                                                    {service.title}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                        {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                                                    </Typography>

                                                    <Chip
                                                        label={`£${service.price?.toFixed(2) || '0.00'}`}
                                                        size="small"
                                                        color={expandedService === serviceId ? "primary" : "default"}
                                                        variant={expandedService === serviceId ? "filled" : "outlined"}
                                                        sx={{ transition: 'all 0.2s ease-in-out' }}
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
                                                    color={configErrors[serviceId] ? "error" : completionPercentage === 100 ? "success" : "primary"}
                                                    sx={{ 
                                                        height: 8, 
                                                        borderRadius: 5,
                                                        backgroundColor: 'rgba(145, 158, 171, 0.16)',
                                                        '.MuiLinearProgress-bar': {
                                                            borderRadius: 5,
                                                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{ 
                                                    color: configErrors[serviceId] ? 'error.main' : completionPercentage === 100 ? 'success.main' : 'text.secondary',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mt: 0.5
                                                }}>
                                                    {completionPercentage}% Complete
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            {/* Service description section */}
                                            <Box sx={{ 
                                                p: 2, 
                                                backgroundColor: 'background.neutral', 
                                                borderRadius: 1,
                                                border: '1px dashed',
                                                borderColor: 'divider'
                                            }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {service.description || 'Please configure this service with the required details below.'}
                                                </Typography>
                                            </Box>
                                            


                                            {/* Render appropriate configuration form based on service type */}
                                            <Box sx={{ 
                                                p: 2, 
                                                backgroundColor: 'background.paper',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider'
                                            }}>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Service Configuration
                                                </Typography>
                                                
                                                {service.type === 'cards' && (
                                                    <CardConfigurationForm
                                                        service={service}
                                                        details={serviceDetails[serviceId]}
                                                        onUpdate={(updates) => handleServiceDetailsUpdate(serviceId, updates)}
                                                    />
                                                )}

                                                {service.type === 'tests' && (
                                                    <TestConfigurationForm
                                                        service={service}
                                                        details={serviceDetails[serviceId]}
                                                        onUpdate={(updates) => handleServiceDetailsUpdate(serviceId, updates)}
                                                    />
                                                )}

                                                {service.type === 'courses' && (
                                                    <CourseConfigurationForm
                                                        service={service}
                                                        details={serviceDetails[serviceId]}
                                                        onUpdate={(updates) => handleServiceDetailsUpdate(serviceId, updates)}
                                                    />
                                                )}

                                                {service.type === 'qualifications' && (
                                                    <QualificationConfigurationForm
                                                        service={service}
                                                        details={serviceDetails[serviceId]}
                                                        onUpdate={(updates) => handleServiceDetailsUpdate(serviceId, updates)}
                                                    />
                                                )}
                                            </Box>

                                            {/* Notes field */}
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Additional Notes
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    placeholder="Add any special requirements or notes for this service"
                                                    variant="outlined"
                                                    size="small"
                                                    value={serviceDetails[serviceId]?.notes || ''}
                                                    onChange={(e) => handleServiceDetailsUpdate(serviceId, { notes: e.target.value })}
                                                    InputProps={{
                                                        sx: { fontSize: '14px' }
                                                    }}
                                                />
                                            </Box>

                                            {/* Error message */}
                                            {configErrors[serviceId] && (
                                                <Alert 
                                                    severity="error" 
                                                    sx={{ 
                                                        mt: 2,
                                                        '& .MuiAlert-icon': {
                                                            alignItems: 'center'
                                                        }
                                                    }}
                                                >
                                                    {configErrors[serviceId]}
                                                </Alert>
                                            )}

                                            {/* Completion status */}
                                            {completionPercentage < 100 && (
                                                <Alert severity="info" sx={{ mt: 1 }}>
                                                    Please complete all required fields for this service.
                                                </Alert>
                                            )}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                                );
                                })}
                            </Stack>
                        </>
                    ) : (
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                No services to configure
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                Please add services to your cart first.
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={() => window.location.href = '/services'}
                            >
                                Browse Services
                            </Button>
                        </Card>
                    )}
                </Stack>
                
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 4,
                    pt: 3,
                    borderTop: '1px dashed rgba(145, 158, 171, 0.24)'
                }}>
                    <Button
                        color="inherit"
                        onClick={() => {
                            // Use the handleBack function from CheckoutContext
                            if (typeof handleBack === 'function') {
                                handleBack();
                            } else {
                                // Last resort: navigate to home page where cart can be accessed
                                navigate('/');
                            }
                        }}
                        startIcon={<Icon icon={arrowIosBackFill} />}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(145, 158, 171, 0.08)'
                            }
                        }}
                    >
                        Back to Home
                    </Button>

                    <Button
                        variant="contained"
                        endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Icon icon={arrowIosForwardFill} />}
                        onClick={handleContinue}
                        disabled={isLoading || cartItems.length === 0}
                        sx={{
                            boxShadow: '0 8px 16px 0 rgba(0, 171, 85, 0.24)',
                            '&:hover': {
                                boxShadow: '0 8px 16px 0 rgba(0, 171, 85, 0.32)'
                            }
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Continue to Customer Details'}
                    </Button>
                </Box>
            </Grid>

            <Grid item xs={12} md={4}>
                <Box sx={{ 
                    position: 'sticky', 
                    top: 16,
                }}>
                    <Card sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'primary.lighter',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Order Summary
                            </Typography>
                            <Chip 
                                label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {cartItems.map((item, index) => (
                                <Box 
                                    key={item._id || index}
                                    sx={{
                                        py: 1.5,
                                        ...(index < cartItems.length - 1 && {
                                            borderBottom: '1px dashed',
                                            borderColor: 'divider'
                                        })
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Qty: {item.quantity || 1}
                                            </Typography>
                                            
                                            {/* Show configuration status */}
                                            {serviceDetails[item._id] && (
                                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={calculateCompletionPercentage(item)}
                                                        color={calculateCompletionPercentage(item) === 100 ? "success" : "primary"}
                                                        sx={{ 
                                                            width: '80px',
                                                            height: 6, 
                                                            borderRadius: 3,
                                                            mr: 1,
                                                            backgroundColor: 'rgba(145, 158, 171, 0.16)'
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {calculateCompletionPercentage(item)}% configured
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            £{(item.price * (item.quantity || 1)).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </Box>
                            ))}
                            
                            {/* Order totals */}
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                        <Typography variant="body2">
                                            £{cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                    
                                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                                        <Typography variant="subtitle1">Total</Typography>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                                £{(cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Box>
                    </Card>
                    
                    {/* Help card */}
                    <Card sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                        backgroundColor: 'info.lighter'
                    }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.dark' }}>
                            Need Help?
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'info.dark', mb: 2 }}>
                            If you need assistance with configuring your services, please contact our support team.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            color="info"
                            size="small"
                            fullWidth
                        >
                            Contact Support
                        </Button>
                    </Card>
                </Box>
            </Grid>
        </Grid>
    );
}

// No longer need propTypes since we're using context directly