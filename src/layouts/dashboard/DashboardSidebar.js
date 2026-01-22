import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
// Updated imports for MUI v5
import { styled, alpha } from "@mui/material/styles";
import { Box, Link, Drawer, Typography, Avatar, Stack, Chip, Tooltip, useTheme } from "@mui/material";
// hooks
import useResponsive from "../../hooks/useResponsive";
import useSettings from "../../hooks/useSettings";
import useAuth from "../../hooks/useAuth";
import { useRoleBasedNavigation, useNavigationEnhancements } from "../../hooks/useRoleBasedNavigation";
import { useRolePermissions } from "../../hooks/useRolePermissions";
// components
import Logo from "../../components/Logo";
import Scrollbar from "../../components/Scrollbar";
import NavSection from "../../components/NavSection";
import ThemeToggle from "../../components/ThemeToggle";
//
import sidebarConfig from "./SidebarConfig";

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;
const TABLET_DRAWER_WIDTH = 260; // Slightly narrower on tablets

const RootStyle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOpen'
})(({ theme, isOpen }) => ({
  [theme.breakpoints.up("lg")]: {
    flexShrink: 0,
    width: isOpen ? DRAWER_WIDTH : 0,
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

// Enhanced Account Style with construction industry design
const AccountStyle = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2.5),
  margin: theme.spacing(0, 2.5, 3),
  borderRadius: theme.shape.borderRadiusMd || theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'light' 
    ? alpha(theme.palette.primary.main, 0.08)
    : alpha(theme.palette.primary.main, 0.12),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.primary.main, 0.16),
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  
  // Construction industry accent
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: `${theme.shape.borderRadiusMd || theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadiusMd || theme.shape.borderRadius}px`,
  },
}));

// Enhanced Logo Container
const LogoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.24)}`,
  marginBottom: theme.spacing(1),
}));

// Construction Role Chip
const RoleChip = styled(Chip)(({ theme, role }) => {
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return theme.palette.error;
      case 'manager':
      case 'supervisor':
        return theme.palette.warning;
      case 'foreman':
      case 'lead':
        return theme.palette.info;
      default:
        return theme.palette.primary;
    }
  };
  
  const roleColor = getRoleColor(role);
  
  return {
    fontSize: '0.6875rem',
    height: 20,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    backgroundColor: alpha(roleColor.main, 0.12),
    color: roleColor.main,
    border: `1px solid ${alpha(roleColor.main, 0.24)}`,
  };
});

// Theme Toggle Container
const ThemeToggleContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5, 3),
  borderTop: `1px dashed ${alpha(theme.palette.divider, 0.24)}`,
  marginTop: 'auto',
}));

// Enhanced User Info Container
const UserInfoContainer = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  minWidth: 0, // Prevents text overflow
  flex: 1,
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
  isDesktopOpen: PropTypes.bool,
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar, isDesktopOpen = true }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { themeMode } = useSettings();
  const theme = useTheme();
  
  // Enhanced responsive breakpoints
  const isDesktop = useResponsive('up', 'lg');  // Fixed: Back to lg (1024px) for desktop
  const isTablet = useResponsive('between', 'md', 'lg'); // Fixed: md to lg range for tablets
  const isMobile = useResponsive('down', 'md');
  
  // Swipe gesture support
  const drawerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Role-based navigation hooks
  const permissions = useRolePermissions();
  const filteredSidebarConfig = useRoleBasedNavigation(sidebarConfig);
  const { roleLevel } = useNavigationEnhancements();

  // Minimum swipe distance for gesture recognition
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isOpenSidebar && (isMobile || isTablet)) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Touch gesture handlers for swipe-to-close
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    // Close sidebar on left swipe (swiping towards left edge)
    if (isLeftSwipe && (isMobile || isTablet)) {
      onCloseSidebar();
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Format user role for display
  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Get role description for tooltip
  const getRoleDescription = (role) => {
    const descriptions = {
      superadmin: 'Full platform control & system management',
      admin: 'Business operations & user management',
      manager: 'Operations oversight & reporting',
      supervisor: 'Team leadership & customer support',
      staff: 'Customer service & support operations',
      user: 'Personal dashboard access',
      visitor: 'Limited access'
    };
    return descriptions[role?.toLowerCase()] || 'Standard user access';
  };

  const renderContent = (
    <Scrollbar
      ref={drawerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        height: 1,
        '& .simplebar-content': { 
          height: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
        },
        // Enhanced touch scrolling for mobile/tablet
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Enhanced Logo Section */}
      <LogoContainer>
        <Logo />
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          NEXC Dashboard
        </Typography>
      </LogoContainer>

      {/* Enhanced User Account Section */}
      <Link underline="none" component={RouterLink} to="/dashboard/account">
        <AccountStyle>
          <Avatar 
            src={user?.photoURL} 
            alt={user?.displayName || 'User'}
            sx={{
              width: 48,
              height: 48,
              fontSize: '1.25rem',
              fontWeight: 600,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {!user?.photoURL && getUserInitials(user?.displayName)}
          </Avatar>
          
          <UserInfoContainer>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 0.5,
              }}
              noWrap
            >
              {user?.displayName || 'User Name'}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip 
                title={getRoleDescription(user?.accountType || user?.role)}
                placement="right"
                arrow
              >
                <RoleChip 
                  role={user?.accountType || user?.role}
                  label={formatRole(user?.accountType || user?.role)} 
                  size="small"
                />
              </Tooltip>
              
              {/* Role Level Indicator */}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.625rem',
                  fontWeight: 500,
                }}
              >
                L{roleLevel}
              </Typography>
            </Stack>
            
            {/* Access Level Status */}
            {permissions.canAccessDashboard && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'success.main',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  display: 'block',
                  mt: 0.25,
                }}
              >
                {permissions.canEditUsers ? 'Full Access' : 
                 permissions.canViewUserManagement ? 'Management Access' :
                 permissions.canViewServiceOperations ? 'Service Access' : 'Dashboard Access'}
              </Typography>
            )}
            
            {user?.company && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  mt: 0.5,
                  fontSize: '0.6875rem',
                }}
                noWrap
              >
                {user.company}
              </Typography>
            )}
          </UserInfoContainer>
        </AccountStyle>
      </Link>

      {/* Role-Based Navigation Section */}
      <Box sx={{ px: 1 }}>
        {filteredSidebarConfig.length > 0 ? (
          <NavSection navConfig={filteredSidebarConfig} />
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No navigation items available for your role.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Contact your administrator for access.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Theme Toggle Section */}
      <ThemeToggleContainer>
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                display: 'block',
              }}
            >
              Theme Mode
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {themeMode}
            </Typography>
          </Box>
          <ThemeToggle />
        </Stack>
      </ThemeToggleContainer>
    </Scrollbar>
  );

  return (
    <RootStyle isOpen={isDesktopOpen}>
      {/* Mobile/Tablet temporary drawer with enhanced touch support */}
      {(isMobile || isTablet) && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          variant="temporary"
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          PaperProps={{
            sx: { 
              width: isMobile ? DRAWER_WIDTH : TABLET_DRAWER_WIDTH,
              backgroundColor: 'background.default',
              backgroundImage: 'none',
              // Enhanced mobile shadows
              boxShadow: theme.shadows[16],
              // Smooth transitions
              transition: theme.transitions.create(['transform'], {
                duration: theme.transitions.duration.enteringScreen,
                easing: theme.transitions.easing.easeOut,
              }),
            }
          }}
          SlideProps={{
            // Enhanced slide animation
            timeout: {
              enter: theme.transitions.duration.enteringScreen,
              exit: theme.transitions.duration.leavingScreen,
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {/* Desktop persistent drawer with toggle support */}
      {isDesktop && (
        <Drawer
          open={isDesktopOpen}
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              backgroundColor: 'background.default',
              borderRight: `1px dashed ${alpha(theme.palette.divider, 0.12)}`,
              backgroundImage: 'none',
              // Smooth transitions for theme changes and collapse/expand
              transition: theme.transitions.create(['background-color', 'border-color', 'transform'], {
                duration: theme.transitions.duration.standard,
              }),
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}