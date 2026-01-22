const breakpoints = {
  values: {
    xs: 0,        // Mobile portrait
    sm: 576,      // Mobile landscape (updated for better mobile support)
    md: 768,      // Tablet portrait (optimized for iPad)
    lg: 1024,     // Tablet landscape / Small desktop  
    xl: 1200,     // Desktop
    xxl: 1440,    // Large desktop (updated for modern screens)
    
    // Touch-friendly constants
    minTarget: 44,    // Minimum touch target size (WCAG 2.1 AA)
    comfortable: 48,  // Comfortable touch target
    generous: 56,     // Generous touch target
  },
  
  // Enhanced utility functions for consistent breakpoint usage
  up: (key) => `@media (min-width:${breakpoints.values[key]}px)`,
  down: (key) => `@media (max-width:${breakpoints.values[key] - 1}px)`,
  between: (start, end) => 
    `@media (min-width:${breakpoints.values[start]}px) and (max-width:${breakpoints.values[end] - 1}px)`,
  only: (key) => {
    const keys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const index = keys.indexOf(key);
    const nextKey = keys[index + 1];
    
    if (index === keys.length - 1) {
      return breakpoints.up(key);
    }
    return breakpoints.between(key, nextKey);
  },
  
  // Device-specific breakpoint helpers
  device: {
    mobile: '@media (max-width:767px)',           // 0-767px
    tablet: '@media (min-width:768px) and (max-width:1023px)', // 768-1023px  
    desktop: '@media (min-width:1024px)',         // 1024px+
    mobileAndTablet: '@media (max-width:1023px)', // 0-1023px
    tabletAndDesktop: '@media (min-width:768px)', // 768px+
  },
  
  // Touch-friendly sizing constants
  touch: {
    minTarget: 44,    // Minimum touch target size (iOS/Android guidelines)
    spacing: 8,       // Minimum spacing between touch targets
    buttonHeight: 48, // Standard button height for mobile
    iconSize: 24,     // Standard icon size for mobile
    navHeight: 56,    // Mobile navigation height
    tabletNavHeight: 64, // Tablet navigation height
  },
  
  // Common responsive patterns for sx prop
  patterns: {
    hideMobile: {
      display: { xs: 'none', md: 'block' }
    },
    hideTablet: {
      display: { xs: 'block', md: 'none', lg: 'block' }
    },
    hideDesktop: {
      display: { xs: 'block', lg: 'none' }
    },
    showMobileOnly: {
      display: { xs: 'block', md: 'none' }
    },
    showTabletOnly: {
      display: { xs: 'none', md: 'block', lg: 'none' }
    },
    showDesktopOnly: {
      display: { xs: 'none', lg: 'block' }
    },
  },
};

export default breakpoints;
