import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react"; // Added useRef
import menu2Fill from "@iconify/icons-eva/menu-2-fill";
import { HashLink as HLink } from "react-router-hash-link";
import { NavLink as RouterLink, useLocation } from "react-router-dom";
import arrowIosForwardFill from "@iconify/icons-eva/arrow-ios-forward-fill";
import arrowIosDownwardFill from "@iconify/icons-eva/arrow-ios-downward-fill";
import phoneCallFill from "@iconify/icons-eva/phone-call-fill";
import closeCircleOutline from "@iconify/icons-eva/close-circle-outline"; // Added close icon
// material
import { alpha, experimentalStyled as styled } from "@mui/material/styles";
import {
  Box,
  List,
  Drawer,
  Link,
  Collapse,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Typography, // Added for better typography
  IconButton, // Added for better close button
  Divider, // Added for visual separation
} from "@mui/material";
// components
import Logo from "../../components/Logo";
import NavSection from "../../components/NavSection";
import Scrollbar from "../../components/Scrollbar";
import { MIconButton } from "../../components/@material-extend";
//
// import menuConfig from "./MenuConfig";
// import GroupBookingForm from "../../components/_external-pages/forms/GroupBookingForm"; // Added for Group Booking integration

// ----------------------------------------------------------------------

const ICON_SIZE = 22;
const ITEM_SIZE = 52; // Increased for better touch targets
const PADDING = 2.5;

const ListItemStyle = styled(ListItem)(({ theme }) => ({
  ...theme.typography.body2,
  height: ITEM_SIZE,
  textTransform: "capitalize",
  paddingLeft: theme.spacing(PADDING),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.text.secondary,
  transition: theme.transitions.create(['color', 'background-color', 'padding'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  '&:active': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
}));

// Header section with logo and close button
const DrawerHeaderStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1, 1, PADDING),
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)', // For Safari
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  position: 'sticky',
  top: 0,
  zIndex: 1100,
}));

// ----------------------------------------------------------------------

MenuMobileItem.propTypes = {
  item: PropTypes.object,
  isOpen: PropTypes.bool,
  isActive: PropTypes.bool,
  onOpen: PropTypes.func,
};

function MenuMobileItem({ item, isOpen, isActive, onOpen }) {
  const { title, path, icon, children } = item;

  // Group Booking now navigates to the /groupbooking page directly
  // Removed special handling that opened the old form

  if (children) {
    return (
      <div key={title}>
        <ListItemStyle button onClick={onOpen}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" sx={{ fontWeight: isOpen ? 600 : 400 }}>
                {title}
              </Typography>
            }
          />
          <Box
            component={Icon}
            icon={isOpen ? arrowIosDownwardFill : arrowIosForwardFill}
            sx={{
              width: 16,
              height: 16,
              ml: 1,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', // Fixed rotation
            }}
          />
        </ListItemStyle>

        <Collapse in={isOpen} timeout={300} unmountOnExit>
          <Box sx={{
            display: "flex",
            flexDirection: "column-reverse",
            background: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderLeft: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            mx: 2,
            borderRadius: 1,
            overflow: 'hidden',
          }}>
            <NavSection
              navConfig={children}
              sx={{
                // Enhanced styling for child menu items
                "&.MuiList-root:last-child .MuiListItem-root": {
                  height: 200,
                  backgroundSize: "92%",
                  backgroundPosition: "center",
                  bgcolor: "background.neutral",
                  backgroundRepeat: "no-repeat",
                  backgroundImage:
                    "url(/static/illustrations/illustration_dashboard.png)",
                  "& > *:not(.MuiTouchRipple-root)": { display: "none" },
                },
                "& .MuiListSubheader-root": {
                  pl: PADDING,
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  paddingTop: 1.5,
                  paddingBottom: 0.5,
                  "&:before": {
                    ml: "6px",
                    mr: "22px",
                    width: 8,
                    height: 2,
                    content: "''",
                    borderRadius: 2,
                    bgcolor: "currentColor",
                  },
                },
                "& .MuiListItem-root": {
                  pl: PADDING,
                  "&:before": { display: "none" },
                  "&.active": { color: "primary.main", bgcolor: "transparent" },
                  fontSize: '0.875rem',
                },
                "& .MuiListItemIcon-root": {
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  "&:before": {
                    width: 4,
                    height: 4,
                    content: "''",
                    borderRadius: "50%",
                    bgcolor: "currentColor",
                  },
                },
              }}
            />
          </Box>
        </Collapse>
      </div>
    );
  }

  return (
    <ListItemStyle
      button
      key={title}
      to={path}
      component={HLink}
      sx={{
        ...(isActive && {
          color: "primary.main",
          fontWeight: "fontWeightMedium",
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity
            ),
        }),
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Typography
            variant="body2"
            sx={{
              fontWeight: isActive ? 600 : 400,
              transition: 'font-weight 0.2s ease'
            }}
          >
            {title}
          </Typography>
        }
      />
    </ListItemStyle>
  );
}

MenuMobile.propTypes = {
  isOffset: PropTypes.bool,
  isHome: PropTypes.bool,
  navConfig: PropTypes.array,
};

export default function MenuMobile({ isOffset, isHome, navConfig }) {
  const { pathname } = useLocation();
  const [openItem, setOpenItem] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      handleDrawerClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleOpen = (title) => {
    setOpenItem(openItem === title ? '' : title);
  };

  return (
    <>
      <MIconButton
        onClick={handleDrawerOpen}
        aria-label="Open main menu" // Add aria-label
        aria-expanded={mobileOpen} // Add aria-expanded state
        sx={{
          ml: 1,
          ...(isHome && { color: "common.white" }),
          ...(isOffset && { color: "text.primary" }),
          // Add subtle hover effect
          '&:hover': {
            backgroundColor: isHome && !isOffset
              ? 'rgba(255, 255, 255, 0.1)'
              : (theme) => alpha(theme.palette.primary.main, 0.08)
          },
        }}
      >
        <Icon icon={menu2Fill} />
      </MIconButton>

      <Drawer
        open={mobileOpen}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            pb: 5,
            width: 280, // Slightly wider for better experience
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: (theme) => theme.customShadows.z24,
          }
        }}
        // Improved animation
        transitionDuration={{ enter: 400, exit: 300 }}
        SlideProps={{
          easing: {
            enter: 'cubic-bezier(0.3, 0, 0.3, 1)',
            exit: 'cubic-bezier(0.6, 0, 0.6, 1)'
          }
        }}
        // Add overlay transition for better UX
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }
        }}
      >
        <Scrollbar>
          {/* New header with close button */}
          <DrawerHeaderStyle>
            <Link component={RouterLink} to="/" sx={{ display: "inline-flex" }}>
              <Logo sx={{ height: 40 }} />
            </Link>
            <IconButton
              onClick={handleDrawerClose}
              sx={{
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.2s ease'
              }}
            >
              <Icon icon={closeCircleOutline} width={24} height={24} />
            </IconButton>
          </DrawerHeaderStyle>

          {/* Call button - enhanced styling */}
          <Box sx={{ px: 1.5, mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              href="tel:+919971714172"
              startIcon={
                <Icon
                  icon={phoneCallFill}
                  style={{
                    flexShrink: 0
                  }}
                />
              }
              aria-label="Call our support team at +91 99717 14172"
              onClick={() => {
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'click_to_call', {
                    event_category: 'Contact',
                    event_label: 'Mobile Menu'
                  });
                }
              }}
              sx={{
                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                fontWeight: 700,
                borderRadius: (theme) => theme.shape.borderRadiusMd || 8,
                boxShadow: (theme) => theme.customShadows.z8,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: {
                  xs: '0.8125rem',
                  sm: '0.875rem'
                },
                px: 2.5,
                py: 1,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.customShadows.z16,
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => theme.customShadows.z8,
                },
                '& .MuiButton-startIcon': {
                  marginRight: 1
                }
              }}
            >
              +91 99717 14172
            </Button>
          </Box>

          <Divider sx={{ my: 2, opacity: 0.6 }} />

          {/* Navigation menu with improved handling */}
          <List disablePadding>
            {navConfig.map((link) => (
              <MenuMobileItem
                key={link.title}
                item={link}
                isOpen={openItem === link.title}
                onOpen={() => handleOpen(link.title)}
                isActive={pathname === link.path}
              />
            ))}
          </List>
        </Scrollbar>
      </Drawer>
    </>
  );
}
