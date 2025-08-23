import React, { useState, useEffect } from 'react';
import {
    Card,
    Box,
    Typography,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import UserService from '../../../services/user.service';

export default function NotificationSettings({ profile, isLoading, onUpdate }) {
    const [settings, setSettings] = useState({
        email: true,
        push: true,
        sms: true,
        serviceUpdates: true,
        promotions: false,
        securityAlerts: true
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (profile?.notificationPreferences) {
            setSettings(prevSettings => ({
                ...prevSettings,
                ...profile.notificationPreferences
            }));
        }
    }, [profile]);

    const handleChange = (event) => {
        const { name, checked } = event.target;
        setSettings(prev => ({
            ...prev,
            [name]: checked
        }));
        setSuccess(false);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setSuccess(false);

            // Use existing services to update notification preferences
            await UserService.updateNotificationPreferences(settings);

            // Notify parent component to refresh profile data
            if (onUpdate) {
                onUpdate({ notificationPreferences: settings });
            }

            setSuccess(true);
            enqueueSnackbar('Notification preferences updated successfully', {
                variant: 'success'
            });
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
            enqueueSnackbar('Failed to update notification preferences', {
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Notification Preferences
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Your notification preferences have been updated successfully.
                </Alert>
            )}

            <List>
                <ListItem>
                    <ListItemIcon>
                        <Icon icon="mdi:email-outline" width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Email Notifications"
                        secondary="Receive updates via email"
                    />
                    <Switch
                        edge="end"
                        name="email"
                        checked={settings.email}
                        onChange={handleChange}
                    />
                </ListItem>

                <Divider variant="inset" component="li" />

                <ListItem>
                    <ListItemIcon>
                        <Icon icon="mdi:cellphone" width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary="SMS Notifications"
                        secondary="Receive updates via text message"
                    />
                    <Switch
                        edge="end"
                        name="sms"
                        checked={settings.sms}
                        onChange={handleChange}
                    />
                </ListItem>

                <Divider variant="inset" component="li" />

                <ListItem>
                    <ListItemIcon>
                        <Icon icon="mdi:bell-outline" width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Push Notifications"
                        secondary="Receive notifications in your browser or app"
                    />
                    <Switch
                        edge="end"
                        name="push"
                        checked={settings.push}
                        onChange={handleChange}
                    />
                </ListItem>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, px: 2 }}>
                    Notification Types
                </Typography>

                <ListItem>
                    <ListItemIcon>
                        <Icon icon="mdi:tools" width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Service Updates"
                        secondary="Status changes, appointment reminders, etc."
                    />
                    <Switch
                        edge="end"
                        name="serviceUpdates"
                        checked={settings.serviceUpdates}
                        onChange={handleChange}
                    />
                </ListItem>

                <Divider variant="inset" component="li" />

                <ListItem>
                    <ListItemIcon>
                        <Icon icon="mdi:tag-outline" width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Promotional Content"
                        secondary="Discounts, special offers, and news"
                    />
                    <Switch
                        edge="end"
                        name="promotions"
                        checked={settings.promotions}
                        onChange={handleChange}
                    />
                </ListItem>

                <Divider variant="inset" component="li" />

                <ListItem>
                    <ListItemIcon>
                        <Icon icon="mdi:shield-check-outline" width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Security Alerts"
                        secondary="Account security and privacy notifications"
                    />
                    <Switch
                        edge="end"
                        name="securityAlerts"
                        checked={settings.securityAlerts}
                        onChange={handleChange}
                    />
                </ListItem>
            </List>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
            </Stack>
        </Card>
    );
}
