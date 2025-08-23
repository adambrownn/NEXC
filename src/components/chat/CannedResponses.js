import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';

export default function CannedResponses({ onSelectResponse }) {
    const responses = [
        { id: '1', title: 'Greeting', content: 'Hello! How can I help you today?' },
        { id: '2', title: 'Thanks', content: 'Thank you for reaching out to us. I appreciate your patience.' },
        { id: '3', title: 'Closing', content: 'Is there anything else I can help you with today?' },
        { id: '4', title: 'Wait', content: 'Please give me a moment to check that for you.' },
        { id: '5', title: 'Contact Info', content: 'You can reach us at support@nexc.com or call us at 0123-456-7890 during business hours.' },
        { id: '6', title: 'Business Hours', content: 'Our business hours are Monday to Friday, 9 AM to 5 PM GMT.' }
    ];

    return (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
                Quick Responses
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {responses.map(response => (
                    <Chip
                        key={response.id}
                        label={response.title}
                        size="small"
                        onClick={() => onSelectResponse(response.content)}
                        sx={{ cursor: 'pointer' }}
                    />
                ))}
            </Box>
        </Paper>
    );
}