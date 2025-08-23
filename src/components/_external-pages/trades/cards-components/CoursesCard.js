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
  IconButton,
  Collapse,
  Divider,
  useTheme,
  Button,
  Link,
  alpha
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApplicationInfo from "../../forms/ApplicationInfo";
import ApplicationForm from "../../forms/ApplicationForm";

// CITB information constant - add this
const CITB_INFO = {
  website: "https://www.citb.co.uk/courses-and-qualifications/",
  name: "Construction Industry Training Board",
  shortName: "CITB"
};

// Other helper components remain the same...
const CourseInfoItem = ({ icon: Icon, label, value }) => (
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

const ModuleItem = ({ title, duration, description }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: 'background.neutral',
    }}
  >
    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    {duration && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        Duration: {duration}
      </Typography>
    )}
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
  </Box>
);

const CoursesCard = memo((props) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Determine if this is a CITB course based on available data
  const isCITBCourse =
    // If we have explicit provider info, use it
    props.courseProvider?.toLowerCase() === 'citb' ||
    // Or detect from category
    props.category?.toLowerCase() === 'citb' ||
    // Or detect from title keywords
    props.title?.toLowerCase().includes('citb') ||
    props.title?.toLowerCase().includes('construction industry training');

  // Calculate fee breakdown based on total price
  const price = props.price || 0;
  const standardFee = null; // CITB courses don't have a standard fee structure like tests
  const modules = props.modules || [];

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
            background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.success.lighter})`
          }
        }}
      >
        {/* CITB Badge - Only shown for CITB courses */}
        {isCITBCourse && (
          <Chip
            label="CITB Course"
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
                  pr: isCITBCourse ? 6 : 0
                }}
              >
                {props.title}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {props.isOnline && (
                  <Chip
                    icon={<LanguageIcon />}
                    label="Online Course"
                    size="small"
                    sx={{ bgcolor: theme.palette.success.lighter, mb: 0.5 }}
                  />
                )}
                {!props.isOnline && (
                  <Chip
                    icon={<LocationOnIcon />}
                    label="Classroom Course"
                    size="small"
                    sx={{ bgcolor: theme.palette.info.lighter, mb: 0.5 }}
                  />
                )}
                {props.certification && (
                  <Chip
                    icon={<WorkspacePremiumIcon />}
                    label="Certification Included"
                    size="small"
                    sx={{ bgcolor: theme.palette.warning.lighter, mb: 0.5 }}
                  />
                )}
                {/* Add price chip */}
                {price > 0 && (
                  <Chip
                    icon={<AttachMoneyIcon />}
                    label={`£${price.toFixed(2)}`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.dark,
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>

          {/* CITB Information Banner */}
          {isCITBCourse && (
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
                This is an official CITB course delivered by approved training providers.
              </Typography>
            </Box>
          )}

          {/* Course Details Section */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
              Course Information
            </Typography>
            <Stack spacing={1}>
              <CourseInfoItem
                icon={AccessTimeIcon}
                label="Duration"
                value={props.duration}
              />
              <CourseInfoItem
                icon={MenuBookIcon}
                label="Modules"
                value={modules.length}
              />
              {props.instructor && (
                <CourseInfoItem
                  icon={SchoolIcon}
                  label="Instructor"
                  value={props.instructor}
                />
              )}
              {props.location && !props.isOnline && (
                <CourseInfoItem
                  icon={LocationOnIcon}
                  label="Location"
                  value={props.location}
                />
              )}
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Requirements & Benefits */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.neutral' : 'success.lighter'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
              Course Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Valid for {props.validity}
            </Typography>
            {props.prerequisites && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Prerequisites: {props.prerequisites}
              </Typography>
            )}
            {props.benefits && (
              <Typography variant="body2" color="text.secondary">
                • Benefits: {props.benefits}
              </Typography>
            )}
          </Box>

          {/* Expandable details section - NEW */}
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
                  {props.longDescription || props.description || `The ${props.title} course is designed to provide comprehensive training in its subject area. This course may be required or recommended for certain industry roles or certifications.`}
                </Typography>

                {/* CITB Third-Party Disclosure */}
                {isCITBCourse && (
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
                        NEXC provides booking services for CITB courses. All CITB courses are delivered by the Construction Industry Training Board (CITB) or their approved training providers.
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
                      Fast-track course registration
                    </Typography>
                    <Typography variant="caption" component="li">
                      Course selection guidance
                    </Typography>
                    <Typography variant="caption" component="li">
                      Pre-course materials and support
                    </Typography>
                    <Typography variant="caption" component="li">
                      Certificate administration assistance
                    </Typography>
                  </ul>
                </Box>
              </Box>
            </Collapse>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              onClick={() => setShowPricing(!showPricing)}
              endIcon={showPricing ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              {showPricing ? 'Hide pricing details' : 'Show pricing details'}
            </Button>

            <Collapse in={showPricing}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.7),
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Pricing Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Course Fee
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    £{price.toFixed(2)}
                  </Typography>
                </Box>
                {/* Use standardFee here if needed */}
                {standardFee && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Standard Fee
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      £{standardFee.toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography variant="subtitle2" color="primary.main">
                    £{price.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Module List */}
          {modules.length > 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  '&:hover': {
                    bgcolor: 'background.default'
                  }
                }}
                onClick={handleExpandClick}
              >
                <Typography variant="subtitle2">
                  Course Curriculum
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              <Collapse in={expanded}>
                <Stack
                  spacing={1}
                  sx={{
                    mt: 1,
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  {modules.map((module, index) => (
                    <ModuleItem key={index} {...module} />
                  ))}
                </Stack>
              </Collapse>
            </>
          )}

          {/* Actions Section */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ApplicationInfo {...props} type="courses" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ApplicationForm {...props} type="courses" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
});

CoursesCard.displayName = 'CoursesCard';

export default CoursesCard;
