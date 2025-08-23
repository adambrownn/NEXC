import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import shieldFill from '@iconify/icons-eva/shield-fill';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, Stack, StepConnector, stepConnectorClasses } from '@mui/material';

// Qualification Connector for Stepper
export const QualificationConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: theme.palette.divider,
        borderRadius: 1,
    },
}));

// Custom StepIcon for qualification steps
const QualStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.grey[300],
    zIndex: 1,
    color: '#fff',
    width: 44,
    height: 44,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    }),
}));

export const QualStepIcon = (props) => {
    const { active, completed, className } = props;

    return (
        <QualStepIconRoot ownerState={{ active, completed }} className={className}>
            <Icon icon={shieldFill} width={24} height={24} />
        </QualStepIconRoot>
    );
};

QualStepIcon.propTypes = {
    active: PropTypes.bool,
    completed: PropTypes.bool,
    className: PropTypes.string,
};

// Metric Badge for displaying statistics
export const MetricBadge = styled(({ color, children, ...other }) => (
    <Paper
        elevation={0}
        {...other}
    >
        <Box sx={{ p: 2, textAlign: 'center' }}>
            {children}
        </Box>
    </Paper>
))(({ theme, color }) => ({
    backgroundColor: theme.palette[color || 'primary'].lighter,
    height: '100%',
    color: theme.palette[color || 'primary'].darker,
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    }
}));

// Why Choose Item component
export const WhyChooseItem = ({ number, title, description }) => (
    <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
            sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                display: 'flex',
                borderRadius: 1.5,
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'bold',
            }}
        >
            {number}
        </Box>
        <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Box>
    </Stack>
);

WhyChooseItem.propTypes = {
    number: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
};