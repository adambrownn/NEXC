import { alpha } from '@mui/material/styles';

// Service category colors - matching staff system
export const CATEGORY_COLORS = {
    cards: {
        main: '#4CAF50',  // Green for cards
        light: '#E8F5E9',
        dark: '#2E7D32',
        contrastText: '#fff'
    },
    tests: {
        main: '#2196F3',  // Blue for tests
        light: '#E3F2FD',
        dark: '#1565C0',
        contrastText: '#fff'
    },
    courses: {
        main: '#FF9800',  // Orange for courses
        light: '#FFF3E0',
        dark: '#EF6C00',
        contrastText: '#fff'
    },
    qualifications: {
        main: '#9C27B0',  // Purple for qualifications
        light: '#F3E5F5',
        dark: '#7B1FA2',
        contrastText: '#fff'
    },
    default: {
        main: '#FCA700',  // Primary color
        light: '#f9c86d',
        dark: '#c78500',
        contrastText: '#fff'
    }
};

// Common styles for checkout components
export const checkoutStyles = {
    // Card styles with improved visual hierarchy
    card: (theme) => ({
        borderRadius: 2,
        boxShadow: theme.customShadows?.z8 || '0 4px 8px 0 rgba(145, 158, 171, 0.16)',
        transition: theme.transitions.create(['box-shadow', 'transform']),
        backgroundColor: theme.palette.background.checkout?.card || theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
            boxShadow: theme.customShadows?.z16 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            transform: 'translateY(-2px)'
        }
    }),

    // Step indicator styles with improved visibility
    stepIndicator: {
        display: 'flex',
        alignItems: 'center',
        '& .MuiStepConnector-line': {
            borderTopWidth: 3,
            borderTopColor: (theme) => theme.palette.divider
        },
        '& .MuiStepLabel-label': {
            fontWeight: 600,
            marginTop: 1
        },
        '& .MuiStepLabel-iconContainer': {
            padding: 1,
            borderRadius: '50%',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
        }
    },

    // Service category badges with improved contrast
    categoryBadge: (category) => ({
        backgroundColor: CATEGORY_COLORS[category]?.light || CATEGORY_COLORS.default.light,
        color: CATEGORY_COLORS[category]?.main || CATEGORY_COLORS.default.main,
        fontWeight: 600,
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        fontSize: 13,
        textTransform: 'capitalize',
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.05)'
    }),

    // Service card with improved visual hierarchy
    serviceCard: (category) => ({
        borderLeft: (theme) => `4px solid ${CATEGORY_COLORS[category]?.main || theme.palette.primary.main}`,
        transition: 'all 0.2s',
        backgroundColor: (theme) => theme.palette.background.checkout?.card || theme.palette.background.paper,
        boxShadow: (theme) => `0 2px 8px 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        borderRadius: 1,
        position: 'relative',
        '&:hover': {
            borderColor: CATEGORY_COLORS[category]?.dark || 'primary.main',
            backgroundColor: (theme) => alpha(CATEGORY_COLORS[category]?.light || theme.palette.background.default, 0.2),
            transform: 'translateY(-2px)',
            boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.16)}`
        },
        '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '8px',
            opacity: 0.1,
            backgroundColor: CATEGORY_COLORS[category]?.main || 'primary.main',
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4
        }
    }),

    // Section styles for checkout components
    section: {
        mb: 4,
        p: 3,
        borderRadius: 2,
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
        border: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'relative'
    },

    // Responsive containers
    mobileContainer: {
        px: { xs: 2, sm: 3 }
    },

    // Transition effects
    fadeTransition: {
        transition: (theme) => theme.transitions.create(['opacity', 'transform']),
        '&:hover': {
            opacity: 0.95,
            transform: 'translateY(-2px)'
        }
    },

    // Success indicators
    successIndicator: {
        display: 'inline-flex',
        alignItems: 'center',
        color: 'success.main',
        '& svg': {
            mr: 0.5,
            fontSize: 16
        }
    },

    // Payment form styles
    paymentForm: {
        p: 3,
        borderRadius: 2,
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        position: 'relative',
        '&:hover': {
            boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.grey[500], 0.16)}`
        }
    },

    // Order summary styles
    orderSummary: {
        p: 3,
        borderRadius: 2,
        backgroundColor: (theme) => alpha(theme.palette.primary.lighter, 0.2),
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        position: 'relative'
    }
};