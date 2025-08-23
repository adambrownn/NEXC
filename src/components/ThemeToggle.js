import React from 'react';
import { IconButton, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = useMuiTheme();

  return (
    <IconButton 
      onClick={toggleTheme} 
      color="inherit"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[8],
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
      }}
    >
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}
