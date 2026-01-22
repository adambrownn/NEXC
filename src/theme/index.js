import PropTypes from "prop-types";
import { useMemo } from "react";
// material
import { CssBaseline } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material/styles";
//
import shape from "./shape";
import palette, { getDarkPalette } from "./palette";
import typography from "./typography";
import spacingConfig from "./spacing";
import GlobalStyles from "./globalStyles"; 
import componentsOverride from "./overrides";
import shadows, { customShadows } from "./shadows";
import useSettings from "../hooks/useSettings";

// ----------------------------------------------------------------------

ThemeConfig.propTypes = {
  children: PropTypes.node,
};

function ThemeConfig({ children }) {
  const { themeMode, themeDirection, setColor } = useSettings();
  const isRTL = themeDirection === 'rtl';
  const isDarkMode = themeMode === 'dark';

  const themeOptions = useMemo(
    () => ({
      palette: {
        // Get the base palette first
        ...(isDarkMode ? getDarkPalette() : palette),
        
        // Only apply color preset primary color, not the whole palette
        ...(setColor && {
          primary: setColor.primary,
          // Keep the dark mode text and background colors intact
          ...(isDarkMode && {
            text: {
              primary: "#FFFFFF",
              secondary: palette.grey[400],
              disabled: palette.grey[600],
            },
            background: {
              paper: palette.grey[800],
              default: palette.grey[900],
              neutral: palette.grey[700],
            },
          }),
        }),
        
        // Ensure mode is set correctly
        mode: isDarkMode ? 'dark' : 'light',
      },
      shape,
      typography,
      
      // Enhanced spacing system
      spacing: spacingConfig.spacing,
      
      // Custom spacing utilities available on theme
      spacingConfig,
      
      direction: isRTL ? 'rtl' : 'ltr',
      shadows: isDarkMode ? shadows.dark : shadows.light,
      customShadows: isDarkMode ? customShadows.dark : customShadows.light,
    }),
    [isDarkMode, isRTL, setColor]
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  // Theme configuration complete - production ready

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}

// Export as DefaultThemeConfig for compatibility
export function DefaultThemeConfig({ children }) {
  return <ThemeConfig>{children}</ThemeConfig>;
}

export default DefaultThemeConfig;
