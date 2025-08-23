import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
// material
import {
  alpha,
  useTheme,
  experimentalStyled as styled,
} from "@mui/material/styles";
import {
  Box,
  Grid,
  Button,
  Container,
  Typography,
  Stack,
  IconButton,
  Divider,
  Card,
  Grow,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton as MuiIconButton,
} from "@mui/material";
// routes
import { CATEGORY_PATH } from "../../../routes/paths";
//
import { motion } from "framer-motion";
import { MotionInView, varFadeInUp } from "../../animate";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import CSLIntro from "../../../assets/logos/csl-intro.gif";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  padding: theme.spacing(15, 0),
  position: "relative",
  backgroundImage:
    theme.palette.mode === "light"
      ? `linear-gradient(180deg, ${alpha(theme.palette.grey[300], 0)} 0%, ${theme.palette.grey[300]} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.grey[900], 0)} 0%, ${theme.palette.background.default} 100%)`,
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: `url(/static/illustrations/dot-pattern.svg) repeat`,
    opacity: 0.05,
    zIndex: 1,
    pointerEvents: "none"
  }
}));

const ContentStyle = styled("div")(({ theme }) => ({
  width: "100%",
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.up("md")]: {
    marginBottom: 0,
  },
}));

const HeaderBadge = styled("div")(({ theme }) => ({
  display: "inline-block",
  padding: theme.spacing(0.75, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadiusSm,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.darker,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontSize: "0.75rem",
}));

const ProcessTimeline = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(6),
  [theme.breakpoints.up("md")]: {
    marginTop: theme.spacing(8),
  },
}));

const TimelineTrack = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 32,
  left: 16,
  right: 16,
  height: 4,
  backgroundColor: alpha(theme.palette.grey[500], 0.2),
  [theme.breakpoints.down("md")]: {
    display: "none"
  }
}));

const TimelineProgress = styled("div")(({ theme, progress }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${progress}%`,
  backgroundColor: theme.palette.primary.main,
  transition: "width 0.5s ease-in-out",
  [theme.breakpoints.down("md")]: {
    display: "none"
  }
}));

const StepButton = styled(IconButton)(({ theme, active }) => ({
  width: 64,
  height: 64,
  borderRadius: "50%",
  backgroundColor: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
  color: active ? theme.palette.primary.contrastText : theme.palette.primary.main,
  border: `2px solid ${active ? theme.palette.primary.main : 'transparent'}`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.main, 0.2),
    transform: "translateY(-4px)"
  },
  position: "relative",
  zIndex: 3,
}));

const StepCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadiusLg,
  boxShadow: `0 10px 40px 0 ${alpha(theme.palette.grey[500], 0.12)}`,
  transition: "all 0.4s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
}));

const StepPill = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0.5, 2),
  borderRadius: 50,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 700,
  marginBottom: theme.spacing(2),
}));

const ServiceIconContainer = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: alpha(color, 0.1),
  color: color,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    width: 120,
    height: 120
  }
}));

const IllustrationWrapper = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default function LandingHugePackElements() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const STEPS = [
    {
      title: "Tell us what you need",
      subtitle: "Fast & Easy Contact",
      description: "Fill out our quick contact form with your name, phone number, and email to get started. Our team responds within 1 hour during business hours.",
      icon: <TouchAppIcon sx={{ fontSize: { xs: 40, md: 64 } }} />,
      benefits: [
        "No account needed to start",
        "Just 30 seconds to complete",
        "Instant SMS confirmation"
      ],
      color: theme.palette.info.main
    },
    {
      title: "Select your service",
      subtitle: "Personalized Options",
      description: "Choose from our range of CSCS cards, CITB tests, or NVQ qualifications based on your trade and experience level.",
      icon: <AssignmentIcon sx={{ fontSize: { xs: 40, md: 64 } }} />,
      benefits: [
        "Service comparison view",
        "Trade-specific recommendations",
        "Clear pricing information"
      ],
      color: theme.palette.warning.main
    },
    {
      title: "Book and confirm",
      subtitle: "Secure Checkout",
      description: "Select your preferred date and time, provide your details, and complete your booking with multiple payment options.",
      icon: <EventAvailableIcon sx={{ fontSize: { xs: 40, md: 64 } }} />,
      benefits: [
        "Same-day appointments available",
        "Secure payment processing",
        "Instant digital confirmation"
      ],
      color: theme.palette.success.main
    }
  ];

  const handleChangeStep = (index) => {
    setActiveStep(index);
  };

  // Calculate timeline progress based on active step
  const progressPercentage = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <RootStyle>
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        {/* Section Header - Full Width with centered video button */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <HeaderBadge>UK Construction Service Booking</HeaderBadge>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Three Simple Steps to Get Your Construction Certification
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4, // Adjusted margin for button placement
              color: isLight ? "text.secondary" : "text.primary",
              fontSize: "1.125rem",
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            We've streamlined the entire process to help you obtain your CSCS card,
            book your CITB test, or achieve your NVQ qualification with minimal effort.
          </Typography>

          {/* Video Demo Button - RELOCATED HERE */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleOpenDialog}
              endIcon={<PlayCircleOutlineIcon />}
              sx={{
                backgroundColor: alpha(theme.palette.grey[900], 0.9),
                color: "#fff",
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                "&:hover": {
                  backgroundColor: theme.palette.grey[900],
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s'
              }}
            >
              Watch How It Works
            </Button>
          </Box>
        </Box>

        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <ContentStyle>
              {/* REMOVED VIDEO BUTTON FROM HERE */}

              {/* Interactive Steps Selection */}
              <ProcessTimeline>
                <Box sx={{ mb: 5, position: 'relative' }}>
                  <TimelineTrack>
                    <TimelineProgress progress={progressPercentage} />
                  </TimelineTrack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 4, md: 0 }}
                    justifyContent="space-between"
                  >
                    {STEPS.map((step, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "row", md: "column" },
                          alignItems: { xs: "center", md: "center" },
                          textAlign: { xs: "left", md: "center" },
                          mb: { xs: 2, md: 0 }
                        }}
                      >
                        <StepButton
                          active={activeStep >= index ? 1 : 0}
                          onClick={() => handleChangeStep(index)}
                        >
                          {activeStep >= index ? (
                            <CheckCircleIcon fontSize="large" />
                          ) : (
                            index + 1
                          )}
                        </StepButton>
                        <Typography
                          sx={{
                            mt: { xs: 0, md: 2 },
                            ml: { xs: 2, md: 0 },
                            fontWeight: activeStep === index ? 700 : 500,
                            color: activeStep === index ? 'text.primary' : 'text.secondary',
                            fontSize: { xs: '0.9rem', md: '1rem' }
                          }}
                        >
                          {step.title}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </ProcessTimeline>

              {/* Step Detail Card */}
              <Grow in={true} timeout={900}>
                <StepCard elevation={4}>
                  <Box>
                    <StepPill>Step {activeStep + 1}</StepPill>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: STEPS[activeStep].color }}>
                      {STEPS[activeStep].title}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                      {STEPS[activeStep].subtitle}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
                      {STEPS[activeStep].description}
                    </Typography>

                    <Box sx={{ mt: 3, mb: 4 }}>
                      {STEPS[activeStep].benefits.map((benefit, i) => (
                        <Stack key={i} direction="row" spacing={1.5} sx={{ mb: 1 }} alignItems="center">
                          <Box
                            component={CheckCircleIcon}
                            sx={{
                              fontSize: 18,
                              color: STEPS[activeStep].color,
                              flexShrink: 0
                            }}
                          />
                          <Typography variant="body2">{benefit}</Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, alignSelf: 'flex-start' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleChangeStep(Math.min(activeStep + 1, STEPS.length - 1))}
                      endIcon={<ArrowForwardIcon />}
                      disabled={activeStep === STEPS.length - 1}
                    >
                      Next Step
                    </Button>
                    {activeStep === STEPS.length - 1 && (
                      <Button
                        variant="contained"
                        component={RouterLink}
                        to={CATEGORY_PATH.root}
                        sx={{ ml: 2 }}
                      >
                        Start Booking
                      </Button>
                    )}
                  </Box>
                </StepCard>
              </Grow>
            </ContentStyle>
          </Grid>

          {/* Right Column - Visual */}
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <IllustrationWrapper>
              <MotionInView variants={varFadeInUp}>
                {/* Service Icon */}
                <ServiceIconContainer color={STEPS[activeStep].color}>
                  {STEPS[activeStep].icon}
                </ServiceIconContainer>

                {/* Service Explanation */}
                <Box
                  component={motion.div}
                  animate={{
                    scale: [0.9, 1],
                    opacity: [0.8, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  sx={{
                    textAlign: 'center',
                    mt: 4,
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 10px 40px ${alpha(STEPS[activeStep].color, 0.15)}`,
                    border: `1px solid ${alpha(STEPS[activeStep].color, 0.2)}`,
                    maxWidth: 450,
                    width: '100%',
                    mx: 'auto'
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ color: STEPS[activeStep].color, fontWeight: 700 }}>
                    {activeStep === 0 ? 'Quick Contact Form' : activeStep === 1 ? 'Choose Your Service' : 'Secure Booking'}
                  </Typography>

                  <Typography sx={{ mb: 3, color: 'text.secondary' }}>
                    {activeStep === 0 ?
                      'Our streamlined contact form takes just 30 seconds to complete. No account creation required.' :
                      activeStep === 1 ?
                        'Browse our comprehensive range of construction certifications and select the one that matches your requirements.' :
                        'Book your preferred date and time with our secure checkout process. Instant confirmation provided.'
                    }
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: alpha(STEPS[activeStep].color, 0.1),
                      color: STEPS[activeStep].color,
                      fontWeight: 600
                    }}
                  >
                    {activeStep === 0 ? '30-second completion' : activeStep === 1 ? 'All UK trades covered' : 'Same-day availability'}
                  </Box>
                </Box>
              </MotionInView>
            </IllustrationWrapper>
          </Grid>
        </Grid>

        {/* Bottom Call-to-Action */}
        <Box sx={{ mt: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to get started?
          </Typography>
          <Button
            size="large"
            variant="contained"
            component={RouterLink}
            to={CATEGORY_PATH.root}
            endIcon={<ArrowRightAltIcon />}
            sx={{
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              px: 4,
              py: 1.5,
              mt: 2
            }}
          >
            Book Your Service Now
          </Button>
        </Box>
      </Container>

      {/* Video/GIF Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">How Our Booking Process Works</Typography>
            <MuiIconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </MuiIconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <img
              src={CSLIntro}
              alt="UK Construction Services Booking Process"
              style={{
                width: '100%',
                maxWidth: '700px',
                borderRadius: 8,
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </RootStyle>
  );
}
