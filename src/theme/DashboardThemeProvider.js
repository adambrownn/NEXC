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
            default: '#161C24',
            paper: '#212B36',
          },
          text: {
            primary: '#fff',
            secondary: '#919EAB',
          },
        }),
      },
      shape,
      typography,
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
