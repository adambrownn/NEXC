import PropTypes from "prop-types";
import { useMemo } from "react";
// material
import { CssBaseline } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material/styles";
//
import shape from "./shape";
import palette from "./palette";
import typography from "./typography";
import GlobalStyles from "./globalStyles";
import componentsOverride from "./overrides";
import shadows, { customShadows } from "./shadows";
import { useTheme } from './ThemeContext';

// ----------------------------------------------------------------------

DashboardThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function DashboardThemeProvider({ children }) {
  const theme = useTheme();
  const isDarkMode = theme?.isDarkMode ?? false;

  const themeOptions = useMemo(
    () => ({
      palette: {
        ...palette,
        mode: isDarkMode ? 'dark' : 'light',
        ...(isDarkMode && {
          background: {
            default: '#0A1929',
            paper: '#132F4C',
            neutral: '#1C2831',
          },
          text: {
            primary: '#fff',
            secondary: '#B2BAC2',
          },
          primary: {
            main: '#3366FF',
            light: '#5E84FF',
            dark: '#1939B7',
          },
        }),
        // Enhanced dashboard-specific colors
        dashboard: {
          card: {
            background: isDarkMode ? '#132F4C' : '#ffffff',
            hover: isDarkMode ? '#1C2831' : '#f8f9fa',
          },
          metric: {
            primary: '#1976d2',
            success: '#2e7d32',
            warning: '#ed6c02',
            error: '#d32f2f',
            info: '#0288d1',
          }
        }
      },
      shape,
      typography: {
        ...typography,
        // Enhanced dashboard typography
        h4: {
          ...typography.h4,
          fontWeight: 700,
        },
        h5: {
          ...typography.h5,
          fontWeight: 600,
        },
        subtitle1: {
          ...typography.subtitle1,
          fontWeight: 600,
        },
      },
      shadows: isDarkMode ? shadows.dark : shadows.light,
      customShadows: isDarkMode ? customShadows.dark : customShadows.light,
    }),
    [isDarkMode]
  );

  const muiTheme = createTheme(themeOptions);
  muiTheme.components = componentsOverride(muiTheme);

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}
