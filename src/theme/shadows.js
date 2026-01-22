// material
import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

const createShadow = (color) => {
  const transparent1 = alpha(color, 0.2);
  const transparent2 = alpha(color, 0.14);
  const transparent3 = alpha(color, 0.12);
  return [
    "none",
    `0px 2px 1px -1px ${transparent1},0px 1px 1px 0px ${transparent2},0px 1px 3px 0px ${transparent3}`,
    `0px 3px 1px -2px ${transparent1},0px 2px 2px 0px ${transparent2},0px 1px 5px 0px ${transparent3}`,
    `0px 3px 3px -2px ${transparent1},0px 3px 4px 0px ${transparent2},0px 1px 8px 0px ${transparent3}`,
    `0px 2px 4px -1px ${transparent1},0px 4px 5px 0px ${transparent2},0px 1px 10px 0px ${transparent3}`,
    `0px 3px 5px -1px ${transparent1},0px 5px 8px 0px ${transparent2},0px 1px 14px 0px ${transparent3}`,
    `0px 3px 5px -1px ${transparent1},0px 6px 10px 0px ${transparent2},0px 1px 18px 0px ${transparent3}`,
    `0px 4px 5px -2px ${transparent1},0px 7px 10px 1px ${transparent2},0px 2px 16px 1px ${transparent3}`,
    `0px 5px 5px -3px ${transparent1},0px 8px 10px 1px ${transparent2},0px 3px 14px 2px ${transparent3}`,
    `0px 5px 6px -3px ${transparent1},0px 9px 12px 1px ${transparent2},0px 3px 16px 2px ${transparent3}`,
    `0px 6px 6px -3px ${transparent1},0px 10px 14px 1px ${transparent2},0px 4px 18px 3px ${transparent3}`,
    `0px 6px 7px -4px ${transparent1},0px 11px 15px 1px ${transparent2},0px 4px 20px 3px ${transparent3}`,
    `0px 7px 8px -4px ${transparent1},0px 12px 17px 2px ${transparent2},0px 5px 22px 4px ${transparent3}`,
    `0px 7px 8px -4px ${transparent1},0px 13px 19px 2px ${transparent2},0px 5px 24px 4px ${transparent3}`,
    `0px 7px 9px -4px ${transparent1},0px 14px 21px 2px ${transparent2},0px 5px 26px 4px ${transparent3}`,
    `0px 8px 9px -5px ${transparent1},0px 15px 22px 2px ${transparent2},0px 6px 28px 5px ${transparent3}`,
    `0px 8px 10px -5px ${transparent1},0px 16px 24px 2px ${transparent2},0px 6px 30px 5px ${transparent3}`,
    `0px 8px 11px -5px ${transparent1},0px 17px 26px 2px ${transparent2},0px 6px 32px 5px ${transparent3}`,
    `0px 9px 11px -5px ${transparent1},0px 18px 28px 2px ${transparent2},0px 7px 34px 6px ${transparent3}`,
    `0px 9px 12px -6px ${transparent1},0px 19px 29px 2px ${transparent2},0px 7px 36px 6px ${transparent3}`,
    `0px 10px 13px -6px ${transparent1},0px 20px 31px 3px ${transparent2},0px 8px 38px 7px ${transparent3}`,
    `0px 10px 13px -6px ${transparent1},0px 21px 33px 3px ${transparent2},0px 8px 40px 7px ${transparent3}`,
    `0px 10px 14px -6px ${transparent1},0px 22px 35px 3px ${transparent2},0px 8px 42px 7px ${transparent3}`,
    `0px 11px 14px -7px ${transparent1},0px 23px 36px 3px ${transparent2},0px 9px 44px 8px ${transparent3}`,
    `0px 11px 15px -7px ${transparent1},0px 24px 38px 3px ${transparent2},0px 9px 46px 8px ${transparent3}`,
  ];
};

// Define colors for light and dark themes
const LIGHT_GREY = "#919EAB";
const DARK_GREY = "#161C24";

// Create shadows for both themes
const shadows = {
  light: createShadow(LIGHT_GREY),
  dark: createShadow(DARK_GREY),
};

// Custom shadows for specific use cases
export const customShadows = {
  light: {
    z1: `0 1px 2px 0 ${alpha(LIGHT_GREY, 0.24)}`,
    z4: `0 4px 8px 0 ${alpha(LIGHT_GREY, 0.24)}`,
    z8: `0 8px 16px 0 ${alpha(LIGHT_GREY, 0.24)}`,
    z12: `0 12px 24px -4px ${alpha(LIGHT_GREY, 0.24)}`,
    z16: `0 16px 32px -4px ${alpha(LIGHT_GREY, 0.24)}`,
    z20: `0 20px 40px -4px ${alpha(LIGHT_GREY, 0.24)}`,
    z24: `0 24px 48px 0 ${alpha(LIGHT_GREY, 0.24)}`,
    // Construction industry specific shadows
    card: `0 2px 8px 0 ${alpha(LIGHT_GREY, 0.08)}`,
    cardHover: `0 8px 24px 0 ${alpha(LIGHT_GREY, 0.12)}`,
    primary: `0 8px 16px 0 ${alpha("#2065D1", 0.24)}`,
    secondary: `0 8px 16px 0 ${alpha("#3366FF", 0.24)}`,
    info: `0 8px 16px 0 ${alpha("#0288D1", 0.24)}`,
    success: `0 8px 16px 0 ${alpha("#2E7D32", 0.24)}`,
    warning: `0 8px 16px 0 ${alpha("#FF9800", 0.24)}`,
    error: `0 8px 16px 0 ${alpha("#D32F2F", 0.24)}`,
  },
  dark: {
    z1: `0 1px 2px 0 ${alpha(DARK_GREY, 0.48)}`,
    z4: `0 4px 8px 0 ${alpha(DARK_GREY, 0.48)}`,
    z8: `0 8px 16px 0 ${alpha(DARK_GREY, 0.48)}`,
    z12: `0 12px 24px -4px ${alpha(DARK_GREY, 0.48)}`,
    z16: `0 16px 32px -4px ${alpha(DARK_GREY, 0.48)}`,
    z20: `0 20px 40px -4px ${alpha(DARK_GREY, 0.48)}`,
    z24: `0 24px 48px 0 ${alpha(DARK_GREY, 0.48)}`,
    // Construction industry specific shadows
    card: `0 2px 8px 0 ${alpha("#000000", 0.24)}`,
    cardHover: `0 8px 24px 0 ${alpha("#000000", 0.32)}`,
    primary: `0 8px 16px 0 ${alpha("#2065D1", 0.48)}`,
    secondary: `0 8px 16px 0 ${alpha("#3366FF", 0.48)}`,
    info: `0 8px 16px 0 ${alpha("#0288D1", 0.48)}`,
    success: `0 8px 16px 0 ${alpha("#2E7D32", 0.48)}`,
    warning: `0 8px 16px 0 ${alpha("#FF9800", 0.48)}`,
    error: `0 8px 16px 0 ${alpha("#D32F2F", 0.48)}`,
  },
};

export default shadows;
