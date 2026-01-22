import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

function createGradient(color1, color2) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`;
}

// SETUP COLORS - Enhanced for Construction Industry
const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
  500_8: alpha("#919EAB", 0.08),
  500_12: alpha("#919EAB", 0.12),
  500_16: alpha("#919EAB", 0.16),
  500_24: alpha("#919EAB", 0.24),
  500_32: alpha("#919EAB", 0.32),
  500_48: alpha("#919EAB", 0.48),
  500_56: alpha("#919EAB", 0.56),
  500_80: alpha("#919EAB", 0.8),
};

// Enhanced Construction Steel Gray variations
const STEEL = {
  50: "#F8F9FA",
  100: "#F1F3F4",
  200: "#E8EAED",
  300: "#DADCE0",
  400: "#BDC1C6",
  500: "#9AA0A6",
  600: "#80868B",
  700: "#5F6368",
  800: "#3C4043",
  900: "#202124",
};

// Your excellent blue - keeping as primary with enhancements
const PRIMARY = {
  lighter: "#D1E9FC",
  light: "#76B0F1",
  main: "#2065D1", // Your excellent construction blue
  dark: "#103996",
  darker: "#061B64",
  contrastText: "#fff",
  // Added construction-specific variations
  50: "#E3F2FD",
  100: "#BBDEFB",
  200: "#90CAF9",
  300: "#64B5F6",
  400: "#42A5F5",
  500: "#2065D1", // Your main blue
  600: "#1E88E5",
  700: "#1976D2",
  800: "#1565C0",
  900: "#0D47A1",
  // Alpha variations for subtle backgrounds
  alpha8: alpha("#2065D1", 0.08),
  alpha12: alpha("#2065D1", 0.12),
  alpha16: alpha("#2065D1", 0.16),
  alpha24: alpha("#2065D1", 0.24),
};

// Complementary construction blue
const SECONDARY = {
  lighter: "#D6E4FF",
  light: "#84A9FF",
  main: "#3366FF",
  dark: "#1939B7",
  darker: "#091A7A",
  contrastText: "#fff",
};

// Construction Safety Green - Enhanced
const SUCCESS = {
  lighter: "#E8F5E8",
  light: "#81C784",
  main: "#2E7D32", // Construction safety green
  dark: "#1B5E20",
  darker: "#0D4D11",
  contrastText: "#fff",
  // Construction variations
  safety: "#4CAF50", // Safety equipment green
  safetyLight: alpha("#4CAF50", 0.16),
};

// Construction Safety Orange/Yellow - Enhanced
const WARNING = {
  lighter: "#FFF8E1",
  light: "#FFE082",
  main: "#FF9800", // Construction warning orange
  dark: "#F57C00",
  darker: "#E65100",
  contrastText: "#212121",
  // Construction variations
  safety: "#FFC107", // Safety vest yellow
  safetyOrange: "#FF5722", // Construction cone orange
  caution: alpha("#FF9800", 0.16),
};

// Construction Alert Red - Enhanced
const ERROR = {
  lighter: "#FFEBEE",
  light: "#EF5350",
  main: "#D32F2F", // Construction alert red
  dark: "#C62828",
  darker: "#B71C1C",
  contrastText: "#fff",
  // Construction variations
  danger: "#F44336",
  alert: alpha("#D32F2F", 0.16),
};

// Construction Information Blue - Enhanced
const INFO = {
  lighter: "#E1F5FE",
  light: "#4FC3F7",
  main: "#0288D1", // Construction info blue
  dark: "#0277BD",
  darker: "#01579B",
  contrastText: "#fff",
  // Construction variations
  blueprint: "#2196F3",
  technical: alpha("#0288D1", 0.16),
};

// Construction Industry Specific Colors
const CONSTRUCTION = {
  // High-visibility colors
  safetyYellow: "#FFEB3B",
  safetyOrange: "#FF5722",
  safetyGreen: "#4CAF50",

  // Material colors
  concrete: "#9E9E9E",
  steel: "#607D8B",
  dirt: "#8D6E63",

  // Equipment colors
  machinery: "#FF9800",
  tools: "#795548",

  // Alpha variations for backgrounds
  safetyYellowBg: alpha("#FFEB3B", 0.08),
  safetyOrangeBg: alpha("#FF5722", 0.08),
  concreteBg: alpha("#9E9E9E", 0.08),
  steelBg: alpha("#607D8B", 0.08),
};

// Enhanced Gradients for Construction Theme
const GRADIENTS = {
  primary: createGradient(PRIMARY.light, PRIMARY.main),
  info: createGradient(INFO.light, INFO.main),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main),

  // Construction-specific gradients
  steel: createGradient(STEEL[400], STEEL[600]),
  safety: createGradient(WARNING.safety, WARNING.main),
  blueprint: createGradient(INFO.blueprint, PRIMARY.main),
  concrete: createGradient("#ECEFF1", "#B0BEC5"),

  // Dashboard gradients
  cardPrimary: `linear-gradient(135deg, ${PRIMARY.lighter} 0%, ${alpha(PRIMARY.main, 0.1)} 100%)`,
  cardSecondary: `linear-gradient(135deg, ${STEEL[100]} 0%, ${alpha(STEEL[300], 0.1)} 100%)`,
  headerGradient: `linear-gradient(45deg, ${PRIMARY.main} 30%, ${PRIMARY.dark} 90%)`,
};

// Common color configuration
const COMMON = {
  common: { black: "#000", white: "#fff" },
  primary: { ...PRIMARY },
  secondary: { ...SECONDARY },
  info: { ...INFO },
  success: { ...SUCCESS },
  warning: { ...WARNING },
  error: { ...ERROR },
  grey: GREY,
  steel: STEEL,
  construction: CONSTRUCTION,
  gradients: GRADIENTS,
  divider: alpha(GREY[500], 0.24),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(PRIMARY.main, 0.08), // Use primary for selection
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(PRIMARY.main, 0.24), // Use primary for focus
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

// Enhanced palette with construction industry theming
const palette = {
  // Your existing light palette...
  ...COMMON,
  mode: "light",
  text: {
    primary: GREY[800],
    secondary: GREY[600],
    disabled: GREY[500],
  },
  background: {
    paper: "#fff",
    default: GREY[100],
    neutral: GREY[200],
  },
  action: {
    ...COMMON.action,
    active: GREY[600],
  },
};

// Create a PROPER dark palette
export const getDarkPalette = () => ({
  ...COMMON,
  mode: "dark",
  text: {
    primary: "#FFFFFF",           // White text for dark mode
    secondary: GREY[400],         // Lighter grey for secondary text
    disabled: GREY[600],          // Medium grey for disabled text
  },
  background: {
    paper: GREY[800],            // Dark paper background
    default: GREY[900],          // Very dark default background
    neutral: alpha(GREY[500], 0.16), // Neutral backgrounds
  },
  action: {
    ...COMMON.action,
    active: GREY[400],           // Lighter active state
    hover: alpha(GREY[500], 0.08), // Subtle hover
    selected: alpha(GREY[500], 0.16), // Selection state
    disabled: alpha(GREY[500], 0.48), // Disabled state
    disabledBackground: alpha(GREY[500], 0.24), // Disabled background
  },
  // Override specific colors for dark mode
  divider: alpha(GREY[500], 0.24), // Subtle dividers
});

// Export the light palette as default
export default palette;
