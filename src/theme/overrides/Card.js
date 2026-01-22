import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

export default function Card(theme) {
  const isLight = theme.palette.mode === 'light';
  
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          // Enhanced shadow system for construction industry feel
          boxShadow: isLight 
            ? '0 2px 8px 0 rgba(99, 115, 129, 0.08), 0 0 0 1px rgba(99, 115, 129, 0.05)'
            : '0 2px 8px 0 rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          borderRadius: theme.shape.borderRadiusMd || theme.shape.borderRadius,
          position: "relative",
          zIndex: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden', // Prevent content overflow
          
          // Enhanced hover states for better interaction feedback
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isLight
              ? '0 8px 24px 0 rgba(99, 115, 129, 0.12), 0 0 0 1px rgba(99, 115, 129, 0.08)'
              : '0 8px 24px 0 rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          },
          
          // Mobile optimization
          [theme.breakpoints.down('sm')]: {
            '&:hover': {
              transform: 'none', // Disable hover effects on mobile
            },
          },
          
          // Construction dashboard specific card variants
          '&.dashboard-card': {
            background: theme.palette.background.paper,
            
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: theme.palette.gradients?.primary || 
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light || theme.palette.primary.main})`,
              borderRadius: `${theme.shape.borderRadiusMd || theme.shape.borderRadius}px ${theme.shape.borderRadiusMd || theme.shape.borderRadius}px 0 0`,
              zIndex: 1,
            },
            
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isLight
                ? `0 12px 32px 0 ${alpha(theme.palette.primary.main, 0.16)}`
                : `0 12px 32px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
            },
            
            // Mobile override
            [theme.breakpoints.down('sm')]: {
              '&:hover': {
                transform: 'none',
              },
            },
          },
          
          // Metric cards for construction KPIs
          '&.metric-card': {
            overflow: 'hidden',
            background: theme.palette.background.paper,
            textAlign: 'center',
            
            '& .metric-icon': {
              width: 48,
              height: 48,
              borderRadius: theme.shape.borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: theme.spacing(2),
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              
              // Responsive icon size
              [theme.breakpoints.down('sm')]: {
                width: 40,
                height: 40,
              },
            },
            
            '& .metric-trend': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing(0.5),
              marginTop: theme.spacing(1),
            },
            
            '& .metric-value': {
              fontSize: '2rem',
              fontWeight: 700,
              color: theme.palette.primary.main,
              lineHeight: 1.2,
              
              // Responsive font size
              [theme.breakpoints.down('sm')]: {
                fontSize: '1.75rem',
              },
            },
          },
          
          // Safety alert cards
          '&.safety-card': {
            borderLeft: `4px solid ${theme.palette.warning.main}`,
            backgroundColor: isLight 
              ? alpha(theme.palette.warning.main, 0.04)
              : alpha(theme.palette.warning.main, 0.08),
            
            '& .safety-icon': {
              color: theme.palette.warning.main,
            },
            
            '&.safety-critical': {
              borderLeftColor: theme.palette.error.main,
              backgroundColor: isLight 
                ? alpha(theme.palette.error.main, 0.04)
                : alpha(theme.palette.error.main, 0.08),
              
              '& .safety-icon': {
                color: theme.palette.error.main,
              },
            },
          },
          
          // Status cards for construction projects - Fixed selector specificity
          '&.status-card': {
            position: 'relative',
            
            '&.status-active': {
              borderLeft: `4px solid ${theme.palette.success.main}`,
              
              '& .status-indicator': {
                backgroundColor: theme.palette.success.main,
              },
            },
            '&.status-pending': {
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              
              '& .status-indicator': {
                backgroundColor: theme.palette.warning.main,
              },
            },
            '&.status-completed': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              
              '& .status-indicator': {
                backgroundColor: theme.palette.primary.main,
              },
            },
            '&.status-cancelled': {
              borderLeft: `4px solid ${theme.palette.error.main}`,
              
              '& .status-indicator': {
                backgroundColor: theme.palette.error.main,
              },
            },
          },
          
          // Loading state
          '&.loading': {
            pointerEvents: 'none',
            opacity: 0.7,
            
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: alpha(theme.palette.background.paper, 0.8),
              zIndex: 9,
            },
          },
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: "h6" },
        subheaderTypographyProps: { variant: "body2" },
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 2),
          
          // Enhanced header for construction cards
          '&.construction-header': {
            background: isLight 
              ? alpha(theme.palette.primary.main, 0.04)
              : alpha(theme.palette.primary.main, 0.08),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            
            '& .MuiCardHeader-title': {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
          },
          
          // Responsive padding
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2, 2, 1),
          },
        },
        title: {
          marginBottom: theme.spacing(0.5),
          fontSize: '1.125rem',
          fontWeight: 600,
          
          // Responsive title
          [theme.breakpoints.down('sm')]: {
            fontSize: '1rem',
          },
        },
        action: {
          margin: 0,
          alignSelf: 'flex-start',
          
          '& .construction-status': {
            padding: theme.spacing(0.5, 1),
            borderRadius: theme.shape.borderRadius,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            
            // Responsive status badges
            [theme.breakpoints.down('sm')]: {
              fontSize: '0.6875rem',
              padding: theme.spacing(0.25, 0.75),
            },
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
          
          '&:last-child': {
            paddingBottom: theme.spacing(3),
          },
          
          // Responsive padding
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2),
            
            '&:last-child': {
              paddingBottom: theme.spacing(2),
            },
          },
          
          // Construction card content variations
          '&.metric-content': {
            textAlign: 'center',
            
            '& .metric-value': {
              color: theme.palette.primary.main,
              display: 'block',
              marginBottom: theme.spacing(1),
              fontSize: '2rem',
              fontWeight: 700,
              
              [theme.breakpoints.down('sm')]: {
                fontSize: '1.75rem',
              },
            },
            
            '& .metric-label': {
              display: 'block',
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          },
          
          '&.status-content': {
            paddingTop: theme.spacing(2),
            
            '& .status-list': {
              listStyle: 'none',
              padding: 0,
              margin: 0,
              
              '& li': {
                display: 'flex',
                alignItems: 'center',
                padding: theme.spacing(1, 0),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                
                '&:last-child': {
                  borderBottom: 'none',
                },
                
                '& .status-dot': {
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  marginRight: theme.spacing(2),
                  flexShrink: 0,
                },
              },
            },
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2, 3, 3),
          
          // Responsive padding
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5, 2, 2),
          },
          
          '&.construction-actions': {
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            backgroundColor: isLight 
              ? alpha(theme.palette.grey[500], 0.04)
              : alpha(theme.palette.grey[500], 0.08),
            
            '& .MuiButton-root': {
              textTransform: 'none',
              fontWeight: 500,
              
              // Responsive button sizing
              [theme.breakpoints.down('sm')]: {
                fontSize: '0.875rem',
                padding: theme.spacing(0.75, 1.5),
              },
            },
          },
        },
      },
    },
  };
}
