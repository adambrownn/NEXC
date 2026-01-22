import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Tooltip,
    Divider,
    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import personFill from '@iconify/icons-eva/person-fill';
import loginFill from '@iconify/icons-eva/log-in-fill';
import personAddFill from '@iconify/icons-eva/person-add-fill';
import homeFill from '@iconify/icons-eva/home-fill';

// Import AuthContext
import { useAuth } from '../../contexts/AuthContext';

const ICON_SIZE = {
    width: 22,
    height: 22,
};

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 36,
    height: 36,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.1)',
    }
}));

// Update function definition to receive props
export default function UserAuthIcon({ isHome = false, isOffset = false }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    
    // Use AuthContext for authentication state
    const { isAuthenticated, user, loading, logout } = useAuth();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogin = () => {
        navigate('/auth/login');
        handleClose();
    };

    const handleRegister = () => {
        navigate('/auth/register');
        handleClose();
    };

    const handleProfile = () => {
        // Route based on user role
        const userRole = user?.accountType || user?.role;
        const isCustomerRole = !userRole || userRole === 'user' || userRole === 'visitor';
        
        if (isCustomerRole) {
            navigate('/customer/profile');
        } else {
            navigate('/dashboard/account');
        }
        handleClose();
    };

    const handleDashboard = () => {
        navigate('/dashboard');
        handleClose();
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
        handleClose();
    };

    return (
        <>
            <Tooltip title={isAuthenticated ? "Account" : "Login/Register"}>
                <IconButton
                    onClick={handleMenu}
                    color="inherit"
                    sx={{
                        width: 40, // Match other icons
                        height: 40,
                        '&:hover': {
                            bgcolor: isHome && !isOffset
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0,0,0,0.03)'
                        }
                    }}
                >
                    {loading ? (
                        <Box sx={{
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CircularProgress size={20} color="inherit" thickness={2} />
                        </Box>
                    ) : isAuthenticated ? (
                        <StyledAvatar 
                            alt={user?.displayName || user?.name || user?.email}
                            src={user?.photoURL || user?.profileImage}
                        >
                            {user?.displayName?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || ''}
                        </StyledAvatar>
                    ) : (
                        <Icon icon={personFill} {...ICON_SIZE} />
                    )}
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    elevation: 4,
                    sx: {
                        width: 220,
                        maxWidth: '100%',
                        borderRadius: 1.5,
                        mt: 1.5
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            '@media (max-width: 600px)': {
                                left: 'auto !important',
                                right: '16px !important',
                            }
                        }
                    }
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Box sx={{ my: 1.5, px: 2.5 }}>
                            <Typography variant="subtitle2" noWrap>
                                {user?.displayName || user?.name || 'User'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        
                        {/* Show Dashboard for staff/admin roles */}
                        {user?.accountType && !['user', 'visitor'].includes(user.accountType) && (
                            <MenuItem onClick={handleDashboard} sx={{ py: 1 }}>
                                <ListItemIcon><Icon icon={homeFill} {...ICON_SIZE} /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </MenuItem>
                        )}
                        
                        <MenuItem onClick={handleProfile} sx={{ py: 1 }}>
                            <ListItemIcon><Icon icon={personFill} {...ICON_SIZE} /></ListItemIcon>
                            <ListItemText primary={
                                user?.accountType && !['user', 'visitor'].includes(user.accountType)
                                    ? "Account Settings"
                                    : "My Profile & Orders"
                            } />
                        </MenuItem>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                            <ListItemIcon><Icon icon={loginFill} {...ICON_SIZE} style={{ transform: 'scaleX(-1)' }} /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem onClick={handleLogin} sx={{ py: 1 }}>
                            <ListItemIcon><Icon icon={loginFill} {...ICON_SIZE} /></ListItemIcon>
                            <ListItemText primary="Login" />
                        </MenuItem>
                        <MenuItem onClick={handleRegister} sx={{ py: 1 }}>
                            <ListItemIcon><Icon icon={personAddFill} {...ICON_SIZE} /></ListItemIcon>
                            <ListItemText primary="Register" />
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
}