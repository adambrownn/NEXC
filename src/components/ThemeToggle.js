import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import sunFill from '@iconify/icons-eva/sun-fill';
import moonFill from '@iconify/icons-eva/moon-fill';
import useSettings from '../hooks/useSettings'; // Use your existing hook

// ----------------------------------------------------------------------

export default function ThemeToggle() {
  const theme = useTheme();
  const { themeMode, onToggleMode } = useSettings(); // Use your existing settings

  const isDarkMode = themeMode === 'dark';

  return (
    <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton
        onClick={onToggleMode} // Use your existing toggle function
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: alpha(theme.palette.primary.main, 0.24),
            transform: 'scale(1.05)',
          },
        }}
      >
        <Icon
          icon={isDarkMode ? sunFill : moonFill}
          width={20}
          height={20}
          style={{
            color: isDarkMode ? theme.palette.warning.main : theme.palette.primary.main,
            transition: 'color 0.3s ease',
          }}
        />
      </IconButton>
    </Tooltip>
  );
}
