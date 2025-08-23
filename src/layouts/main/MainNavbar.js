import { useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
// material
import { Icon } from "@iconify/react";
import phoneCallFill from "@iconify/icons-eva/phone-call-fill";
import { experimentalStyled as styled } from "@mui/material/styles";
import { Box, Button, AppBar, Toolbar, Container, useTheme, alpha } from "@mui/material";
// hooks
// import useOffSetTop from "../../hooks/useOffSetTop";
// components
import Logo from "../../components/Logo";
import { MHidden } from "../../components/@material-extend";
import MenuDesktop from "./MenuDesktop";
import MenuMobile from "./MenuMobile";
import navConfig from "./MenuConfig";
import CartCount from "../../components/CartCount";
import { useEffect, useState, useRef } from 'react';
import UserAuthIcon from "../../components/authentication/UserAuthIcon";

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 76; // Slightly smaller for cleaner look

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  height: APP_BAR_MOBILE,
  transition: theme.transitions.create(["height", "background-color"], {
    easing: theme.transitions.easing.easeInOut,
    duration: '0.3s',
  }),
  [theme.breakpoints.up("md")]: {
    height: APP_BAR_DESKTOP,
  },
}));

// Refined shadow style with more subtle effect
const ToolbarShadowStyle = styled("div")(({ theme }) => ({
  left: 0,
  right: 0,
  bottom: 0,
  height: 6,
  zIndex: -1,
  margin: "auto",
  position: "absolute",
  width: "100%",
  boxShadow: theme.palette.mode === 'light'
    ? '0 1px 8px rgba(0, 0, 0, 0.06)'
    : '0 1px 8px rgba(0, 0, 0, 0.2)',
}));

// Enhanced logo wrapper with smoother animation
const LogoWrapper = styled('a')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

// Phone button with branded styling
const PhoneButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isHome' && prop !== 'isOffset'
})(({ theme, isHome, isOffset }) => ({
  minWidth: 'auto',
  width: 40, // Make it the same size as other icons
  height: 40,
  padding: 0,
  borderRadius: '50%', // Make it circular like other action icons
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  color: isHome && !isOffset ? '#ffffff' : theme.palette.text.primary,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: isHome && !isOffset
      ? 'rgba(255, 255, 255, 0.1)'
      : alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
  },
}));

// Action container with enhanced hover effect
// const ActionContainer = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   gap: theme.spacing(2),
//   position: 'relative',
//   padding: theme.spacing(1, 0),
//   '&::after': {
//     content: '""',
//     position: 'absolute',
//     bottom: -2,
//     left: 0,
//     width: 0,
//     height: 2,
//     backgroundColor: theme.palette.primary.main,
//     transition: 'width 0.3s ease-out',
//   },
//   '&:hover::after': {
//     width: '100%',
//   }
// }));

export default function MainNavbar() {
  // const isOffset = useOffSetTop(64); // Trigger sooner for better UX
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const navbarRef = useRef(null);
  const theme = useTheme();
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // New state for smooth transitions

  // Throttle function to prevent excessive function calls
  const throttle = (func, delay) => {
    let inProgress = false;
    return (...args) => {
      if (inProgress) return;
      inProgress = true;
      setTimeout(() => {
        func(...args);
        inProgress = false;
      }, delay);
    };
  };

  useEffect(() => {
    const navbarElement = navbarRef.current;
    if (!navbarElement) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        document.documentElement.style.setProperty('--navbar-height', `${height}px`);
      }
    });

    resizeObserver.observe(navbarElement);

    // Throttled scroll handler with enhanced scroll effects
    const handleScroll = throttle(() => {
      const currentScrollPos = window.pageYOffset;

      // Calculate scroll progress for smooth background transition (0 to 1)
      // Complete transition by 60px of scrolling
      const progress = Math.min(currentScrollPos / 60, 1);
      setScrollProgress(progress);

      // Calculate visibility with hysteresis to prevent flickering
      const scrollingDown = currentScrollPos > prevScrollPos;
      const scrollAmount = Math.abs(currentScrollPos - prevScrollPos);

      if (scrollingDown && scrollAmount > 20 && currentScrollPos > 300) {
        setVisible(false);
      } else if (!scrollingDown && scrollAmount > 5) {
        setVisible(true);
      }

      setPrevScrollPos(currentScrollPos);
    }, 30); // Slightly faster throttle for smoother transitions

    window.addEventListener('scroll', handleScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  // Calculate background styles based on scroll progress
  const getNavbarBackgroundStyles = () => {
    if (!isHome) {
      // Non-home pages just use default background
      return theme.palette.background.default;
    }

    if (scrollProgress === 0) {
      // Completely transparent at top of page (home only)
      return 'transparent';
    }

    // Add subtle brand color tint to the background (adjust alpha value as needed)
    // Using primary color at very low opacity mixed with white
    return theme.palette.mode === 'light'
      ? `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.03 * scrollProgress)}, ${alpha('rgb(255, 255, 255)', 0.85 * scrollProgress)})`
      : `linear-gradient(to bottom, ${alpha(theme.palette.primary.dark, 0.05 * scrollProgress)}, ${alpha('rgb(22, 28, 36)', 0.85 * scrollProgress)})`;
  };

  return (
    <>
      <Helmet>
        {/* Schema.org data for SEO */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NEXC",
              "url": "https://nexc.co.uk",
              "logo": "https://nexc.co.uk/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9971714172",
                "contactType": "customer service"
              }
            }
          `}
        </script>
      </Helmet>

      <AppBar
        ref={navbarRef}
        sx={{
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          backdropFilter: scrollProgress > 0 ? `blur(${Math.min(8 * scrollProgress, 8)}px)` : 'none',
          WebkitBackdropFilter: scrollProgress > 0 ? `blur(${Math.min(8 * scrollProgress, 8)}px)` : 'none',
          background: getNavbarBackgroundStyles(),
          borderBottom: scrollProgress > 0.3
            ? `1px solid ${theme.palette.mode === 'light'
              ? alpha('rgb(230, 230, 230)', scrollProgress * 0.8)
              : alpha('rgb(45, 45, 45)', scrollProgress * 0.6)}`
            : 'none',
          // More subtle gradient for home page that fades completely
          ...(isHome && scrollProgress === 0 && {
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 0
            }
          })
        }}
      >
        <ToolbarStyle
          disableGutters
          sx={{
            ...(scrollProgress > 0.5 && {
              height: { md: APP_BAR_DESKTOP - 6 * scrollProgress },
            }),
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
            }}
          >
            <LogoWrapper href="/" aria-label="Return to homepage">
              <Logo />
            </LogoWrapper>

            <Box sx={{ flexGrow: 1 }} />

            <MHidden width="mdDown">
              <MenuDesktop
                isOffset={scrollProgress > 0.5}
                isHome={isHome && scrollProgress === 0}
                navConfig={navConfig}
              />
            </MHidden>

            {/* Action buttons with branded styling */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 }
            }}>
              {/* Phone button as an icon only */}
              <PhoneButton
                href="tel:+919971714172"
                aria-label="Call customer support"
                isHome={isHome && scrollProgress === 0}
                isOffset={scrollProgress > 0}
              >
                <Icon icon={phoneCallFill} width={22} height={22} />
              </PhoneButton>

              {/* Cart icon */}
              <CartCount position="navbar" />

              {/* User auth icon */}
              <UserAuthIcon
                isHome={isHome && scrollProgress === 0}
                isOffset={scrollProgress > 0}
              />

              {/* Mobile menu - slightly separated */}
              <MHidden width="mdUp">
                <Box component="span" sx={{ ml: 0.5 }}>
                  <MenuMobile
                    isOffset={scrollProgress > 0.3}
                    isHome={isHome && scrollProgress === 0}
                    navConfig={navConfig}
                  />
                </Box>
              </MHidden>
            </Box>
          </Container>
        </ToolbarStyle>

        {scrollProgress > 0.3 && <ToolbarShadowStyle />}
      </AppBar>
    </>
  );
}
