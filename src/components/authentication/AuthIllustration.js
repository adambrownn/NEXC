// src/components/authentication/AuthIllustration.js
import { Box } from '@mui/material';
import { Icon } from '@iconify/react';

export default function AuthIllustration({ type = 'login' }) {
    return (
        <Box
            sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            {/* Main Icon */}
            <Icon
                icon={type === 'login' ? "mdi:office-building" : "mdi:account-hard-hat"}
                style={{
                    fontSize: 180,
                    color: '#2065D1',
                    opacity: 0.8,
                }}
            />

            {/* Hard hat icon */}
            <Icon
                icon="mdi:hard-hat"
                style={{
                    position: 'absolute',
                    fontSize: 60,
                    bottom: '25%',
                    right: '25%',
                    color: '#FFC107',
                    opacity: 0.9
                }}
            />
        </Box>
    );
}