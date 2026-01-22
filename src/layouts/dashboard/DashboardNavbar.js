import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import menu2Fill from "@iconify/icons-eva/menu-2-fill";
import chevronLeftFill from "@iconify/icons-eva/chevron-left-fill";
import chevronRightFill from "@iconify/icons-eva/chevron-right-fill";
// material
import { alpha, styled } from "@mui/material/styles";
import { Box, Stack, AppBar, Toolbar, IconButton, Tooltip } from "@mui/material";
// components
import { MHidden } from "../../components/@material-extend";
import ThemeToggle from "../../components/ThemeToggle";
//
import AccountPopover from "./AccountPopover";
import NotificationsPopover from "./NotificationsPopover";
// import LanguagePopover from "./LanguagePopover";

// ----------------------------------------------------------------------

// const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 56;   // Optimized mobile height
const APPBAR_TABLET = 64;   // Tablet-specific height
const APPBAR_DESKTOP = 92;  // Desktop height

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: "none",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  // No width calculation needed - AppBar inherits width from parent MainStyle
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  // Enhanced responsive padding for mobile
  padding: theme.spacing(0, 1), // Minimal mobile padding
  
  // Tablet optimization
  [theme.breakpoints.up("md")]: {
    minHeight: APPBAR_TABLET,
    padding: theme.spacing(0, 2),
  },
  
  // Desktop optimization
  [theme.breakpoints.up("xl")]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
  onToggleSidebar: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default function DashboardNavbar({ onOpenSidebar, onToggleSidebar, isSidebarOpen, ...other }) {
  return (
    <RootStyle>
      <ToolbarStyle>
        {/* Mobile/Tablet sidebar toggle - shows on everything except desktop */}
        <MHidden width="lgUp">
          <IconButton
            onClick={onOpenSidebar}
            sx={{ 
              mr: { xs: 0.5, sm: 1 }, 
              color: "text.primary",
              // Touch-friendly sizing (44px minimum for accessibility)
              minWidth: 44,
              minHeight: 44,
              borderRadius: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
          >
            <Icon icon={menu2Fill} width={24} height={24} />
          </IconButton>
        </MHidden>

        <Box sx={{ flexGrow: 1 }} />

        {/* Enhanced responsive action buttons */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.25, sm: 0.5, md: 1, lg: 1.5 }}
        >
          {/* Desktop sidebar toggle - allows collapsing sidebar */}
          <MHidden width="lgDown">
            <Tooltip title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"} arrow placement="bottom">
              <IconButton
                onClick={onToggleSidebar}
                sx={{ 
                  color: "text.primary",
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: isSidebarOpen ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    backgroundColor: isSidebarOpen ? 'action.hover' : (theme) => alpha(theme.palette.primary.main, 0.16),
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Icon 
                  icon={isSidebarOpen ? chevronLeftFill : chevronRightFill} 
                  width={24} 
                  height={24} 
                />
              </IconButton>
            </Tooltip>
          </MHidden>

          <ThemeToggle />
          
          <MHidden width="xsDown">
            <NotificationsPopover />
          </MHidden>
          
          {/* Language switcher - TODO: Implement if needed */}
          {/* <MHidden width="smDown">
            <LanguagePopover />
          </MHidden> */}
          
          <AccountPopover {...other} />
        </Stack>
      </ToolbarStyle>
    </RootStyle>
  );
}
