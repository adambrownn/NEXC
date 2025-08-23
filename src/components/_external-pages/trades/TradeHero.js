import React, { useContext, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  experimentalStyled as styled,
  alpha,
  useTheme,
} from "@mui/material/styles";
import {
  Autocomplete,
  Box,
  Container,
  TextField,
  Typography,
  Skeleton,
  Paper,
  Tabs,
  Tab,
  Alert,
  Chip,
  Divider,
  Button,
  useMediaQuery,
  Grid,
} from "@mui/material";
import axiosInstance from "../../../axiosConfig";
// icons
import WorkIcon from '@mui/icons-material/Work';
import BuildIcon from '@mui/icons-material/Build';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

const RootStyle = styled("div")(({ theme }) => ({
  padding: theme.spacing(6, 0),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['box-shadow', 'background-color']),
    '&.Mui-focused': {
      boxShadow: theme.customShadows?.z8 || '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
      backgroundColor: theme.palette.background.paper,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.8),
    },
    borderRadius: theme.shape.borderRadiusMd || '8px',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const EnhancedStatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'all 0.2s ease',
}));

const StatCounter = styled(Typography)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.9),
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.25, 1),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
}));

const StyledTabPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: theme.shape.borderRadiusMd || '8px',
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
  transition: theme.transitions.create(['box-shadow']),
  '&:hover': {
    boxShadow: theme.shadows[2],
  }
}));

const InstructionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.info.main, 0.08),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

export default function TradeHero(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setTradeId } = useContext(props.tradeContext);

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCards: 0,
    totalCourses: 0,
    totalTests: 0,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Fetch trades with error handling
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axiosInstance.get("/trades");
      console.log('Trades API response:', resp.data);

      const tradesArray = resp.data?.data || [];
      if (!Array.isArray(tradesArray)) {
        throw new Error('Invalid data format received from server');
      }

      if (tradesArray.length === 0) {
        setError({ type: 'empty', message: 'No trades found. Please try again later.' });
      }

      setTrades(tradesArray);

      // After first successful load, mark as not first visit
      setIsFirstVisit(false);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setError({
        type: 'error',
        message: 'Unable to load trades. Please try again later.',
        details: error.message
      });
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate stats with improved error handling
  const fetchStats = useCallback(async (tradeId) => {
    try {
      if (!tradeId) {
        const servicesResp = await axiosInstance.get('/trades/services');
        if (!servicesResp.data.success) {
          throw new Error(servicesResp.data.error || 'Failed to fetch services');
        }

        const { data } = servicesResp.data;
        if (!data) {
          throw new Error('No data received from server');
        }

        const {
          cards = [],
          courses = [],
          tests = []
        } = data;

        setStats({
          totalCards: cards.length,
          totalCourses: courses.length,
          totalTests: tests.length
        });
      } else {
        const servicesResp = await axiosInstance.get(`/trades/services/${tradeId}`);
        if (!servicesResp.data.success) {
          throw new Error(servicesResp.data.error || 'Failed to fetch services');
        }

        const { data } = servicesResp.data;
        if (!data) {
          throw new Error('No data received from server');
        }

        const {
          cards = [],
          courses = [],
          tests = [],
          associatedServiceIds = []
        } = data;

        setStats({
          totalCards: cards.filter(card => associatedServiceIds.includes(card._id)).length,
          totalCourses: courses.filter(course => associatedServiceIds.includes(course._id)).length,
          totalTests: tests.filter(test => associatedServiceIds.includes(test._id)).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't set error state as this is a secondary data fetch
      setStats({
        totalCards: 0,
        totalCourses: 0,
        totalTests: 0
      });
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Update stats when selected trade changes
  useEffect(() => {
    if (selectedTrade?._id) {
      fetchStats(selectedTrade._id);
    } else if (trades.length > 0) {
      // Show all stats when no specific trade is selected
      fetchStats(null);
    }
  }, [selectedTrade, fetchStats, trades.length]);

  // Sync with tradeId from props
  useEffect(() => {
    if (props.tradeId && trades.length) {
      const trade = trades.find((t) => t._id === props.tradeId);
      if (trade) {
        setSelectedTrade({
          _id: trade._id,
          title: trade.title,
        });
      }
    }
  }, [props.tradeId, trades]);

  // Sync with selectedTrade from props
  useEffect(() => {
    if (props.selectedTrade) {
      setSelectedTrade(props.selectedTrade);
    }
  }, [props.selectedTrade]);

  // Handle trade selection
  const handleSelectTrade = (e, values) => {
    setSelectedTrade(values);
    setTradeId(values?._id || "");
  };

  // Handle tab change with smooth scrolling
  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);

    // Update URL hash based on selected tab
    const hashes = ['#csl-cards', '#csl-courses', '#csl-tests'];
    const hash = hashes[newValue];

    // Update URL without page reload
    window.history.pushState(null, '', hash);

    // Smooth scroll to section
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync activeTab with URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    switch (hash) {
      case '#csl-courses':
        setActiveTab(1);
        break;
      case '#csl-tests':
        setActiveTab(2);
        break;
      case '#csl-cards':
      default:
        setActiveTab(0);
        break;
    }
  }, []);

  return (
    <RootStyle>
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ textAlign: 'center', mb: 5 }}
        >
          <Typography
            component={motion.h1}
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'text.primary',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Construction Trade Resources
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'text.secondary',
              maxWidth: 650,
              mx: 'auto',
              mb: 3,
            }}
          >
            Find all the cards, courses, and tests you need for your construction trade certification
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<BuildIcon />}
              label="CSCS Cards"
              variant="outlined"
              onClick={() => handleTabChange(null, 0)}
              color={activeTab === 0 ? "primary" : "default"}
            />
            <Chip
              icon={<MenuBookIcon />}
              label="Training Courses"
              variant="outlined"
              onClick={() => handleTabChange(null, 1)}
              color={activeTab === 1 ? "primary" : "default"}
            />
            <Chip
              icon={<AssignmentIcon />}
              label="CITB Tests"
              variant="outlined"
              onClick={() => handleTabChange(null, 2)}
              color={activeTab === 2 ? "primary" : "default"}
            />
          </Box>
        </Box>

        {/* Instruction Card - only shown on first visit */}
        {isFirstVisit && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <InstructionCard>
              <InfoOutlinedIcon color="info" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" color="info.dark" gutterBottom>
                  Find Services for Your Trade
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search for your specific trade to see only the relevant cards, courses, and tests available. For example, search for "Bricklayer" to see all bricklaying certifications.
                </Typography>
              </Box>
            </InstructionCard>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            sx={{ mb: 3 }}
          >
            <Alert
              severity={error.type === 'empty' ? "info" : "error"}
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={fetchTrades}
                >
                  Retry
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {error.message}
            </Alert>
          </Box>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                mb: 3
              }}
            >
              {/* Enhanced Trade Search */}
              <Box sx={{ width: '100%', position: 'relative' }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    position: 'absolute',
                    top: -28,
                    left: 0,
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.85rem'
                  }}
                >
                  <SearchIcon fontSize="small" />
                  Select your trade to filter services
                </Typography>

                {loading ? (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={56}
                    sx={{ borderRadius: 1 }}
                  />
                ) : (
                  <StyledAutocomplete
                    size="large"
                    options={trades}
                    value={selectedTrade}
                    getOptionLabel={(trade) => trade?.title || ''}
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    onChange={handleSelectTrade}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box
                          key={key}
                          {...otherProps}
                          component="li"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 1.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            }
                          }}
                        >
                          <BuildIcon
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: 24
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2">
                              {option.title}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search for your trade..."
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                              <WorkIcon
                                sx={{
                                  color: alpha(theme.palette.primary.main, 0.7),
                                  mr: 0.5
                                }}
                              />
                              {params.InputProps.startAdornment}
                            </Box>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              </Box>

              {/* Enhanced Service Stats Panel */}
              {selectedTrade && (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  sx={{ width: '100%' }}
                >
                  <StyledTabPanel>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Available Resources for {selectedTrade.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Select a category to view available services
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      variant={isMobile ? "scrollable" : "fullWidth"}
                      scrollButtons={isMobile ? "auto" : false}
                      allowScrollButtonsMobile
                      sx={{
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3
                        }
                      }}
                    >
                      <Tab
                        icon={
                          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                            <BuildIcon />
                          </motion.div>
                        }
                        label={
                          <EnhancedStatBox>
                            <Typography variant="button">
                              {isMobile ? "Cards" : "CSCS Cards"}
                            </Typography>
                            <StatCounter variant="caption">
                              {stats.totalCards}
                            </StatCounter>
                          </EnhancedStatBox>
                        }
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                          '&.Mui-selected': { fontWeight: 600 }
                        }}
                      />
                      <Tab
                        icon={
                          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                            <MenuBookIcon />
                          </motion.div>
                        }
                        label={
                          <EnhancedStatBox>
                            <Typography variant="button">
                              {isMobile ? "Courses" : "Training Courses"}
                            </Typography>
                            <StatCounter variant="caption">
                              {stats.totalCourses}
                            </StatCounter>
                          </EnhancedStatBox>
                        }
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                          '&.Mui-selected': { fontWeight: 600 }
                        }}
                      />
                      <Tab
                        icon={
                          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                            <AssignmentIcon />
                          </motion.div>
                        }
                        label={
                          <EnhancedStatBox>
                            <Typography variant="button">
                              {isMobile ? "Tests" : "CITB Tests"}
                            </Typography>
                            <StatCounter variant="caption">
                              {stats.totalTests}
                            </StatCounter>
                          </EnhancedStatBox>
                        }
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                          '&.Mui-selected': { fontWeight: 600 }
                        }}
                      />
                    </Tabs>

                    {/* Empty state indicators */}
                    {selectedTrade && activeTab === 0 && stats.totalCards === 0 && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                          No cards available for this trade
                        </Typography>
                      </Box>
                    )}

                    {selectedTrade && activeTab === 1 && stats.totalCourses === 0 && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                          No courses available for this trade
                        </Typography>
                      </Box>
                    )}

                    {selectedTrade && activeTab === 2 && stats.totalTests === 0 && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                          No tests available for this trade
                        </Typography>
                      </Box>
                    )}
                  </StyledTabPanel>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}
