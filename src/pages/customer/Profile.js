// src/pages/customer/Profile.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Tabs, Tab, Box } from '@mui/material';
import { Icon } from '@iconify/react';
import Page from '../../components/Page';
import { useSnackbar } from 'notistack';

// Import from your existing services
import AuthService from '../../services/auth.service';
import { salesService } from '../../services/sales.service';
import ServiceRequestService from '../../services/ServiceRequestService';

// These will be components we'll create
import ProfileHeader from '../../components/customer/profile/ProfileHeader';
import ProfileDetails from '../../components/customer/profile/ProfileDetails';
import ServiceHistory from '../../components/customer/profile/ServiceHistory';
import ActiveServices from '../../components/customer/profile/ActiveServices';
import NotificationSettings from '../../components/customer/profile/NotificationSettings';

export default function CustomerProfile() {
    const [currentTab, setCurrentTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState({ active: [], history: [] });
    const [isLoading, setIsLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?.userId;

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);

                // Get customer details using existing sales service
                const customerDetails = await salesService.getCustomerDetails(userId);
                setProfile(customerDetails);

                // Fetch services using existing ServiceRequestService
                const serviceRequests = await ServiceRequestService.getByCustomerId(userId);

                // Split into active and history
                const active = serviceRequests.filter(service =>
                    !['COMPLETED', 'CANCELLED'].includes(service.status)
                );
                const history = serviceRequests.filter(service =>
                    ['COMPLETED', 'CANCELLED'].includes(service.status)
                );

                setServices({ active, history });
            } catch (error) {
                console.error('Error fetching profile data:', error);
                enqueueSnackbar('Could not load profile data', { variant: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [userId, enqueueSnackbar]);

    const PROFILE_TABS = [
        {
            value: 'profile',
            icon: <Icon icon="eva:person-fill" width={20} height={20} />,
            component: <ProfileDetails profile={profile} isLoading={isLoading} />
        },
        {
            value: 'active-services',
            icon: <Icon icon="eva:activity-fill" width={20} height={20} />,
            component: <ActiveServices services={services.active} isLoading={isLoading} />
        },
        {
            value: 'service-history',
            icon: <Icon icon="eva:clock-fill" width={20} height={20} />,
            component: <ServiceHistory services={services.history} isLoading={isLoading} />
        },
        {
            value: 'notifications',
            icon: <Icon icon="eva:bell-fill" width={20} height={20} />,
            component: <NotificationSettings profile={profile} isLoading={isLoading} />
        }
    ];

    return (
        <Page title="My Profile | NEXC">
            <Container maxWidth="lg">
                <ProfileHeader profile={profile} isLoading={isLoading} />

                <Card sx={{ mt: 3, mb: 3, p: 2 }}>
                    <Tabs
                        value={currentTab}
                        onChange={(e, tab) => setCurrentTab(tab)}
                        sx={{ px: 2, bgcolor: 'background.neutral' }}
                    >
                        {PROFILE_TABS.map((tab) => (
                            <Tab
                                key={tab.value}
                                value={tab.value}
                                icon={tab.icon}
                                label={tab.value.replace('-', ' ')}
                                sx={{
                                    textTransform: 'capitalize',
                                    '&.Mui-selected': { color: 'primary.main' }
                                }}
                            />
                        ))}
                    </Tabs>

                    <Box sx={{ mt: 5, mb: 3 }}>
                        {PROFILE_TABS.map((tab) => {
                            const isMatched = tab.value === currentTab;
                            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
                        })}
                    </Box>
                </Card>
            </Container>
        </Page>
    );
}