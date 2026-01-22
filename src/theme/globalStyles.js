// material
import { useTheme } from '@mui/material/styles';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function GlobalStyles() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const inputGlobalStyles = (
    <MuiGlobalStyles
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        },
        body: {
          width: '100%',
          height: '100%',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          // Enhanced font rendering for construction industry readability
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '#root': {
          width: '100%',
          height: '100%',
          backgroundColor: theme.palette.background.default
        },

        // ENHANCED SELECTION HIGHLIGHTING
        '::selection': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          color: theme.palette.text.primary,
        },
        '::-moz-selection': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          color: theme.palette.text.primary,
        },

        // CONSTRUCTION-SPECIFIC FOCUS STATES
        '*:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          borderRadius: theme.shape.borderRadius,
        },

        // ENHANCED FORM ELEMENTS
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            }
          },
          // Enhanced input focus for construction forms
          '&:focus': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        },

        textarea: {
          '&::-webkit-input-placeholder': {
            color: theme.palette.text.disabled
          },
          '&::-moz-placeholder': {
            opacity: 1,
            color: theme.palette.text.disabled
          },
          '&:-ms-input-placeholder': {
            color: theme.palette.text.disabled
          },
          '&::placeholder': {
            color: theme.palette.text.disabled
          },
          // Enhanced textarea focus
          '&:focus': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        },

        // ENHANCED SCROLLBARS FOR BOTH MODES
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: isLight 
            ? alpha(theme.palette.grey[500], 0.04)
            : theme.palette.background.paper,
          borderRadius: 4,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: isLight
            ? alpha(theme.palette.grey[600], 0.48)
            : theme.palette.grey[600],
          borderRadius: 4,
          transition: 'background-color 0.2s ease',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: isLight
            ? alpha(theme.palette.grey[600], 0.72)
            : theme.palette.grey[500],
        },

        // CONSTRUCTION INDUSTRY SPECIFIC ANIMATIONS
        '@keyframes constructionPulse': {
          '0%': {
            boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
          },
          '70%': {
            boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}`,
          },
          '100%': {
            boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
          },
        },

        '@keyframes slideInFromLeft': {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: 1,
          },
        },

        // CONSTRUCTION STATUS INDICATORS
        '.status-indicator': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '-12px',
            width: 8,
            height: 8,
            borderRadius: '50%',
            transform: 'translateY(-50%)',
          },
          '&.status-active::before': {
            backgroundColor: theme.palette.success.main,
            animation: 'constructionPulse 2s infinite',
          },
          '&.status-pending::before': {
            backgroundColor: theme.palette.warning.main,
          },
          '&.status-completed::before': {
            backgroundColor: theme.palette.primary.main,
          },
          '&.status-error::before': {
            backgroundColor: theme.palette.error.main,
            animation: 'constructionPulse 2s infinite',
          },
        },

        // ENHANCED LINK STYLES
        'a': {
          color: theme.palette.primary.main,
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: theme.palette.primary.dark,
            textDecoration: 'underline',
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: 2,
          }
        },

        // CONSTRUCTION CARD ANIMATIONS
        '.construction-card-enter': {
          animation: 'slideInFromLeft 0.3s ease-out',
        },

        // PRINT STYLES FOR CONSTRUCTION DOCUMENTS
        '@media print': {
          '*': {
            WebkitPrintColorAdjust: 'exact',
            colorAdjust: 'exact',
          },
          body: {
            backgroundColor: 'white !important',
            color: 'black !important',
          },
          '.no-print': {
            display: 'none !important',
          },
        },

        // ACCESSIBILITY ENHANCEMENTS
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          }
        },

        // HIGH CONTRAST MODE SUPPORT
        '@media (prefers-contrast: high)': {
          '*:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '3px',
          }
        },
      }}
    />
  );

  return inputGlobalStyles;
}
