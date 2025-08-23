import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";
import GlobalStyles from "../../components/GlobalStyles";
import { useEffect, useState } from 'react';
import CartCount from "../../components/CartCount";

export default function MainLayout() {
    // We'll still measure the navbar height here as fallback
    const [navHeight, setNavHeight] = useState(64);

    useEffect(() => {
        // This is now a fallback mechanism only
        // The primary height is now set by MainNavbar component
        const navbarElement = document.querySelector('.MuiAppBar-root');
        if (navbarElement) {
            const updateHeight = () => {
                // Read the CSS variable value that MainNavbar sets
                const cssVarHeight = getComputedStyle(document.documentElement)
                    .getPropertyValue('--navbar-height').trim();

                // Only set height if MainNavbar hasn't set it
                if (!cssVarHeight || cssVarHeight === '') {
                    const height = navbarElement.offsetHeight;
                    setNavHeight(height);
                    document.documentElement.style.setProperty('--navbar-height', `${height}px`);
                }
            };

            // Initial measurement as fallback
            setTimeout(updateHeight, 200);

            // Fallback event listeners
            window.addEventListener('load', updateHeight);

            return () => {
                window.removeEventListener('load', updateHeight);
            };
        }
    }, []);

    return (
        <>
            <GlobalStyles
                styles={{
                    ':root': {
                        '--navbar-height': `${navHeight}px`,
                    },
                    // Target all immediate children of content wrapper for padding
                    '.content-wrapper > *:first-of-type': {
                        paddingTop: 'var(--navbar-height)',
                        marginTop: 0, // Ensure no extra margins
                    },
                    // Special handling for hero sections
                    '.hero-section': {
                        minHeight: '100vh',
                        paddingTop: 'var(--navbar-height)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }
                }}
            />

            <Box
                component="header"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    backgroundColor: 'transparent', // Ensure header container is transparent
                }}
                className="navbar-container"
            >
                <MainNavbar />
                <CartCount position="global" />
            </Box>

            <Box
                className="content-wrapper"
                sx={{
                    minHeight: '100vh',
                    position: 'relative', // Create proper stacking context
                    zIndex: 1 // Set z-index to ensure content appears above navbar gradient
                }}
            >
                <Outlet />
            </Box>
            <CartCount position="global" />

            <MainFooter />
        </>
    );
}