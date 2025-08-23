import { useState, useEffect } from 'react';
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
    Divider,
    Box,
    Paper,
    Switch,
    FormControlLabel,
    Collapse,
    Grid,
    Button,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import mapboxgl from 'mapbox-gl';

const CardConfigurationForm = ({ service, details, onUpdate }) => {
    const cardDetails = details?.cardDetails || {};

    // State for optional field toggles
    const [showDeliveryLocation, setShowDeliveryLocation] = useState(!!cardDetails.deliveryLocation);
    const [showCardRegID, setShowCardRegID] = useState(!!cardDetails.cardRegID);
    const [showCITBTestingID, setShowCITBTestingID] = useState(!!cardDetails.citbTestingID);
    const [showVerificationDocs, setShowVerificationDocs] = useState(
        !!(cardDetails.verificationDocuments && cardDetails.verificationDocuments.length > 0)
    );
    
    // State for Mapbox address lookup
    const [postcode, setPostcode] = useState(cardDetails.deliveryPostcode || '');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    
    // Initialize Mapbox
    useEffect(() => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibmV4Y21hcCIsImEiOiJjbTY5N3Q4OTgwODduMmxzY2s5aDA0bXp1In0.wnyDsAjgVJw794zpvWf93g';
    }, []);

    const handleUpdate = (updatedCardDetails) => {
        onUpdate({
            cardDetails: {
                ...cardDetails,
                ...updatedCardDetails
            }
        });
    };

    const handleDocumentUpdate = (index, value) => {
        const newDocs = [...(cardDetails.verificationDocuments || [])];
        newDocs[index] = value;
        handleUpdate({ verificationDocuments: newDocs });
    };

    // Get card type options based on card category
    const getCardTypeOptions = () => {
        const baseOptions = [
            { value: 'New', label: 'New Card' },
            { value: 'Renewal', label: 'Renewal' },
            { value: 'Replacement', label: 'Replacement (Lost/Stolen)' }
        ];

        // Add specialized options for different card categories
        switch (service.category?.toLowerCase()) {
            case 'cisrs':
                return [
                    ...baseOptions,
                    { value: 'Temporary', label: 'Temporary Card' }
                ];
            default:
                return baseOptions;
        }
    };
    
    // Function to search for address by postcode using Mapbox
    const searchAddressByPostcode = async () => {
        if (!postcode.trim()) return;
        
        setIsSearchingAddress(true);
        setAddressSuggestions([]);
        
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
            }
        } catch (error) {
            console.error('Error searching for address:', error);
        } finally {
            setIsSearchingAddress(false);
        }
    };

    return (
        <Stack spacing={3}>
            <Typography variant="subtitle2" gutterBottom>
                Card Information
            </Typography>

            <FormControl fullWidth required>
                <InputLabel>Card Type</InputLabel>
                <Select
                    value={cardDetails.cardType || ''}
                    onChange={(e) => handleUpdate({ cardType: e.target.value })}
                    label="Card Type"
                >
                    {getCardTypeOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </Select>
                <FormHelperText>Select the type of card service required</FormHelperText>
            </FormControl>

            {cardDetails.cardType === 'Renewal' && (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter', borderColor: 'info.light' }}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <InfoOutlinedIcon color="info" sx={{ mt: 0.5 }} />
                                <Stack>
                                    <Typography variant="body2">
                                        For card renewals, please ensure you have:
                                    </Typography>
                                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                        <li><Typography variant="body2">Your current card details</Typography></li>
                                        <li><Typography variant="body2">Proof of continued competence</Typography></li>
                                        <li><Typography variant="body2">A recent digital photo</Typography></li>
                                    </ul>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            )}



            <FormControlLabel
                control={
                    <Switch
                        checked={showDeliveryLocation}
                        onChange={(e) => {
                            setShowDeliveryLocation(e.target.checked);
                            if (!e.target.checked) {
                                handleUpdate({ 
                                    deliveryLocation: '',
                                    deliveryPostcode: ''
                                });
                                setPostcode('');
                                setAddressSuggestions([]);
                            }
                        }}
                        color="primary"
                    />
                }
                label="Specify Alternate Delivery Location"
            />

            <Collapse in={showDeliveryLocation}>
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Find Address by Postcode
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    label="Delivery Postcode"
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value)}
                                    placeholder="Enter postcode to find address"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    variant="contained"
                                    onClick={searchAddressByPostcode}
                                    disabled={isSearchingAddress || !postcode.trim()}
                                    sx={{ height: '100%' }}
                                    fullWidth
                                >
                                    {isSearchingAddress ? 'Searching...' : 'Find'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                    
                    {addressSuggestions.length > 0 && (
                        <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', borderColor: 'primary.light' }}>
                            <List dense>
                                {addressSuggestions.map((address, index) => (
                                    <ListItem 
                                        button 
                                        key={index}
                                        onClick={() => {
                                            handleUpdate({ 
                                                deliveryLocation: address.fullAddress,
                                                deliveryPostcode: postcode
                                            });
                                            setAddressSuggestions([]);
                                        }}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'primary.lighter',
                                            }
                                        }}
                                    >
                                        <ListItemText 
                                            primary={address.fullAddress} 
                                            primaryTypographyProps={{
                                                variant: 'body2'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                    
                    <TextField
                        fullWidth
                        label="Delivery Location"
                        value={cardDetails.deliveryLocation || ''}
                        onChange={(e) => handleUpdate({ deliveryLocation: e.target.value })}
                        placeholder="Selected address or enter manually"
                        multiline
                        rows={2}
                    />
                </Stack>
            </Collapse>

            <FormControlLabel
                control={
                    <Switch
                        checked={showCITBTestingID}
                        onChange={(e) => {
                            setShowCITBTestingID(e.target.checked);
                            if (!e.target.checked) handleUpdate({ citbTestingID: '' });
                        }}
                        color="primary"
                    />
                }
                label="Add CITB Testing ID"
            />

            <Collapse in={showCITBTestingID}>
                <TextField
                    fullWidth
                    label="CITB Testing ID"
                    value={cardDetails.citbTestingID || ''}
                    onChange={(e) => handleUpdate({ citbTestingID: e.target.value })}
                    helperText="Your CITB Testing ID is required for card processing"
                />
            </Collapse>
            
            <FormControlLabel
                control={
                    <Switch
                        checked={showCardRegID}
                        onChange={(e) => {
                            setShowCardRegID(e.target.checked);
                            if (!e.target.checked) handleUpdate({ cardRegID: '' });
                        }}
                        color="primary"
                    />
                }
                label="Add Card Registration ID (If you have one)"
            />

            <Collapse in={showCardRegID}>
                <TextField
                    fullWidth
                    label="Card Registration ID"
                    value={cardDetails.cardRegID || ''}
                    onChange={(e) => handleUpdate({ cardRegID: e.target.value })}
                    helperText="If you have an existing card ID, enter it here"
                />
            </Collapse>

            <Divider />

            <FormControlLabel
                control={
                    <Switch
                        checked={showVerificationDocs}
                        onChange={(e) => {
                            setShowVerificationDocs(e.target.checked);
                            if (!e.target.checked) handleUpdate({ verificationDocuments: [] });
                        }}
                        color="primary"
                    />
                }
                label="Add Verification Documents"
            />

            <Collapse in={showVerificationDocs}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Document verification can be completed later after checkout if not available now
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="Qualification Document"
                                placeholder="e.g., Trade qualification or training certificate"
                                value={cardDetails.verificationDocuments?.[0] || ''}
                                onChange={(e) => handleDocumentUpdate(0, e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Additional Document"
                                placeholder="e.g., Any other supporting document"
                                value={cardDetails.verificationDocuments?.[1] || ''}
                                onChange={(e) => handleDocumentUpdate(1, e.target.value)}
                            />
                        </Stack>
                    </Paper>
                </Box>
            </Collapse>


        </Stack>
    );
};

CardConfigurationForm.propTypes = {
    service: PropTypes.object.isRequired,
    details: PropTypes.object,
    onUpdate: PropTypes.func.isRequired
};

export default CardConfigurationForm;