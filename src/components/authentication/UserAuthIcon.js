import React, { useState, useEffect } from 'react';
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
// import settingsFill from '@iconify/icons-eva/settings-2-fill';
import fileTextFill from '@iconify/icons-eva/file-text-fill';

// You'll need to import your auth service/context here
// import { useAuth } from '../../contexts/AuthContext';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // const { isAuthenticated, user, logout } = useAuth(); // When you implement auth context

    useEffect(() => {
        // Check if user is authenticated
        // Replace this with your actual authentication check
        const checkAuth = async () => {
            setLoading(true);
            // Example - replace with your auth logic
            const token = localStorage.getItem('token');

            if (token) {
                setIsAuthenticated(true);
                // Fetch user data or decode JWT
                setUserData({
                    name: 'John Doe', // Replace with actual user data
                    email: 'john@example.com',
                    initials: 'JD'
                });
            } else {
                setIsAuthenticated(false);
                setUserData(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

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
        navigate('/profile');
        handleClose();
    };

    const handleOrders = () => {
        navigate('/orders');
        handleClose();
    };

    const handleLogout = () => {
        // Replace with your logout logic
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserData(null);
        // logout(); // When you implement auth context
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
                        <StyledAvatar alt={userData?.name}>
                            {userData?.initials || userData?.name?.charAt(0) || ''}
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
                                {userData?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                {userData?.email}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem onClick={handleProfile} sx={{ py: 1 }}>
                            <ListItemIcon><Icon icon={personFill} {...ICON_SIZE} /></ListItemIcon>
                            <ListItemText primary="Profile" />
                        </MenuItem>
                        <MenuItem onClick={handleOrders} sx={{ py: 1 }}>
                            <ListItemIcon>
                                <Icon icon={fileTextFill} {...ICON_SIZE} />
                            </ListItemIcon>
                            <ListItemText primary="My Orders" />
                        </MenuItem>
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