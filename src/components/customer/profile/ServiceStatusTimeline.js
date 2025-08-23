import React, { useState, useEffect } from 'react';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { Typography, Box } from '@mui/material';
import { format } from 'date-fns';
import { Icon } from '@iconify/react';
import ServiceRequestService from '../../../services/ServiceRequestService';

export function ServiceStatusTimeline({ serviceId }) {
    const [statusHistory, setStatusHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatusHistory = async () => {
            try {
                setIsLoading(true);
                // Using the existing ServiceRequestService to get status history
                const response = await ServiceRequestService.getServiceStatusHistory(serviceId);

                // If no history yet, create a default item
                if (!response || response.length === 0) {
                    const service = await ServiceRequestService.getServiceDetails(serviceId);
                    if (service) {
                        setStatusHistory([{
                            status: 'PENDING',
                            statusLabel: 'Booking Created',
                            timestamp: service.createdAt || new Date(),
                            notes: 'Your booking has been received and is being processed.'
                        }]);
                    }
                } else {
                    setStatusHistory(response);
                }
            } catch (error) {
                console.error('Error loading status history:', error);
                // Set default status if error occurs
                setStatusHistory([{
                    status: 'PENDING',
                    statusLabel: 'Booking Created',
                    timestamp: new Date(),
                    notes: 'Your booking has been received.'
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        if (serviceId) {
            fetchStatusHistory();
        }
    }, [serviceId]);

    if (isLoading) {
        return (
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading status history...
                </Typography>
            </Box>
        );
    }

    if (statusHistory.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    No status updates yet
                </Typography>
            </Box>
        );
    }

    const getTimelineDotConfig = (status) => {
        const configs = {
            PENDING: { color: 'warning', icon: 'eva:clock-outline' },
            BOOKING_CREATED: { color: 'info', icon: 'eva:calendar-outline' },
            PAYMENT_RECEIVED: { color: 'warning', icon: 'eva:credit-card-outline' },
            ASSIGNED: { color: 'primary', icon: 'eva:person-outline' },
            SCHEDULED: { color: 'primary', icon: 'eva:clock-outline' },
            CONFIRMED: { color: 'info', icon: 'eva:checkmark-circle-outline' },
            IN_PROGRESS: { color: 'primary', icon: 'eva:activity-outline' },
            COMPLETED: { color: 'success', icon: 'eva:checkmark-circle-2-outline' },
            CANCELLED: { color: 'error', icon: 'eva:close-circle-outline' },
        };
        return configs[status] || { color: 'grey', icon: 'eva:alert-circle-outline' };
    };

    return (
        <Timeline position="right" sx={{
            p: 0,
            m: 0,
            '& .MuiTimelineItem-root:before': {
                flex: 0,
                padding: 0
            }
        }}>
            {statusHistory.map((item, index) => {
                const { color, icon } = getTimelineDotConfig(item.status);
                const isLast = index === statusHistory.length - 1;

                return (
                    <TimelineItem key={index}>
                        <TimelineSeparator>
                            <TimelineDot color={color} sx={{ p: 0.8 }}>
                                <Icon icon={icon} width={16} height={16} />
                            </TimelineDot>
                            {!isLast && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                            <Typography variant="body2" fontWeight={600}>
                                {item.statusLabel || item.status}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {format(new Date(item.timestamp), 'PPP, p')}
                            </Typography>
                            {item.notes && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {item.notes}
                                </Typography>
                            )}
                        </TimelineContent>
                    </TimelineItem>
                );
            })}
        </Timeline>
    );
}