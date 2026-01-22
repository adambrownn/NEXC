// ----------------------------------------------------------------------

// Function to calculate responsive font sizes
function pxToRem(value) {
  return `${value / 16}rem`;
}

// Enhanced responsive font sizes with mobile-first approach and tablet breakpoint
function responsiveFontSizes({ xs, sm, md, lg, xl }) {
  const breakpoints = {};
  
  // Mobile-first base size
  if (xs) breakpoints.fontSize = pxToRem(xs);
  
  // Small mobile landscape (576px+)
  if (sm) {
    breakpoints["@media (min-width:576px)"] = {
      fontSize: pxToRem(sm),
    };
  }
  
  // Tablet (768px+) - matches our enhanced breakpoint system
  if (md) {
    breakpoints["@media (min-width:768px)"] = {
      fontSize: pxToRem(md),
    };
  }
  
  // Desktop (1024px+)
  if (lg) {
    breakpoints["@media (min-width:1024px)"] = {
      fontSize: pxToRem(lg),
    };
  }
  
  // Large desktop (1440px+)
  if (xl) {
    breakpoints["@media (min-width:1440px)"] = {
      fontSize: pxToRem(xl),
    };
  }
  
  return breakpoints;
}

// Enhanced responsive line heights for better mobile readability
function responsiveLineHeights({ xs, sm, md, lg }) {
  const breakpoints = {};
  
  if (xs) breakpoints.lineHeight = xs;
  if (sm) breakpoints["@media (min-width:576px)"] = { lineHeight: sm };
  if (md) breakpoints["@media (min-width:768px)"] = { lineHeight: md };
  if (lg) breakpoints["@media (min-width:1024px)"] = { lineHeight: lg };
  
  return breakpoints;
}

// Enhanced typography with construction industry focus
const FONT_PRIMARY = "Roboto, sans-serif"; // Keep your existing choice
const FONT_SECONDARY = "'Roboto Condensed', Roboto, sans-serif"; // For headers

const typography = {
  fontFamily: FONT_PRIMARY,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,

  // Enhanced responsive headings with mobile-first approach
  h1: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 28, sm: 32, md: 40, lg: 48, xl: 64 }),
    ...responsiveLineHeights({ xs: 1.2, sm: 1.2, md: 1.25, lg: 1.25 }),
  },
  h2: {
    fontWeight: 700,
    letterSpacing: "-0.01em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 24, sm: 28, md: 32, lg: 40, xl: 48 }),
    ...responsiveLineHeights({ xs: 1.3, sm: 1.3, md: 1.33, lg: 1.33 }),
  },
  h3: {
    fontWeight: 600,
    letterSpacing: "-0.005em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 20, sm: 22, md: 24, lg: 28, xl: 32 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.4, md: 1.4, lg: 1.5 }),
  },
  h4: {
    fontWeight: 600,
    letterSpacing: "0em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 18, sm: 18, md: 20, lg: 22, xl: 24 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.4, md: 1.5, lg: 1.5 }),
  },
  h5: {
    fontWeight: 600,
    letterSpacing: "0.005em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 16, sm: 17, md: 18, lg: 19, xl: 20 }),
    ...responsiveLineHeights({ xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5 }),
  },
  h6: {
    fontWeight: 600,
    letterSpacing: "0.01em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 14, sm: 15, md: 16, lg: 17, xl: 18 }),
    ...responsiveLineHeights({ xs: 1.5, sm: 1.5, md: 1.55, lg: 1.55 }),
  },

  // Enhanced responsive body text with mobile optimization
  subtitle1: {
    fontWeight: 500,
    letterSpacing: "0.01em",
    ...responsiveFontSizes({ xs: 15, sm: 16, md: 16, lg: 17 }),
    ...responsiveLineHeights({ xs: 1.5, sm: 1.6, md: 1.6, lg: 1.6 }),
  },
  subtitle2: {
    fontWeight: 500,
    letterSpacing: "0.02em",
    ...responsiveFontSizes({ xs: 13, sm: 14, md: 14, lg: 15 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.57, lg: 1.57 }),
  },
  body1: {
    fontWeight: 400,
    letterSpacing: "0.01em",
    ...responsiveFontSizes({ xs: 14, sm: 15, md: 16, lg: 16 }),
    ...responsiveLineHeights({ xs: 1.5, sm: 1.6, md: 1.6, lg: 1.6 }),
  },
  body2: {
    fontWeight: 400,
    letterSpacing: "0.02em",
    ...responsiveFontSizes({ xs: 12, sm: 13, md: 14, lg: 14 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.57, lg: 1.57 }),
  },
  caption: {
    fontWeight: 400,
    letterSpacing: "0.03em",
    ...responsiveFontSizes({ xs: 11, sm: 12, md: 12, lg: 12 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.5, lg: 1.5 }),
  },
  overline: {
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    ...responsiveFontSizes({ xs: 10, sm: 11, md: 12, lg: 12 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.5, lg: 1.5 }),
  },
  button: {
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "none",
    ...responsiveFontSizes({ xs: 13, sm: 14, md: 14, lg: 15 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.71, lg: 1.6 }),
  },

  // Enhanced construction-specific styles with mobile responsiveness
  dashboardTitle: {
    fontWeight: 700,
    letterSpacing: "-0.01em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 22, sm: 24, md: 26, lg: 28, xl: 32 }),
    ...responsiveLineHeights({ xs: 1.2, sm: 1.2, md: 1.25, lg: 1.25 }),
  },
  dashboardSubtitle: {
    fontWeight: 500,
    letterSpacing: "0.005em",
    ...responsiveFontSizes({ xs: 14, sm: 15, md: 16, lg: 17 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.5, lg: 1.5 }),
  },
  cardTitle: {
    fontWeight: 600,
    letterSpacing: "0.005em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 16, sm: 17, md: 18, lg: 20 }),
    ...responsiveLineHeights({ xs: 1.3, sm: 1.4, md: 1.4, lg: 1.4 }),
  },
  cardSubtitle: {
    fontWeight: 500,
    letterSpacing: "0.01em",
    ...responsiveFontSizes({ xs: 12, sm: 13, md: 14, lg: 14 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.5, lg: 1.5 }),
  },
  metricValue: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 24, sm: 28, md: 32, lg: 36, xl: 40 }),
    ...responsiveLineHeights({ xs: 1.1, sm: 1.1, md: 1.2, lg: 1.2 }),
  },
  metricLabel: {
    fontWeight: 500,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    ...responsiveFontSizes({ xs: 11, sm: 12, md: 13, lg: 14 }),
    ...responsiveLineHeights({ xs: 1.3, sm: 1.4, md: 1.4, lg: 1.4 }),
  },
  sectionHeader: {
    fontWeight: 600,
    letterSpacing: "-0.005em",
    fontFamily: FONT_SECONDARY,
    ...responsiveFontSizes({ xs: 18, sm: 19, md: 20, lg: 22 }),
    ...responsiveLineHeights({ xs: 1.3, sm: 1.3, md: 1.3, lg: 1.3 }),
  },
  navGroupTitle: {
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    ...responsiveFontSizes({ xs: 10, sm: 11, md: 11, lg: 12 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.5, lg: 1.5 }),
  },

  // Enhanced construction industry specific text styles
  safetyText: {
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    ...responsiveFontSizes({ xs: 12, sm: 13, md: 14, lg: 14 }),
    ...responsiveLineHeights({ xs: 1.3, sm: 1.4, md: 1.4, lg: 1.4 }),
  },
  statusText: {
    fontWeight: 500,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    ...responsiveFontSizes({ xs: 11, sm: 12, md: 13, lg: 13 }),
    ...responsiveLineHeights({ xs: 1.3, sm: 1.4, md: 1.4, lg: 1.4 }),
  },
  technicalText: {
    fontFamily: "'Roboto Mono', monospace",
    fontWeight: 400,
    letterSpacing: "0.01em",
    ...responsiveFontSizes({ xs: 11, sm: 12, md: 13, lg: 13 }),
    ...responsiveLineHeights({ xs: 1.4, sm: 1.5, md: 1.5, lg: 1.5 }),
  },

  // Mobile-specific component variants
  mobileCardTitle: {
    fontWeight: 600,
    letterSpacing: "0.005em",
    fontFamily: FONT_SECONDARY,
    fontSize: pxToRem(15),
    lineHeight: 1.3,
  },
  mobileMetricValue: {
    fontWeight: 700,
    letterSpacing: "-0.01em",
    fontFamily: FONT_SECONDARY,
    fontSize: pxToRem(20),
    lineHeight: 1.2,
  },
  mobileNavItem: {
    fontWeight: 500,
    letterSpacing: "0.01em",
    fontSize: pxToRem(14),
    lineHeight: 1.4,
  },
  mobileButtonText: {
    fontWeight: 600,
    letterSpacing: "0.02em",
    fontSize: pxToRem(13),
    lineHeight: 1.4,
    textTransform: "none",
  },
};

export default typography;
