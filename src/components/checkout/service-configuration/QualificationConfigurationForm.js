import React, { useState } from 'react';
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
    Chip,
    Divider,
    Switch,
    FormControlLabel,
    Collapse
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// import SchoolIcon from '@mui/icons-material/School';
// import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const QualificationConfigurationForm = ({ service, details, onUpdate }) => {
    const qualificationDetails = details?.qualificationDetails || {};

    // State for optional field toggles
    const [showPriorExperience, setShowPriorExperience] = useState(!!qualificationDetails.priorExperience);
    const [showVerificationDocs, setShowVerificationDocs] = useState(
        !!(qualificationDetails.verificationDocuments && qualificationDetails.verificationDocuments.length > 0)
    );

    // Handler for updating qualification details
    const handleUpdate = (updatedDetails) => {
        onUpdate({
            qualificationDetails: {
                ...qualificationDetails,
                ...updatedDetails
            }
        });
    };

    // Handler for document updates
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

                {/* Qualification level selection */}
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
                    </Select>
                    <FormHelperText>Select your desired qualification level</FormHelperText>
                </FormControl>

                {/* Trade/occupation field */}
                <FormControl fullWidth required>
                    <InputLabel>Trade/Occupation</InputLabel>
                    <Select
                        value={qualificationDetails.trade || ''}
                        onChange={(e) => handleUpdate({ trade: e.target.value })}
                        label="Trade/Occupation"
                    >
                        <MenuItem value="Bricklaying">Bricklaying</MenuItem>
                        <MenuItem value="Carpentry">Carpentry</MenuItem>
                        <MenuItem value="Electrical">Electrical</MenuItem>
                        <MenuItem value="Plastering">Plastering</MenuItem>
                        <MenuItem value="Plumbing">Plumbing</MenuItem>
                        <MenuItem value="Scaffolding">Scaffolding</MenuItem>
                        <MenuItem value="Site Supervision">Site Supervision</MenuItem>
                        <MenuItem value="Construction Management">Construction Management</MenuItem>
                    </Select>
                    <FormHelperText>Select the trade for this qualification</FormHelperText>
                </FormControl>

                {/* Preferred assessment date */}
                <DatePicker
                    label="Preferred Assessment Date"
                    value={qualificationDetails.assessmentDate ? new Date(qualificationDetails.assessmentDate) : null}
                    onChange={(date) => handleUpdate({ assessmentDate: date ? date.toISOString() : null })}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            helperText: "When would you prefer the assessor to visit (if applicable)"
                        }
                    }}
                />

                {/* Current employer */}
                <TextField
                    fullWidth
                    label="Current Employer"
                    value={qualificationDetails.employer || ''}
                    onChange={(e) => handleUpdate({ employer: e.target.value })}
                    helperText="Your current employer or 'Self-employed'"
                />

                {/* Prior experience toggle */}
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
                    label="Add Details of Prior Experience"
                />

                <Collapse in={showPriorExperience}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Prior Experience"
                        value={qualificationDetails.priorExperience || ''}
                        onChange={(e) => handleUpdate({ priorExperience: e.target.value })}
                        placeholder="Describe your relevant experience in this trade"
                        helperText="This helps the assessor understand your background and experience level"
                    />
                </Collapse>

                <Divider />

                {/* Verification documents toggle */}
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
                                    label="Document 1"
                                    placeholder="e.g., Previous Qualifications, Certificates"
                                    value={qualificationDetails.verificationDocuments?.[0] || ''}
                                    onChange={(e) => handleDocumentUpdate(0, e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    label="Document 2"
                                    placeholder="e.g., Work Experience Evidence"
                                    value={qualificationDetails.verificationDocuments?.[1] || ''}
                                    onChange={(e) => handleDocumentUpdate(1, e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    label="Document 3"
                                    placeholder="e.g., Portfolio, Work Examples"
                                    value={qualificationDetails.verificationDocuments?.[2] || ''}
                                    onChange={(e) => handleDocumentUpdate(2, e.target.value)}
                                />
                            </Stack>
                        </Paper>
                    </Box>
                </Collapse>

                {/* Information paper */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter', borderColor: 'info.light' }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <InfoOutlinedIcon color="info" sx={{ mt: 0.5 }} />
                        <Stack>
                            <Typography variant="body2">
                                Important information about NVQ qualifications:
                            </Typography>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li><Typography variant="body2">Assessment is conducted in your workplace</Typography></li>
                                <li><Typography variant="body2">An assessor will contact you to arrange the assessment</Typography></li>
                                <li><Typography variant="body2">You'll need to provide evidence of your skills and experience</Typography></li>
                                <li><Typography variant="body2">Qualifications typically take 1-6 months to complete</Typography></li>
                            </ul>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Requirements chip section */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Requirements for this qualification:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                            size="small"
                            label="Current employment in trade"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label="Work evidence portfolio"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label="Access to worksite"
                            variant="outlined"
                            color="primary"
                        />
                        {qualificationDetails.level?.includes('3') && (
                            <Chip
                                size="small"
                                label="Supervisory experience"
                                variant="outlined"
                                color="warning"
                            />
                        )}
                        {(qualificationDetails.level?.includes('4') || qualificationDetails.level?.includes('5') || qualificationDetails.level?.includes('6')) && (
                            <Chip
                                size="small"
                                label="Management experience"
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

QualificationConfigurationForm.propTypes = {
    service: PropTypes.object.isRequired,
    details: PropTypes.object,
    onUpdate: PropTypes.func.isRequired
};

export default QualificationConfigurationForm;