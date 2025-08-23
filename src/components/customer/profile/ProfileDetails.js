import React, { useState } from 'react';
import {
    Card,
    Box,
    Typography,
    Stack,
    TextField,
    Button,
    Grid,
    Divider,
    IconButton,
    Skeleton,
    InputAdornment
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import { salesService } from '../../../services/sales.service';

export default function ProfileDetails({ profile, isLoading }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const { enqueueSnackbar } = useSnackbar();

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit
            setIsEditing(false);
        } else {
            // Start edit - populate form with current data
            setFormData({
                name: profile?.name || '',
                email: profile?.email || '',
                phoneNumber: profile?.phoneNumber || '',
                address: profile?.address || '',
                postcode: profile?.postcode || '',
                dateOfBirth: profile?.dateOfBirth || '',
                NINumber: profile?.NINumber || '',
            });
            setIsEditing(true);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await salesService.updateCustomerDetails(profile.userId, formData);
            enqueueSnackbar('Profile updated successfully', { variant: 'success' });
            setIsEditing(false);
            // Force refresh of parent component by triggering a state change
            // This could be improved with a callback to the parent
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            enqueueSnackbar('Failed to update profile', { variant: 'error' });
        }
    };

    if (isLoading) {
        return (
            <Stack spacing={3}>
                {[...Array(5)].map((_, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Skeleton width="30%" height={24} />
                        <Skeleton width="100%" height={40} />
                    </Box>
                ))}
            </Stack>
        );
    }

    return (
        <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                <IconButton onClick={handleEditToggle}>
                    <Icon icon={isEditing ? "eva:close-outline" : "eva:edit-outline"} width={20} height={20} />
                </IconButton>
            </Box>

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="eva:email-outline" width={20} height={20} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="eva:phone-outline" width={20} height={20} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="eva:calendar-outline" width={20} height={20} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="eva:pin-outline" width={20} height={20} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Postcode"
                                name="postcode"
                                value={formData.postcode}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="National Insurance Number"
                                name="NINumber"
                                value={formData.NINumber}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={handleEditToggle}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Icon icon="eva:save-outline" width={20} height={20} />}
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            ) : (
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Full Name
                        </Typography>
                        <Typography variant="body1">{profile?.name || 'Not provided'}</Typography>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Email Address
                        </Typography>
                        <Typography variant="body1">{profile?.email || 'Not provided'}</Typography>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Phone Number
                        </Typography>
                        <Typography variant="body1">{profile?.phoneNumber || 'Not provided'}</Typography>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Address
                        </Typography>
                        <Typography variant="body1">{profile?.address || 'Not provided'}</Typography>
                        {profile?.postcode && (
                            <Typography variant="body2">Postcode: {profile.postcode}</Typography>
                        )}
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            Date of Birth
                        </Typography>
                        <Typography variant="body1">{profile?.dateOfBirth || 'Not provided'}</Typography>
                    </Box>

                    {profile?.NINumber && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                    National Insurance Number
                                </Typography>
                                <Typography variant="body1">{profile.NINumber}</Typography>
                            </Box>
                        </>
                    )}
                </Stack>
            )}
        </Card>
    );
}