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
import { ThemeProvider as CustomThemeProvider, useTheme } from './ThemeContext';

// ----------------------------------------------------------------------

ThemeConfig.propTypes = {
  children: PropTypes.node,
};

function ThemeConfig({ children }) {
  const { isDarkMode } = useTheme();

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

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

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

export default function ThemeWrapper({ children }) {
  return (
    <CustomThemeProvider>
      <ThemeConfig>{children}</ThemeConfig>
    </CustomThemeProvider>
  );
}

export function DefaultThemeConfig({ children }) {
  const themeOptions = useMemo(
    () => ({
      palette: {
        ...palette,
        mode: 'light',
      },
      shape,
      typography,
      shadows: shadows.light,
      customShadows: customShadows.light,
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

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
