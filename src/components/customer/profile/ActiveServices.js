import React from 'react';
import {
    Box,
    Card,
    Grid,
    Typography,
    Divider,
    LinearProgress,
    Chip,
    Stack,
    Button,
    Skeleton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { ServiceStatusTimeline } from './ServiceStatusTimeline';

// Helper function to get status configuration
const getStatusConfig = (status) => {
    const configs = {
        PENDING: { color: 'warning', label: 'Pending', icon: 'eva:clock-outline' },
        CONFIRMED: { color: 'info', label: 'Confirmed', icon: 'eva:checkmark-circle-outline' },
        IN_PROGRESS: { color: 'primary', label: 'In Progress', icon: 'eva:activity-outline' },
        COMPLETED: { color: 'success', label: 'Completed', icon: 'eva:checkmark-circle-2-outline' },
        CANCELLED: { color: 'error', label: 'Cancelled', icon: 'eva:close-circle-outline' },
    };
    return configs[status] || configs.PENDING;
};

// Helper function to get progress value based on status
const getProgressValue = (status) => {
    const values = {
        PENDING: 25,
        CONFIRMED: 50,
        IN_PROGRESS: 75,
        COMPLETED: 100,
        CANCELLED: 0
    };
    return values[status] || 0;
};

export default function ActiveServices({ services = [], isLoading }) {
    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {[...Array(2)].map((_, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card sx={{ p: 3 }}>
                            <Skeleton variant="rectangular" width="100%" height={200} />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (services.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <Icon icon="eva:alert-triangle-outline" width={60} height={60} style={{ opacity: 0.3 }} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    No active services found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    You don't have any ongoing services at the moment
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    href="/trades"
                    startIcon={<Icon icon="eva:plus-fill" />}
                >
                    Book New Service
                </Button>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {services.map((service) => {
                const statusConfig = getStatusConfig(service.status);
                const progressValue = getProgressValue(service.status);

                return (
                    <Grid item xs={12} md={6} key={service.id || service._id}>
                        <Card sx={{ p: 3, position: 'relative' }}>
                            {/* Service header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {service.serviceName || service.title || 'Service'}
                                </Typography>
                                <Chip
                                    icon={<Icon icon={statusConfig.icon} />}
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>

                            {/* Service details */}
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon icon="eva:pin-outline" width={20} height={20} style={{ marginRight: 8 }} />
                                    <Typography variant="body2">
                                        {service.location || 'Service location not specified'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Icon icon="eva:calendar-outline" width={20} height={20} style={{ marginRight: 8 }} />
                                    <Typography variant="body2">
                                        {service.appointmentDate
                                            ? format(new Date(service.appointmentDate), 'PPP, p')
                                            : 'Appointment date to be confirmed'}
                                    </Typography>
                                </Box>

                                {service.assignedTo && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Icon icon="eva:person-outline" width={20} height={20} style={{ marginRight: 8 }} />
                                        <Typography variant="body2">
                                            Assigned to: {service.assignedTo}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            {/* Progress indicator */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Progress</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{progressValue}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={progressValue}
                                    color={statusConfig.color}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>

                            {/* Service timeline */}
                            <ServiceStatusTimeline serviceId={service.id || service._id} />

                            {/* Action buttons */}
                            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Icon icon="eva:message-circle-outline" />}
                                    href="/contact-us"
                                >
                                    Contact
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<Icon icon="eva:eye-outline" />}
                                    href={`/service-details/${service.id || service._id}`}
                                >
                                    View Details
                                </Button>
                            </Stack>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}