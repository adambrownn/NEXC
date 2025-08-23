import React, { useState, useRef, useEffect } from 'react';
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { HashLink as HLink } from "react-router-hash-link";
import { Link as RouterLink, useLocation } from "react-router-dom";
import arrowIosUpwardFill from "@iconify/icons-eva/arrow-ios-upward-fill";
import arrowIosDownwardFill from "@iconify/icons-eva/arrow-ios-downward-fill";
// material
import { experimentalStyled as styled } from "@mui/material/styles";
import {
  Box,
  Link,
  Grid,
  Typography,
  List,
  alpha,
  Stack,
  Popover,
  ListItem,
  ListSubheader,
  // CardActionArea,
} from "@mui/material";

import GroupBookingForm from "../../components/_external-pages/forms/GroupBookingForm";

// 1. Update LinkStyle with more consistent spacing
const LinkStyle = styled(Link)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.primary,
  marginRight: 0, // Remove right margin - we'll control this at container level
  padding: theme.spacing(0.75, 1.75), // Slightly increased padding for better tap target
  borderRadius: 6, // Slightly larger radius for modern look
  transition: theme.transitions.create(
    ["opacity", "color", "transform", "background-color", "box-shadow"],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  ),
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: 44, // Slightly taller for better visibility
  "&:hover": {
    opacity: 0.95,
    textDecoration: "none",
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transform: 'translateY(-1px)',
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -2,
    left: 0,
    width: 0,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transition: theme.transitions.create("width", {
      duration: 0.3,
      easing: theme.transitions.easing.easeInOut,
    }),
    borderRadius: '2px',
  },
  "&:hover::after": {
    width: "100%",
  },
}));

// Enhanced bullet with subtle animation
const IconBullet = styled(({ type = "item", ...props }) => (
  <Box {...props} sx={{
    width: 24,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: 'transform 0.2s ease-out',
  }}>
    <Box
      component="span"
      sx={{
        ml: "2px",
        width: 4,
        height: 4,
        borderRadius: "50%",
        bgcolor: "currentColor",
        transition: 'all 0.2s ease-out',
        ...(type !== "item" && {
          ml: 0,
          width: 8,
          height: 2,
          borderRadius: 2,
        }),
      }}
    />
  </Box>
))(({ theme }) => ({
  '&:hover': {
    transform: 'scale(1.2)',
  }
}));

IconBullet.propTypes = {
  type: PropTypes.oneOf(["subheader", "item"]),
};

MenuDesktopItem.propTypes = {
  item: PropTypes.object,
  pathname: PropTypes.string,
  isHome: PropTypes.bool,
  isOffset: PropTypes.bool,
  isOpen: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
};

function MenuDesktopItem({
  item,
  pathname,
  isHome,
  isOpen,
  isOffset,
  onOpen,
  onClose,
}) {
  // CRITICAL FIX: Properly destructure first to prevent "Cannot read properties of undefined" error
  const { title, path, children } = item;

  const isActive = pathname === path;
  const menuId = `menu-${title.toLowerCase().replace(/\s+/g, '-')}`;

  // Text shadow for better visibility on any background
  const textShadowStyle = isHome && !isOffset ? {
    textShadow: '0px 1px 3px rgba(0,0,0,0.6)',
    fontWeight: 600,
    letterSpacing: '0.01em',
  } : {};

  // Special case for Group Booking - check title instead of adding a new property
  if (title === "Group Booking" && !children) {
    return (
      <LinkStyle
        component="button"
        onClick={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          cursor: "pointer",
          alignItems: "center",
          border: 'none',
          background: 'none',
          ...(isHome && {
            color: "common.white",
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }),
          ...(isOffset && { color: "text.primary" }),
          ...(isActive && {
            color: "primary.main",
            "&::after": { width: "100%" },
            fontWeight: 'bold',
          }),
          ...textShadowStyle,
        }}
      >
        <GroupBookingForm menuIntegration={true}>
          {title}
        </GroupBookingForm>
      </LinkStyle>
    );
  }

  // Continue with existing code for menu items with children
  if (children) {
    return (
      <div key={title}>
        <LinkStyle
          onClick={onOpen}
          style={{ textDecoration: "none" }}
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={menuId}
          aria-haspopup="true"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            // Handle keyboard navigation
            if (event.key === 'Enter' || event.key === ' ') {
              onOpen();
              event.preventDefault();
            }
          }}
          sx={{
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            ...(isHome && {
              color: "common.white",
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }),
            ...(isOffset && { color: "text.primary" }),
            ...(isOpen && {
              opacity: 1,
              color: "primary.main",
              background: (theme) => alpha(theme.palette.primary.main, 0.1),
              transform: 'translateY(-1px)',
            }),
            ...(isActive && {
              color: "primary.main",
              "&::after": { width: "100%" },
              fontWeight: 'bold',
            }),
            ...textShadowStyle,
          }}
        >
          {title}
          <Box
            component={Icon}
            icon={isOpen ? arrowIosUpwardFill : arrowIosDownwardFill}
            sx={{
              ml: 0.5,
              width: 16,
              height: 16,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isOpen ? 'rotate(180deg) translateY(-1px)' : 'rotate(0deg)',
              filter: isHome && !isOffset ? 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' : 'none',
            }}
          />
        </LinkStyle>

        <Popover
          id={menuId}
          open={isOpen}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 80, left: 0 }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={onClose}
          PaperProps={{
            sx: {
              px: 3,
              pt: 5,
              pb: 3,
              right: 16,
              margin: "auto",
              maxWidth: 1080,
              borderRadius: '12px', // More rounded for modern look
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) => theme.customShadows.z24,
              animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(-15px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              },
              backgroundImage: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 1))'
                  : 'linear-gradient(rgba(22, 28, 36, 0.94), rgba(22, 28, 36, 0.98))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)', // Safari support
            },
          }}
        >
          <Grid container spacing={3}>
            {Array.isArray(children) && children.map((list) => {
              // Safe access to properties with default values
              const subheader = list?.subheader || '';
              const items = list?.items || [];

              return (
                <Grid
                  key={subheader || `grid-${Math.random()}`}
                  item
                  xs={12}
                  md={subheader === "Group Booking" ? 6 : 2}
                >
                  <List disablePadding>
                    <ListSubheader
                      disableSticky
                      disableGutters
                      sx={{
                        display: "flex",
                        lineHeight: "unset",
                        alignItems: "center",
                        color: "primary.main", // Highlight subheaders
                        typography: "overline",
                        mb: 1,
                        fontWeight: 700,
                        letterSpacing: '1px',
                        position: 'relative',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          bottom: -4,
                          width: 24,
                          height: 2,
                          backgroundColor: (theme) => theme.palette.primary.main,
                          borderRadius: 1,
                        }
                      }}
                    >
                      <IconBullet type="subheader" /> {subheader}
                    </ListSubheader>

                    {Array.isArray(items) && items.map((item, idx) => (
                      <React.Fragment key={item?.title || idx}>
                        {item?.title === "Group Booking" ? (
                          <Box
                            sx={{
                              borderRadius: 3,
                              color: "primary.main",
                              bgcolor: "background.neutral",
                              textAlign: "center",
                              p: 2,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: (theme) => `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
                                opacity: 0,
                                transition: 'opacity 0.5s ease',
                              },
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                transform: 'translateY(-5px)',
                                boxShadow: (theme) => theme.customShadows.z16,
                                '&:before': {
                                  opacity: 1,
                                },
                              },
                              '&:active': {
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) => theme.customShadows.z8,
                              },
                            }}
                            data-group-booking-form="true"
                            onClick={(e) => {
                              // Stop propagation to prevent menu from closing
                              e.stopPropagation();
                            }}
                          >
                            <GroupBookingForm menuIntegration={true}>
                              <Typography variant="subtitle1" color="primary.main" sx={{ mb: 1 }}>
                                Group Booking Request
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                Request information for corporate or group training
                              </Typography>
                            </GroupBookingForm>
                          </Box>
                        ) : (
                          <HLink
                            to={item?.path || "#"}
                            style={{
                              textDecoration: "none",
                            }}
                            onClick={onClose}
                          >
                            <ListItem
                              underline="none"
                              sx={{
                                p: 0.75, // Added padding for better click target
                                mt: 1.5, // Reduced spacing
                                borderRadius: 1.5, // Rounded corners for hover effect
                                typography: "body2",
                                color: "text.secondary",
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                '&:hover': {
                                  color: "primary.main",
                                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                  transform: 'translateX(5px)',
                                  '& .icon-bullet': {
                                    transform: 'scale(1.2)',
                                  }
                                },
                                '&:focus-visible': {
                                  outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                                  outlineOffset: 1,
                                },
                                ...(item?.path === pathname && {
                                  typography: "subtitle2",
                                  color: "primary.main",
                                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                }),
                              }}
                            >
                              <Box className="icon-bullet" sx={{ mr: 1, transition: 'transform 0.2s ease' }}>
                                <IconBullet />
                              </Box>
                              {item?.title}
                            </ListItem>
                          </HLink>
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>
              );
            })}
          </Grid>
        </Popover>
      </div>
    );
  }

  // Regular menu items (not dropdowns)
  return (
    <LinkStyle
      to={path}
      component={RouterLink}
      sx={{
        ...(isHome && {
          color: "common.white",
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }),
        ...(isOffset && { color: "text.primary" }),
        ...(isActive && {
          color: "primary.main",
          "&::after": { width: "100%" },
          fontWeight: 'bold',
        }),
        ...textShadowStyle,
      }}
    >
      {title}
    </LinkStyle>
  );
}

MenuDesktop.propTypes = {
  isOffset: PropTypes.bool,
  isHome: PropTypes.bool,
  navConfig: PropTypes.array,
};

export default function MenuDesktop({ isOffset, isHome, navConfig }) {
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const handleOpen = (title) => {
    setOpenMenu(title);
  };

  const handleClose = () => {
    setOpenMenu(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Don't close if clicking inside a form dialog
      const dialogElement = document.querySelector('.MuiDialog-root');
      if (dialogElement && dialogElement.contains(event.target)) {
        return;
      }

      // Don't close if clicking inside the Popover content
      const popoverContent = document.querySelector('.MuiPopover-paper');
      if (popoverContent && popoverContent.contains(event.target)) {
        return; // This prevents the menu from closing when clicking form elements
      }

      // Don't close if clicking inside a form or if target has specific data attribute
      if (event.target.closest('[data-group-booking-form="true"]')) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    }

    // Handle ESC key
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // 2. Update the Stack component in the return section
  return (
    <nav aria-label="Main Navigation" ref={menuRef}>
      <Stack
        direction="row"
        component="ul"
        spacing={1} // Small base spacing between items
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'flex',
          alignItems: 'center', // Ensure vertical centering
          height: 64, // Consistent height with your navbar
          '& > li': {
            display: 'inline-flex', // Change to inline-flex for better alignment
            alignItems: 'center',
            justifyContent: 'center',
            // Add proper spacing between items
            '&:not(:last-child)': {
              marginRight: 1, // Default spacing
            },
            // For responsive spacing
            '@media (min-width: 900px)': { // md breakpoint
              '&:not(:last-child)': {
                marginRight: 2,
              },
            },
            '@media (min-width: 1200px)': { // lg breakpoint
              '&:not(:last-child)': {
                marginRight: 3,
              },
            },
          }
        }}
      >
        {navConfig.map((link) => (
          <li key={link.title}>
            <MenuDesktopItem
              item={link}
              pathname={pathname}
              isOpen={openMenu === link.title}
              onOpen={() => handleOpen(link.title)}
              onClose={handleClose}
              isOffset={isOffset}
              isHome={isHome}
            />
          </li>
        ))}
      </Stack>
    </nav>
  );
}