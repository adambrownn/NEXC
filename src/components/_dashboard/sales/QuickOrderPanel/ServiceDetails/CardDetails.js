import React, { useState } from 'react';
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
  Collapse
} from '@mui/material';

/**
 * Component for rendering card service details form
 * Updated to make document verification optional and remove recipient details
 */
const CardDetails = ({ service, details, onUpdate }) => {
  const serviceId = service._id || service.id;
  const cardDetails = details?.cardDetails || {};
  
  // State for optional field toggles
  const [showDeliveryLocation, setShowDeliveryLocation] = useState(!!cardDetails.deliveryLocation);
  const [showCardRegID, setShowCardRegID] = useState(!!cardDetails.cardRegID);
  const [showVerificationDocs, setShowVerificationDocs] = useState(
    !!(cardDetails.verificationDocuments && cardDetails.verificationDocuments.length > 0)
  );

  const handleUpdate = (updatedCardDetails) => {
    onUpdate(serviceId, {
      ...details,
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
          <MenuItem value="New">New</MenuItem>
          <MenuItem value="Duplicate">Duplicate</MenuItem>
          <MenuItem value="Renewal">Renewal</MenuItem>
        </Select>
        <FormHelperText>Select the type of card service required</FormHelperText>
      </FormControl>
      
      <FormControlLabel
        control={
          <Switch
            checked={showDeliveryLocation}
            onChange={(e) => {
              setShowDeliveryLocation(e.target.checked);
              if (!e.target.checked) handleUpdate({ deliveryLocation: '' });
            }}
            color="primary"
          />
        }
        label="Specify Alternate Delivery Location"
      />
      
      <Collapse in={showDeliveryLocation}>
        <TextField
          fullWidth
          label="Delivery Location"
          value={cardDetails.deliveryLocation || ''}
          onChange={(e) => handleUpdate({ deliveryLocation: e.target.value })}
          placeholder="Enter delivery address if different from customer address"
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
        label="Add Card Registration ID"
      />
      
      <Collapse in={showCardRegID}>
        <TextField
          fullWidth
          label="Card Registration ID"
          value={cardDetails.cardRegID || ''}
          onChange={(e) => handleUpdate({ cardRegID: e.target.value })}
          helperText="Individual ID linked to card"
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
            Document verification can be completed later by the services team if not available now
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Document 1"
                placeholder="e.g., ID, Passport, Driving License"
                value={cardDetails.verificationDocuments?.[0] || ''}
                onChange={(e) => handleDocumentUpdate(0, e.target.value)}
              />
              <TextField
                fullWidth
                label="Document 2"
                placeholder="e.g., Proof of Address, Utility Bill"
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

export default CardDetails;