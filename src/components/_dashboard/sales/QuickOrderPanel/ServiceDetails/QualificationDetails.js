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
  FormHelperText,
  Switch,
  Collapse
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

/**
 * Component for rendering qualification service details form
 * Updated to make verification of documents optional
 */
const QualificationDetails = ({ service, details, onUpdate }) => {
  const serviceId = service._id || service.id;
  const qualificationDetails = details?.qualificationDetails || {};
  
  // State for optional field toggles
  const [showRegNumber, setShowRegNumber] = useState(!!qualificationDetails.registrationNumber);
  const [showAwardingBody, setShowAwardingBody] = useState(!!qualificationDetails.awardingBody);
  const [showPriorExperience, setShowPriorExperience] = useState(!!qualificationDetails.priorExperience);
  const [showVerificationDocs, setShowVerificationDocs] = useState(
    !!(qualificationDetails.verificationDocuments && qualificationDetails.verificationDocuments.length > 0)
  );

  const handleUpdate = (updatedQualificationDetails) => {
    onUpdate(serviceId, {
      ...details,
      qualificationDetails: {
        ...qualificationDetails,
        ...updatedQualificationDetails
      }
    });
  };

  const handleDocumentUpdate = (index, value) => {
    const newDocs = [...(qualificationDetails.verificationDocuments || [])];
    newDocs[index] = value;
    handleUpdate({ verificationDocuments: newDocs });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Typography variant="subtitle2" gutterBottom>
          Qualification Information
        </Typography>
        
        <FormControl fullWidth required>
          <InputLabel>Qualification Level</InputLabel>
          <Select
            value={qualificationDetails.level || ''}
            onChange={(e) => handleUpdate({ level: e.target.value })}
            label="Qualification Level"
          >
            <MenuItem value="NVQ Level 1">NVQ Level 1</MenuItem>
            <MenuItem value="NVQ Level 2">NVQ Level 2</MenuItem>
            <MenuItem value="NVQ Level 3">NVQ Level 3</MenuItem>
            <MenuItem value="NVQ Level 4">NVQ Level 4</MenuItem>
            <MenuItem value="NVQ Level 5">NVQ Level 5</MenuItem>
            <MenuItem value="NVQ Level 6">NVQ Level 6</MenuItem>
            <MenuItem value="NVQ Level 7">NVQ Level 7</MenuItem>
            <MenuItem value="NVQ Level 8">NVQ Level 8</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          <FormHelperText>Select the qualification level</FormHelperText>
        </FormControl>
        
        {qualificationDetails.level === 'Other' && (
          <TextField
            fullWidth
            label="Specify Qualification Level *"
            value={qualificationDetails.otherLevel || ''}
            onChange={(e) => handleUpdate({ otherLevel: e.target.value })}
            required
          />
        )}
        
        <FormControl fullWidth required>
          <InputLabel>Qualification Type</InputLabel>
          <Select
            value={qualificationDetails.type || ''}
            onChange={(e) => handleUpdate({ type: e.target.value })}
            label="Qualification Type"
          >
            <MenuItem value="Construction">Construction</MenuItem>
            <MenuItem value="Plumbing">Plumbing</MenuItem>
            <MenuItem value="Electrical">Electrical</MenuItem>
            <MenuItem value="Carpentry">Carpentry</MenuItem>
            <MenuItem value="Bricklaying">Bricklaying</MenuItem>
            <MenuItem value="Plastering">Plastering</MenuItem>
            <MenuItem value="Painting & Decorating">Painting & Decorating</MenuItem>
            <MenuItem value="Scaffolding">Scaffolding</MenuItem>
            <MenuItem value="Plant Operations">Plant Operations</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
          <FormHelperText>Select the qualification type</FormHelperText>
        </FormControl>
        
        {qualificationDetails.type === 'Other' && (
          <TextField
            fullWidth
            label="Specify Qualification Type *"
            value={qualificationDetails.otherType || ''}
            onChange={(e) => handleUpdate({ otherType: e.target.value })}
            required
          />
        )}
        
        <FormControlLabel
          control={
            <Switch
              checked={showRegNumber}
              onChange={(e) => {
                setShowRegNumber(e.target.checked);
                if (!e.target.checked) handleUpdate({ registrationNumber: '' });
              }}
              color="primary"
            />
          }
          label="Add Registration Number"
        />
        
        <Collapse in={showRegNumber}>
          <TextField
            fullWidth
            label="Registration Number"
            value={qualificationDetails.registrationNumber || ''}
            onChange={(e) => handleUpdate({ registrationNumber: e.target.value })}
            helperText="Registration number if already assigned"
          />
        </Collapse>
        
        <FormControlLabel
          control={
            <Switch
              checked={showAwardingBody}
              onChange={(e) => {
                setShowAwardingBody(e.target.checked);
                if (!e.target.checked) handleUpdate({ awardingBody: '' });
              }}
              color="primary"
            />
          }
          label="Add Awarding Body"
        />
        
        <Collapse in={showAwardingBody}>
          <TextField
            fullWidth
            label="Awarding Body"
            value={qualificationDetails.awardingBody || ''}
            onChange={(e) => handleUpdate({ awardingBody: e.target.value })}
            placeholder="e.g., City & Guilds, CITB, etc."
          />
        </Collapse>
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={qualificationDetails.fastTrack || false}
                onChange={(e) => handleUpdate({ fastTrack: e.target.checked })}
              />
            }
            label="Fast Track Assessment"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={qualificationDetails.requiresAssessor || false}
                onChange={(e) => handleUpdate({ requiresAssessor: e.target.checked })}
              />
            }
            label="Requires Assessor Visit"
          />
        </Box>
        
        {qualificationDetails.requiresAssessor && (
          <DatePicker
            label="Preferred Assessment Date"
            value={qualificationDetails.assessmentDate ? new Date(qualificationDetails.assessmentDate) : null}
            onChange={(date) => handleUpdate({ 
              assessmentDate: date ? date.toISOString().split('T')[0] : '' 
            })}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                helperText="Preferred date for assessor visit"
              />
            )}
          />
        )}
        
        <FormControlLabel
          control={
            <Switch
              checked={showPriorExperience}
              onChange={(e) => {
                setShowPriorExperience(e.target.checked);
                if (!e.target.checked) handleUpdate({ priorExperience: '' });
              }}
              color="primary"
            />
          }
          label="Add Prior Experience"
        />
        
        <Collapse in={showPriorExperience}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Prior Experience"
            value={qualificationDetails.priorExperience || ''}
            onChange={(e) => handleUpdate({ priorExperience: e.target.value })}
            placeholder="Relevant experience in this field"
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
              Document verification can be completed later by the services team if not available now.
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Document 1"
                  placeholder="e.g., ID, Previous Certificates"
                  value={qualificationDetails.verificationDocuments?.[0] || ''}
                  onChange={(e) => handleDocumentUpdate(0, e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Document 2"
                  placeholder="e.g., Proof of Address, Employment Records"
                  value={qualificationDetails.verificationDocuments?.[1] || ''}
                  onChange={(e) => handleDocumentUpdate(1, e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Document 3"
                  placeholder="e.g., Portfolio, Work Evidence"
                  value={qualificationDetails.verificationDocuments?.[2] || ''}
                  onChange={(e) => handleDocumentUpdate(2, e.target.value)}
                />
              </Stack>
            </Paper>
          </Box>
        </Collapse>
      </Stack>
    </LocalizationProvider>
  );
};

export default QualificationDetails;