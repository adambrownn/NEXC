import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  styled,
  InputAdornment
} from "@mui/material";
import BuildIcon from '@mui/icons-material/Build';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import axiosInstance from "../../../axiosConfig";
import CartBucketService from "../../../services/bucket";

// Styled components for enhanced visual appearance
const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create(['box-shadow', 'border-color']),
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiAutocomplete-inputRoot': {
    paddingLeft: '14px !important',
  }
}));

export default function TradeDatalist({ selectedTrade: initialTrade, itemId, onChange }) {
  const theme = useTheme();
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trades with error handling
  useEffect(() => {
    if (initialTrade !== undefined) {
      setSelectedTrade(initialTrade);
    }

    const fetchTrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await axiosInstance.get("/trades");

        if (!resp.data || !Array.isArray(resp.data)) {
          throw new Error("Invalid data received from server");
        }

        setTrades(resp.data || []);
      } catch (err) {
        console.error("Error fetching trades:", err);
        setError(err.message || "Failed to load trades. Please try again.");
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [initialTrade]);

  // Handle trade selection with better state management
  const handleSelectTrade = async (e, values) => {
    setSelectedTrade(values);

    try {
      const items = await CartBucketService.getItemsFromBucket();

      // Find the specific item and update it
      const updatedItems = items.map(item => {
        if (item._id === itemId) {
          // If values exists, add trade info; otherwise remove it
          return values
            ? { ...item, trade: { _id: values._id, title: values.title } }
            : { ...item, trade: undefined };
        }
        return item;
      });

      await CartBucketService.updateItems(updatedItems);

      // Notify parent component if onChange is provided
      if (onChange) {
        onChange(values);
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      // Optionally set an error state here
    }
  };

  return (
    <Box sx={{ position: 'relative', mb: 1 }}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Tooltip title="Retry">
              <Box
                component="span"
                onClick={() => window.location.reload()}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                }}
              >
                <RefreshIcon fontSize="small" />
              </Box>
            </Tooltip>
          }
        >
          {error}
        </Alert>
      )}

      <StyledAutocomplete
        size="small"
        id="trade-selector"
        options={trades}
        value={selectedTrade}
        loading={loading}
        getOptionLabel={(trade) => trade.title || ''}
        isOptionEqualToValue={(option, value) => option._id === value?._id}
        onChange={handleSelectTrade}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 300 }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select your trade"
            variant="outlined"
            placeholder="Search trades..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="primary" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1,
              px: 0.5
            }}
            {...props}
          >
            <BuildIcon
              sx={{
                color: theme.palette.primary.main,
                fontSize: 20
              }}
            />
            <Typography variant="body2">
              {option.title}
            </Typography>
          </Box>
        )}
        noOptionsText={
          <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
            <ErrorOutlineIcon fontSize="small" />
            No trades found
          </Typography>
        }
      />

      {selectedTrade && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<BuildIcon fontSize="small" />}
            label={selectedTrade.title}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={() => handleSelectTrade(null, null)}
            sx={{
              fontWeight: 500,
              borderRadius: 1,
              '& .MuiChip-icon': { color: theme.palette.primary.main }
            }}
          />
        </Box>
      )}
    </Box>
  );
}
