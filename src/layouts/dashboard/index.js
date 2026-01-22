import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
//
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import Breadcrumbs from "../../components/Breadcrumbs";

// ----------------------------------------------------------------------

// Enhanced responsive app bar heights
const APP_BAR_MOBILE = 56;   // Reduced for mobile space optimization
const APP_BAR_TABLET = 64;   // Tablet-specific height
const APP_BAR_DESKTOP = 92;  // Desktop remains the same

const RootStyle = styled("div")({
  display: "flex",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div", {
  shouldForwardProp: (prop) => prop !== 'sidebarOpen'
})(({ theme, sidebarOpen }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  // Mobile-first responsive padding
  paddingTop: APP_BAR_MOBILE + 16,
  paddingBottom: theme.spacing(8),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  
  // Tablet optimization (768-1024px)
  [theme.breakpoints.up("md")]: {
    paddingTop: APP_BAR_TABLET + 20,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(9),
  },
  
  // Desktop optimization with persistent drawer support
  // Persistent drawer pushes content automatically when open
  // We only need to handle the transition smoothly
  [theme.breakpoints.up("lg")]: {
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  
  [theme.breakpoints.up("xl")]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(10),
  },
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  // Load initial sidebar state from localStorage (defaults to true/open)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('nexc_sidebar_state');
    return saved !== null ? saved === 'open' : true;
  });
  const location = useLocation();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nexc_sidebar_state', desktopSidebarOpen ? 'open' : 'closed');
  }, [desktopSidebarOpen]);

  // Hide breadcrumbs on dashboard overview page to avoid redundancy
  const showBreadcrumbs = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/overview';

  return (
    <RootStyle>
      <DashboardNavbar 
        onOpenSidebar={() => setOpen(true)}
        onToggleSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        isSidebarOpen={desktopSidebarOpen}
      />
      <DashboardSidebar
        isOpenSidebar={open}
        onCloseSidebar={() => setOpen(false)}
        isDesktopOpen={desktopSidebarOpen}
      />
      <MainStyle sidebarOpen={desktopSidebarOpen}>
        <Box
          sx={{
            maxWidth: (theme) => theme.breakpoints.values.xxl,
            mx: "auto", // Centers content
            width: "100%",
            height: "100%",
            // Enhanced responsive horizontal padding
            px: { 
              xs: 0.5,  // Minimal mobile padding
              sm: 1,    // Small mobile landscape
              md: 2,    // Tablet
              lg: 2.5,  // Small desktop
              xl: 3,    // Large desktop
            },
          }}
        >
          {/* Breadcrumb Navigation */}
          {showBreadcrumbs && <Breadcrumbs />}
          
          {/* Page Content */}
          <Outlet />
        </Box>
      </MainStyle>
    </RootStyle>
  );
}
