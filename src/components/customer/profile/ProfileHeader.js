import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Avatar, Stack, Skeleton } from '@mui/material';
import { Icon } from '@iconify/react';

const RootStyle = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMd,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    boxShadow: theme.customShadows.z8,
    backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}22, ${theme.palette.primary.lighter}55)`,
    position: 'relative',
    overflow: 'hidden'
}));

const ProfileHeaderIcon = styled('div')(({ theme }) => ({
    position: 'absolute',
    right: -15,
    top: -15,
    opacity: 0.08,
    fontSize: 180,
    color: theme.palette.primary.main
}));

export default function ProfileHeader({ profile, isLoading }) {
    return (
        <RootStyle>
            <ProfileHeaderIcon>
                <Icon icon="mdi:account-hard-hat" />
            </ProfileHeaderIcon>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" width="100%">
                {isLoading ? (
                    <Skeleton variant="circular" width={80} height={80} />
                ) : (
                    <Avatar
                        src={profile?.profileImage}
                        alt={profile?.name}
                        sx={{
                            width: 80,
                            height: 80,
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                )}

                <Box sx={{ flexGrow: 1 }}>
                    {isLoading ? (
                        <>
                            <Skeleton width="40%" height={40} />
                            <Skeleton width="30%" height={25} />
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" gutterBottom>
                                {profile?.name || 'Unknown User'}
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                {profile?.email && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Icon icon="eva:email-outline" width={20} height={20} />
                                        <Typography variant="body2">{profile.email}</Typography>
                                    </Stack>
                                )}
                                {profile?.phoneNumber && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Icon icon="eva:phone-outline" width={20} height={20} />
                                        <Typography variant="body2">{profile.phoneNumber}</Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </>
                    )}
                </Box>
            </Stack>
        </RootStyle>
    );
}