import { experimentalStyled as styled } from "@mui/material/styles";
import { Box, Card, Typography, TextField, alpha, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

// Enhanced form wrapper with subtle animation and shadow
export const FormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusMd,
    padding: theme.spacing(3),
    boxShadow: theme.customShadows.z16,
    transition: 'box-shadow 0.3s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        boxShadow: theme.customShadows.z24,
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
}));

// Modern input field styling with enhanced focus states
export const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: alpha(theme.palette.grey[500], 0.32),
            transition: theme.transitions.create([
                'border-color',
                'box-shadow',
            ], {
                duration: 0.2,
            }),
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.light,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
    },
    '& .MuiInputLabel-root': {
        '&.Mui-focused': {
            color: theme.palette.primary.main,
        },
    },
    '& .MuiFormHelperText-root': {
        marginLeft: 0,
        marginTop: theme.spacing(0.5),
        fontSize: 12,
    },
    '& .MuiInputAdornment-root': {
        '& .MuiSvgIcon-root, & .iconify': {
            color: theme.palette.text.secondary,
        },
    }
}));

// Enhanced buttons for authentication pages
export const AuthButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMd,
    fontWeight: 600,
    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: theme.customShadows.primary,
    transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: 0.3,
    }),
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    '&:active': {
        transform: 'translateY(-1px)',
        boxShadow: `0 6px 12px 0 ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-disabled': {
        backgroundImage: 'none',
        bgcolor: theme.palette.action.disabledBackground,
    },
}));

// Transparent button with hover effect
export const TransparentButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
}));

// Special input for verification code
export const CodeInput = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        textAlign: 'center',
        padding: theme.spacing(1),
        fontSize: '1.5rem',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadiusMd,
    },
}));

// Card decoration for illustration side
export const IllustrationCard = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2, 2),
    backgroundImage: 'linear-gradient(135deg, rgba(66, 165, 245, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%)',
    overflow: 'hidden',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        width: '180px',
        height: '180px',
        background: `linear-gradient(140deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
        borderRadius: '50%',
        top: '-90px',
        right: '-90px',
        opacity: 0.1,
    },
}));

// Enhanced heading for auth pages
export const AuthHeading = styled(Typography)(({ theme }) => ({
    position: 'relative',
    marginBottom: theme.spacing(4),
    '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        bottom: '-12px',
        height: '3px',
        width: '40px',
        background: theme.palette.primary.main,
        borderRadius: '2px',
    }
}));