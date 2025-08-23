import { useContext, useEffect, useState } from 'react';
import { CheckoutContext } from '../../pages/EcommerceCheckout';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
    Box,
    Grid,
    Card,
    Button,
    TextField,
    Typography,
    Stack,
    Divider,
    // FormHelperText,
    InputAdornment,
    FormControlLabel,
    Switch,
    FormControl,
    // InputLabel,
    // Select,
    // MenuItem,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import arrowIosBackFill from '@iconify/icons-eva/arrow-ios-back-fill';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { enGB } from 'date-fns/locale';
import validator from 'validator';
import UserService from '../../services/user';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import mapboxgl from 'mapbox-gl';

// Customer type constants - matching the staff system
const CUSTOMER_TYPE = {
    INDIVIDUAL: 'INDIVIDUAL',
    COMPANY: 'COMPANY'
};

export default function CheckoutCustomerDetails() {
    // Get checkout context for navigation
    const { handleNext, handleBack } = useContext(CheckoutContext);
    
    // Get authentication context to access user profile
    const { user, isAuthenticated } = useAuth() || { user: null, isAuthenticated: false };
    
    // Use CartContext for all cart-related operations
    const { 
        customer,
        updateCustomerInfo
    } = useCart();

    // Enhanced customer info state with more comprehensive fields
    const [customerInfo, setCustomerInfo] = useState({
        customerType: CUSTOMER_TYPE.INDIVIDUAL,
        // Individual fields
        firstName: '',
        lastName: '',
        // Company fields
        companyName: '',
        companyRegNumber: '',
        // Common fields
        email: '',
        phoneNumber: '',
        dob: null,
        niNumber: '',
        address: '',
        city: '',
        postcode: '',
        // Additional preferences
        saveDetails: true,
        marketingConsent: false
    });

    const [errors, setErrors] = useState({});
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [lookupError, setLookupError] = useState('');

    useEffect(() => {
        const loadSavedCustomerInfo = async () => {
            try {
                let customerData = {};
                
                // Priority 1: If user is authenticated, use their profile data
                if (isAuthenticated && user) {
                    console.log('Using authenticated user profile data', user);
                    // Map authenticated user data to our customer info format
                    customerData = {
                        customerType: CUSTOMER_TYPE.INDIVIDUAL,
                        firstName: user.firstName || user.name?.split(' ')[0] || '',
                        lastName: user.lastName || (user.name?.split(' ').slice(1).join(' ')) || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || user.phone || '',
                        address: user.address || '',
                        city: user.city || '',
                        postcode: user.zipcode || user.postcode || '',
                        saveDetails: true,
                        marketingConsent: user.marketingConsent || false
                    };
                } 
                // Priority 2: Get any saved customer info from previous sessions
                else {
                    const savedUser = await UserService.getBillingUser();
                    if (savedUser) {
                        console.log('Using saved billing user data', savedUser);
                        customerData = {
                            customerType: savedUser.customerType || CUSTOMER_TYPE.INDIVIDUAL,
                            firstName: savedUser.firstName || '',
                            lastName: savedUser.lastName || '',
                            companyName: savedUser.companyName || '',
                            companyRegNumber: savedUser.companyRegNumber || '',
                            email: savedUser.email || '',
                            phoneNumber: savedUser.phoneNumber || '',
                            dob: savedUser.dob ? new Date(savedUser.dob) : null,
                            niNumber: savedUser.NINumber || '',
                            address: savedUser.address || '',
                            city: savedUser.city || '',
                            postcode: savedUser.zipcode || '',
                            saveDetails: true,
                            marketingConsent: savedUser.marketingConsent || false
                        };
                    }
                }
                
                // Apply the customer data if we have any
                if (Object.keys(customerData).length > 0) {
                    setCustomerInfo(prev => ({
                        ...prev,
                        ...customerData
                    }));
                }

                // Priority 3: If we have customer data from CartContext, use that (overrides previous data)
                if (customer && Object.keys(customer).length > 0) {
                    console.log('Using CartContext customer info', customer);
                    setCustomerInfo(prev => ({
                        ...prev,
                        ...customer
                    }));
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadSavedCustomerInfo();
    }, [customer, isAuthenticated, user]);

    // Initialize Mapbox (you can move this to a common config file later)
    // Make sure to use your own token or environment variable
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibmV4Y21hcCIsImEiOiJjbTY5N3Q4OTgwODduMmxzY2s5aDA0bXp1In0.wnyDsAjgVJw794zpvWf93g';

    // Add this function to fetch address from postcode
    const fetchAddressFromPostcode = async (postcode) => {
        setLookupError('');
        setIsLoadingAddress(true);

        try {
            // Use Mapbox Geocoding API to get address suggestions
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?country=GB&types=postcode&access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                // Get detailed address using the coordinates
                const [lng, lat] = feature.center;
                const detailResponse = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address&access_token=${mapboxgl.accessToken}`
                );
                const detailData = await detailResponse.json();

                // Extract address suggestions
                const suggestions = detailData.features.map(f => ({
                    fullAddress: f.place_name,
                    coordinates: f.center,
                    context: f.context
                }));

                setAddressSuggestions(suggestions);

                // Auto-fill the first address if available
                if (suggestions.length > 0) {
                    const addressParts = suggestions[0].fullAddress.split(',');

                    // Extract city from context if available
                    let city = '';
                    const contextItem = suggestions[0].context?.find(c => c.id.startsWith('place.'));
                    if (contextItem) {
                        city = contextItem.text;
                    }

                    setCustomerInfo(prev => ({
                        ...prev,
                        address: addressParts[0].trim(),
                        city: city || (addressParts.length > 1 ? addressParts[1].trim() : ''),
                    }));
                }
            } else {
                setLookupError('No address found for this postcode');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setLookupError('Failed to fetch address from postcode');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // Add a debounced version to prevent too many API calls
    const debouncedPostcodeLookup = debounce((postcode) => {
        if (postcode.length >= 5 && isValidUKPostcode(postcode)) {
            fetchAddressFromPostcode(postcode);
        }
    }, 1000);

    // Handle input changes with UK formatting support
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format specific fields
        if (name === 'phoneNumber') {
            formattedValue = formatUKPhone(value);
        } else if (name === 'niNumber') {
            formattedValue = formatNINumber(value);
        }

        setCustomerInfo(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }

        // Trigger address lookup when postcode changes
        if (name === 'postcode') {
            debouncedPostcodeLookup(value);
        }
    };

    // Format UK phone numbers for better UX
    const formatUKPhone = (phone) => {
        // Remove non-digit characters for processing
        const digits = phone.replace(/\D/g, '');

        // Don't format if too short
        if (digits.length < 3) return phone;

        // Handle common UK formats
        if (digits.startsWith('07')) {
            // Mobile: 07XXX XXX XXX
            return digits.replace(/(\d{0,5})(\d{0,3})(\d{0,3})/, (match, p1, p2, p3) => {
                let result = p1;
                if (p2) result += ' ' + p2;
                if (p3) result += ' ' + p3;
                return result;
            }).trim();
        } else if (digits.startsWith('02')) {
            // London: 020 XXXX XXXX
            return digits.replace(/(\d{0,3})(\d{0,4})(\d{0,4})/, (match, p1, p2, p3) => {
                let result = p1;
                if (p2) result += ' ' + p2;
                if (p3) result += ' ' + p3;
                return result;
            }).trim();
        }

        // Default format
        return phone;
    };

    // Format NI numbers for better UX
    const formatNINumber = (ni) => {
        // Remove spaces for processing
        const clean = ni.replace(/\s/g, '').toUpperCase();

        // Don't format if too short
        if (clean.length < 3) return ni;

        // Format as AB 12 34 56 C
        return clean.replace(/^([A-Z]{0,2})(\d{0,2})(\d{0,2})(\d{0,2})([A-Z]?)$/, (match, p1, p2, p3, p4, p5) => {
            let result = p1;
            if (p2) result += ' ' + p2;
            if (p3) result += ' ' + p3;
            if (p4) result += ' ' + p4;
            if (p5) result += ' ' + p5;
            return result;
        }).trim();
    };

    // // Handle customer type change
    // const handleCustomerTypeChange = (e) => {
    //     setCustomerInfo(prev => ({
    //         ...prev,
    //         customerType: e.target.value
    //     }));
    // };

    // Rest of your existing methods...
    const handleDobChange = (date) => {
        setCustomerInfo(prev => ({
            ...prev,
            dob: date
        }));

        if (errors.dob) {
            setErrors(prev => ({ ...prev, dob: null }));
        }
    };

    // Enhanced validation for UK-specific formats
    const validateForm = () => {
        const newErrors = {};

        // Always validate personal information fields for individuals
        if (customerInfo.customerType === CUSTOMER_TYPE.INDIVIDUAL) {
            if (!customerInfo.firstName?.trim()) newErrors.firstName = 'First name is required';
            if (!customerInfo.lastName?.trim()) newErrors.lastName = 'Last name is required';
            if (!customerInfo.dob) newErrors.dob = 'Date of birth is required';
        } 
        // For company type, validate company fields and contact person fields
        else {
            if (!customerInfo.companyName?.trim()) newErrors.companyName = 'Company name is required';
            if (!customerInfo.companyRegNumber?.trim()) newErrors.companyRegNumber = 'Registration number is required';
            
            // Contact person information is optional for companies but validate if provided
            if (customerInfo.firstName?.trim() && !customerInfo.lastName?.trim()) {
                newErrors.lastName = 'Please provide last name of contact person';
            }
        }

        // Common field validations
        if (!customerInfo.email?.trim()) newErrors.email = 'Email is required';
        else if (!validator.isEmail(customerInfo.email)) newErrors.email = 'Invalid email address';

        if (!customerInfo.phoneNumber?.trim()) newErrors.phoneNumber = 'Contact number is required';
        else if (!isValidUKPhone(customerInfo.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid contact number';

        if (!customerInfo.address?.trim()) newErrors.address = 'Address is required';
        if (!customerInfo.postcode?.trim()) newErrors.postcode = 'Postcode is required';
        else if (!isValidUKPostcode(customerInfo.postcode)) newErrors.postcode = 'Please enter a valid UK postcode';
        
        // City is optional, but validate if provided
        if (customerInfo.city?.trim() === '') {
            // Auto-populate city with a default value if empty
            setCustomerInfo(prev => ({
                ...prev,
                city: 'London' // Default city
            }));
        }

        if (customerInfo.niNumber?.trim() && !isValidNINumber(customerInfo.niNumber)) {
            newErrors.niNumber = 'Please enter a valid NI number (e.g., AB 12 34 56 C)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Contact number validation with relaxed rules
    const isValidUKPhone = (phone) => {
        const cleanPhone = phone.replace(/\s+/g, '');
        
        // Basic validation - at least 10 digits, allowing for country code
        if (cleanPhone.length < 10) return false;
        
        // Check if it has a reasonable number of digits (allowing international numbers)
        if (cleanPhone.length > 15) return false;
        
        // Make sure it's mostly digits (allowing for + at the beginning)
        const validChars = /^\+?[0-9]+$/;
        return validChars.test(cleanPhone);
    };

    const isValidUKPostcode = (postcode) => {
        return validator.matches(
            postcode.toUpperCase(),
            /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/
        );
    };

    const isValidNINumber = (ni) => {
        const cleanNi = ni.replace(/\s+/g, '').toUpperCase();
        return /^[A-Z]{2}[0-9]{6}[A-Z]$/.test(cleanNi);
    };

    // Proceed to next step
    const handleContinue = async () => {
        if (validateForm()) {
            // For user storage and consistent API, create a consolidated object
            const userDataForStorage = {
                customerType: customerInfo.customerType,
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                companyName: customerInfo.companyName,
                companyRegNumber: customerInfo.companyRegNumber,
                // For compatibility with existing code
                name: customerInfo.customerType === CUSTOMER_TYPE.INDIVIDUAL
                    ? `${customerInfo.firstName} ${customerInfo.lastName}`.trim()
                    : customerInfo.companyName,
                email: customerInfo.email,
                phoneNumber: customerInfo.phoneNumber,
                dob: customerInfo.dob,
                NINumber: customerInfo.niNumber,
                address: customerInfo.address,
                city: customerInfo.city,
                zipcode: customerInfo.postcode,
                marketingConsent: customerInfo.marketingConsent
            };

            // Save to CartContext instead of CheckoutContext
            try {
                const result = await updateCustomerInfo(userDataForStorage);
                if (!result.success) {
                    console.error('Error updating customer info:', result.error);
                    setErrors({ submit: result.error || 'Failed to save customer information' });
                    return;
                }

                // Only save to persistent storage if user opted in
                if (customerInfo.saveDetails) {
                    try {
                        await UserService.createUser(userDataForStorage);
                    } catch (error) {
                        console.error('Error saving user data:', error);
                        // Continue anyway since we saved to CartContext
                    }
                }

                // Proceed to next step
                handleNext();
            } catch (error) {
                console.error('Error in customer info update:', error);
                setErrors({ submit: 'An unexpected error occurred. Please try again.' });
            }
        }
    };

    // Add a manual lookup handler
    const handlePostcodeLookup = () => {
        if (customerInfo.postcode?.trim()) {
            fetchAddressFromPostcode(customerInfo.postcode);
        }
    };

    // Render the form
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                {/* Customer Type Selection Card */}
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Customer Type
                    </Typography>

                    <FormControl component="fieldset">
                        <Stack direction="row" spacing={4}>
                            <FormControlLabel
                                value={CUSTOMER_TYPE.INDIVIDUAL}
                                control={
                                    <Switch
                                        checked={customerInfo.customerType === CUSTOMER_TYPE.INDIVIDUAL}
                                        onChange={() => setCustomerInfo(prev => ({
                                            ...prev,
                                            customerType: CUSTOMER_TYPE.INDIVIDUAL
                                        }))}
                                        color="primary"
                                    />
                                }
                                label="Individual"
                            />

                            <FormControlLabel
                                value={CUSTOMER_TYPE.COMPANY}
                                control={
                                    <Switch
                                        checked={customerInfo.customerType === CUSTOMER_TYPE.COMPANY}
                                        onChange={() => setCustomerInfo(prev => ({
                                            ...prev,
                                            customerType: CUSTOMER_TYPE.COMPANY
                                        }))}
                                        color="primary"
                                    />
                                }
                                label="Company"
                            />
                        </Stack>
                    </FormControl>
                </Card>

                {/* Personal/Company Information */}
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {customerInfo.customerType === CUSTOMER_TYPE.INDIVIDUAL
                            ? 'Personal Information'
                            : 'Company Information'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {customerInfo.customerType === CUSTOMER_TYPE.INDIVIDUAL
                            ? 'Please provide your personal details for this purchase'
                            : 'Please provide your company details for this purchase'}
                    </Typography>

                    <Stack spacing={3}>
                        {customerInfo.customerType === CUSTOMER_TYPE.INDIVIDUAL ? (
                            // Individual customer form fields
                            <>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={customerInfo.firstName || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={customerInfo.lastName || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                        required
                                    />
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
                                        <DatePicker
                                            label="Date of Birth"
                                            value={customerInfo.dob}
                                            onChange={handleDobChange}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.dob,
                                                    helperText: errors.dob,
                                                    required: true
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>

                                    <TextField
                                        fullWidth
                                        label="NI Number"
                                        name="niNumber"
                                        value={customerInfo.niNumber || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.niNumber}
                                        helperText={errors.niNumber || "Format: AB 12 34 56 C"}
                                        placeholder="AB 12 34 56 C"
                                    />
                                </Stack>
                            </>
                        ) : (
                            // Company customer form fields
                            <>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    name="companyName"
                                    value={customerInfo.companyName || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.companyName}
                                    helperText={errors.companyName}
                                    required
                                />

                                <TextField
                                    fullWidth
                                    label="Company Registration Number"
                                    name="companyRegNumber"
                                    value={customerInfo.companyRegNumber || ''}
                                    onChange={handleInputChange}
                                    error={!!errors.companyRegNumber}
                                    helperText={errors.companyRegNumber}
                                    required
                                />
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Typography variant="subtitle2" gutterBottom>
                                    Contact Person Information (Optional)
                                </Typography>
                                
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={customerInfo.firstName || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={customerInfo.lastName || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                    />
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
                                        <DatePicker
                                            label="Date of Birth (Optional)"
                                            value={customerInfo.dob}
                                            onChange={handleDobChange}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.dob,
                                                    helperText: errors.dob
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>

                                    <TextField
                                        fullWidth
                                        label="NI Number (Optional)"
                                        name="niNumber"
                                        value={customerInfo.niNumber || ''}
                                        onChange={handleInputChange}
                                        error={!!errors.niNumber}
                                        helperText={errors.niNumber || "Format: AB 12 34 56 C"}
                                        placeholder="AB 12 34 56 C"
                                    />
                                </Stack>
                            </>
                        )}

                        {/* Common fields for both types */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                value={customerInfo.email || ''}
                                onChange={handleInputChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Contact Number"
                                name="phoneNumber"
                                value={customerInfo.phoneNumber || ''}
                                onChange={handleInputChange}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber || "e.g., 07123 456 789 or international format"}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">+</InputAdornment>,
                                }}
                                required
                            />
                        </Stack>
                    </Stack>
                </Card>

                {/* Rest of your existing Address section */}
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Address Information
                    </Typography>

                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                            <TextField
                                sx={{ flexGrow: 1 }}
                                label="Postcode"
                                name="postcode"
                                value={customerInfo.postcode || ''}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    // Auto-lookup when postcode is entered and valid
                                    if (e.target.value.length >= 5 && isValidUKPostcode(e.target.value)) {
                                        debouncedPostcodeLookup(e.target.value);
                                    }
                                }}
                                error={!!errors.postcode || !!lookupError}
                                helperText={(errors.postcode || lookupError || "Enter a postcode to auto-fill your address")}
                                required
                                placeholder="e.g. SW1A 1AA"
                            />
                            <Button
                                variant="contained"
                                onClick={handlePostcodeLookup}
                                disabled={!customerInfo.postcode || isLoadingAddress}
                                startIcon={isLoadingAddress ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                sx={{ mt: { xs: 1, sm: 0 }, height: '56px' }}
                            >
                                Find Address
                            </Button>
                        </Stack>
                        
                        {isLoadingAddress && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Looking up address...
                                </Typography>
                            </Box>
                        )}

                        {addressSuggestions.length > 0 && (
                            <Autocomplete
                                fullWidth
                                options={addressSuggestions}
                                getOptionLabel={(option) => option.fullAddress}
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        const addressParts = newValue.fullAddress.split(',');

                                        // Extract city from context if available
                                        let city = '';
                                        const contextItem = newValue.context?.find(c => c.id.startsWith('place.'));
                                        if (contextItem) {
                                            city = contextItem.text;
                                        }

                                        setCustomerInfo(prev => ({
                                            ...prev,
                                            address: addressParts[0].trim(),
                                            city: city || (addressParts.length > 1 ? addressParts[1].trim() : ''),
                                        }));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Address"
                                        fullWidth
                                    />
                                )}
                            />
                        )}

                        <TextField
                            label="Address"
                            name="address"
                            multiline
                            rows={2}
                            value={customerInfo.address || ''}
                            onChange={handleInputChange}
                            error={!!errors.address}
                            helperText={errors.address}
                            required
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={customerInfo.city || ''}
                                onChange={handleInputChange}
                                error={!!errors.city}
                                helperText={errors.city}
                            />
                        </Stack>

                        {/* Preferences section remains the same */}
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Preferences
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={customerInfo.saveDetails}
                                        onChange={(e) => setCustomerInfo(prev => ({
                                            ...prev,
                                            saveDetails: e.target.checked
                                        }))}
                                        color="primary"
                                    />
                                }
                                label="Save my details for future purchases"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={customerInfo.marketingConsent}
                                        onChange={(e) => setCustomerInfo(prev => ({
                                            ...prev,
                                            marketingConsent: e.target.checked
                                        }))}
                                        color="primary"
                                    />
                                }
                                label="I would like to receive updates about services and promotions"
                            />
                        </Box>
                    </Stack>
                </Card>
            </Grid>

            {/* Information sidebar - keep this from your original */}
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, position: 'relative' }}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Why We Need This Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="subtitle2">Customer Type</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Selecting the correct customer type ensures we can provide the appropriate documentation and services for individuals or businesses.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2">Personal Details</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    We need your personal details to identify you and provide the services you've selected. Your email will be used for order confirmations.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2">Date of Birth</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Required for age verification for certain professional cards and certification requirements.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2">Contact Information</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your phone number allows us to contact you regarding your order or bookings.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2">NI Number</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Used for identification purposes on professional qualifications and cards.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Card>
            </Grid>

            {/* Navigation buttons */}
            <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between">
                    <Button
                        color="inherit"
                        startIcon={<Icon icon={arrowIosBackFill} />}
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Button
                        size="large"
                        variant="contained"
                        endIcon={<Icon icon={arrowIosForwardFill} />}
                        onClick={handleContinue}
                    >
                        Continue to Order Summary
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
}

// No longer need propTypes since we're using context directly