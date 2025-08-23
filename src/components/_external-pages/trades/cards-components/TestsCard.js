import * as React from "react";
import { memo, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {
  Grid,
  Box,
  Chip,
  Stack,
  useTheme,
  Divider,
  Collapse,
  Button,
  Link,
  alpha
  // IconButton,
  // Tooltip
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApplicationInfo from "../../forms/ApplicationInfo";
import ApplicationForm from "../../forms/ApplicationForm";

// Helper component for displaying test information items
const TestInfoItem = ({ icon: Icon, label, value }) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{ py: 0.5 }}
  >
    <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />
    <Typography variant="body2">
      <Box component="span" sx={{ color: 'text.secondary' }}>{label}: </Box>
      <Box component="span" sx={{ fontWeight: 500 }}>{value}</Box>
    </Typography>
  </Stack>
);

// Define CITB specific information for compliance
const CITB_INFO = {
  standardFee: 22.50, // Standard CITB test fee (update with actual value)
  website: "https://www.citb.co.uk/",
  name: "Construction Industry Training Board",
  shortName: "CITB"
};

const TestsCard = memo((props) => {
  const theme = useTheme();
  const [showPricing, setShowPricing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [userCollapsed, setUserCollapsed] = useState(false);

  // Calculate certification level color
  const getLevelColor = (level) => {
    const colors = {
      basic: theme.palette.info.main,
      intermediate: theme.palette.warning.main,
      advanced: theme.palette.error.main,
      professional: theme.palette.success.main,
      default: theme.palette.primary.main
    };
    return colors[level?.toLowerCase()] || colors.default;
  };

  // Determine if this is a CITB test based on available data
  const isCITBTest =
    // If we have explicit provider info, use it
    props.testProvider?.toLowerCase() === 'citb' ||
    // Otherwise, use our enhanced detection logic for categories
    (props.category?.toLowerCase() === 'operative' ||
      props.category?.toLowerCase() === 'managers-and-professional' ||
      props.category?.toLowerCase() === 'specialist') ||
    // Or detect from title keywords
    props.title?.toLowerCase().includes('citb') ||
    props.title?.toLowerCase().includes('health and safety') ||
    props.title?.toLowerCase().includes('hse');

  // If this is a CITB test but missing provider info, enhance the props object
  const enhancedProps = {
    ...props,
    testProvider: isCITBTest ? props.testProvider || 'CITB' : props.testProvider
  };

  // Calculate fee breakdown based on total price
  const price = props.price || 0;
  const standardFee = isCITBTest ? CITB_INFO.standardFee : null;
  const serviceFee = standardFee ? (price - standardFee) : price;

  // Modify the price chip click handler
  const handlePricingToggle = () => {
    setShowPricing(!showPricing);
    // Only try to set userCollapsed if it's a function
    if (setUserCollapsed && typeof setUserCollapsed === 'function') {
      setUserCollapsed(true);
    }
  };

  return (
    <Grid item xs={12} lg={6}>
      <Card
        sx={{
          minHeight: 200,
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.neutral})`,
          borderRadius: 2,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.info.lighter})`
          }
        }}
      >
        {/* CITB Badge - Only shown for CITB tests */}
        {isCITBTest && (
          <Chip
            label="CITB Test"
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
              fontWeight: 600,
              fontSize: '0.7rem',
              borderRadius: '4px',
            }}
          />
        )}

        <CardContent>
          {/* Header Section */}
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              p: 2,
              mx: -2,
              mt: -2,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              background: (theme) => theme.palette.background.neutral
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  lineHeight: 1.2,
                  fontWeight: 600,
                  mb: 0.5,
                  pr: isCITBTest ? 6 : 0 // Add padding if CITB badge is present
                }}
              >
                {props.title}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {props.isOnline && (
                  <Chip
                    icon={<LanguageIcon />}
                    label="Online Test"
                    size="small"
                    sx={{ bgcolor: theme.palette.success.lighter, mb: 0.5 }}
                  />
                )}
                {props.certificationLevel && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label={props.certificationLevel}
                    size="small"
                    sx={{
                      bgcolor: getLevelColor(props.certificationLevel),
                      color: 'white',
                      mb: 0.5
                    }}
                  />
                )}
                {/* Price chip - clickable to show breakdown */}
                {price > 0 && (
                  <Chip
                    icon={<AttachMoneyIcon />}
                    label={isCITBTest ?
                      (showPricing ? "Hide details" : "View breakdown") :
                      `£${price.toFixed(2)}`
                    }
                    size="small"
                    onClick={handlePricingToggle}
                    sx={{
                      bgcolor: showPricing
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.dark,
                      fontWeight: 600,
                      cursor: 'pointer',
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>

          {isCITBTest && price > 0 && (
            <Box
              sx={{
                mt: 1.5,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 1,
                backgroundColor: alpha(theme.palette.info.light, 0.08),
                borderRadius: '4px'
              }}
            >
              <InfoOutlinedIcon fontSize="small" sx={{ color: 'info.main', fontSize: '0.875rem' }} />
              <Typography variant="caption" color="text.secondary">
                This CITB test includes a standard fee of £{CITB_INFO.standardFee.toFixed(2)} + booking service.
                <Button
                  size="small"
                  onClick={handlePricingToggle}
                  sx={{ ml: 1, p: 0, minWidth: 'auto', textTransform: 'none', fontSize: 'inherit' }}
                >
                  {showPricing ? "Hide breakdown" : "View breakdown"}
                </Button>
              </Typography>
            </Box>
          )}

          {/* Price breakdown collapsible section */}
          <Collapse in={showPricing} timeout={300}>
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                animation: showPricing ? 'pulse 1s' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(0, 114, 178, 0.2)' },
                  '70%': { boxShadow: '0 0 0 6px rgba(0, 114, 178, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(0, 114, 178, 0)' }
                }
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Price Breakdown
              </Typography>
              <Grid container spacing={1} alignItems="center">
                {isCITBTest && standardFee && (
                  <>
                    <Grid item xs={7}>
                      <Typography variant="caption" color="text.secondary">
                        Standard CITB test fee:
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="caption" align="right" display="block">
                        £{standardFee.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="caption" color="text.secondary">
                        Booking & admin fee:
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="caption" align="right" display="block">
                        £{serviceFee.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.primary">
                    Total:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle1"
                    color="primary.main"
                    align="right"
                    fontWeight="600"
                  >
                    £{price.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* Test Details Section */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
              Test Information
            </Typography>
            <Stack spacing={1}>
              <TestInfoItem
                icon={AccessTimeIcon}
                label="Duration"
                value={props.duration || "45 minutes"}
              />
              <TestInfoItem
                icon={QuizIcon}
                label="Total Questions"
                value={props.numberOfQuestions || "50 questions"}
              />
              {props.location && (
                <TestInfoItem
                  icon={LocationOnIcon}
                  label="Test Center"
                  value={props.location}
                />
              )}
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Requirements & Validity */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.neutral' : 'primary.lighter'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
              Requirements & Validity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Valid for {props.validity || "2 years"}
            </Typography>
            {props.prerequisites && (
              <Typography variant="body2" color="text.secondary">
                • Prerequisites: {props.prerequisites}
              </Typography>
            )}
          </Box>

          {/* Expandable details section with CITB disclosure */}
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              endIcon={showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              {showDetails ? 'Less details' : 'More details'}
            </Button>

            <Collapse in={showDetails}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.7),
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  About {props.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {props.longDescription || `The ${props.title} is designed to test your knowledge of health and safety in the construction industry. This test is required for obtaining various construction industry cards and certifications.`}
                </Typography>

                {/* CITB Third-Party Disclosure */}
                {isCITBTest && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.info.light, 0.1),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <InfoOutlinedIcon color="info" fontSize="small" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        NEXC is a third-party booking agent for CITB tests. Tests are provided by the Construction Industry Training Board (CITB). Our service includes test booking, administration, and support.
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<OpenInNewIcon fontSize="small" />}
                        component={Link}
                        href={CITB_INFO.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          fontSize: '0.75rem'
                        }}
                      >
                        Official CITB Website
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Value proposition - highlighting service benefits */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Our Booking Service Includes:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <Typography variant="caption" component="li">
                      Fast-track test slot booking
                    </Typography>
                    <Typography variant="caption" component="li">
                      Application assistance and verification
                    </Typography>
                    <Typography variant="caption" component="li">
                      Pre-test guidance and support
                    </Typography>
                    <Typography variant="caption" component="li">
                      Results management and certificate assistance
                    </Typography>
                  </ul>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Actions Section */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ApplicationInfo {...enhancedProps} type="tests" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ApplicationForm {...enhancedProps} type="tests" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
});

TestsCard.displayName = 'TestsCard';

export default TestsCard;
