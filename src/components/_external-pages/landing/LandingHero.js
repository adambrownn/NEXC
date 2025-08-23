import React from 'react';
import { motion } from "framer-motion";
// material
import { styled } from "@mui/material/styles";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  alpha
} from "@mui/material";

import { Icon } from "@iconify/react";
import phoneCallFill from "@iconify/icons-eva/phone-call-fill";
import { Link as RouterLink } from "react-router-dom";
import { HashLink as HLink } from "react-router-hash-link";
import SendIcon from "@mui/icons-material/Send";
import { CATEGORY_PATH } from "src/routes/paths";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ConstructionIcon from '@mui/icons-material/Construction';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';

// Update the main container with a more distinctive gradient
const RootStyle = styled('section')(({ theme }) => ({
  position: "relative",
  background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #0D1117 100%)', // Deeper, more professional dark tones
  minHeight: '100vh',
  display: "flex",
  alignItems: "center",
  overflow: 'hidden',
  paddingTop: 'var(--navbar-height, 64px)'
}));

// Completely revamped construction-focused background overlay
const HeroOverlayStyle = styled(motion.div)({
  zIndex: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
  opacity: 0.45,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundImage: 'url("/static/construction-site-dark.jpg")', // Replace with a high-quality construction image
  filter: 'contrast(1.1) saturate(0.9)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 70% 30%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)'
  }
});

// Construction accent elements (tools, equipment shapes)
const ConstructionAccentsStyle = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
  opacity: 0.25,
  backgroundImage: 'url("/static/construction-pattern.jpg")',
  backgroundSize: '500px 500px',
  backgroundRepeat: 'repeat',
  filter: 'brightness(0.8) blur(1px)',
  animation: 'constructionAccents 180s linear infinite',
  '@keyframes constructionAccents': {
    '0%': {
      backgroundPosition: '0 0'
    },
    '100%': {
      backgroundPosition: '600px 600px'
    }
  },
  pointerEvents: 'none'
});

// Dynamic geometry overlays representing construction elements
const GeometryOverlayStyle = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
  opacity: 0.2,
  background: `
    linear-gradient(90deg, transparent 97%, rgba(252, 167, 0, 0.3) 97.5%, transparent 98%),
    linear-gradient(180deg, transparent 97%, rgba(252, 167, 0, 0.3) 97.5%, transparent 98%)
  `,
  backgroundSize: '60px 60px',
  pointerEvents: 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, rgba(252, 167, 0, 0.15) 0%, transparent 70%),
      radial-gradient(circle at 80% 80%, rgba(66, 165, 245, 0.15) 0%, transparent 70%)
    `,
  }
});

// Brand-colored beam effect to create dynamic movement
const BeamEffectStyle = styled(motion.div)({
  position: 'absolute',
  top: '-50%',
  left: '-50%',
  width: '200%',
  height: '200%',
  background: 'linear-gradient(45deg, rgba(252, 167, 0, 0.03) 0%, transparent 50%, rgba(66, 165, 245, 0.03) 100%)',
  opacity: 0.6,
  zIndex: 1,
  transform: 'rotate(30deg)',
  transformOrigin: 'center center',
  pointerEvents: 'none',
});

// Advanced animated particles effect
const EnhancedParticlesStyle = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 3,
  background: `
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, rgba(252, 167, 0, 0.05) 1.5px, transparent 1.5px)
  `,
  backgroundSize: '60px 60px, 60px 60px, 120px 120px',
  animation: 'enhancedParticles 100s linear infinite',
  '@keyframes enhancedParticles': {
    '0%': { backgroundPosition: '0 0, 0 0, 0 0' },
    '100%': { backgroundPosition: '60px 60px, -60px -60px, 120px 120px' }
  },
  pointerEvents: 'none',
});

// Blueprint-style grid with depth effect
const BlueprintGridStyle = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
  backgroundImage: `
    linear-gradient(0deg, rgba(66, 165, 245, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(66, 165, 245, 0.05) 1px, transparent 1px),
    linear-gradient(0deg, rgba(66, 165, 245, 0.02) 0.5px, transparent 0.5px),
    linear-gradient(90deg, rgba(66, 165, 245, 0.02) 0.5px, transparent 0.5px)
  `,
  backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
  opacity: 0.25,
  transform: 'perspective(1000px) rotateX(60deg) scale(1.5) translateY(-40%)',
  transformOrigin: 'center bottom',
  pointerEvents: 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent, #0D1117)',
  }
});

// Feature badge styling
const FeatureBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  borderRadius: 30,
  backgroundColor: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(8px)",
  marginBottom: 12,
  width: "fit-content",
  transition: "all 0.3s ease",
  border: "1px solid rgba(255,255,255,0.2)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.25)",
    transform: "translateY(-2px)"
  }
}));

// Action buttons styling
const ActionButton = styled(Button)(({ theme }) => ({
  whiteSpace: "nowrap",
  borderRadius: 50,
  width: "auto",
  minWidth: "6rem",
  padding: "8px 16px",
  height: "2.75rem",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
}));

// CTA Card styling
const CTACardStyle = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
  }
}));

// Service card styling
const ServiceCard = styled(motion.div)(({ theme, color }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 24,
  padding: theme.spacing(3),
  backgroundColor: alpha(color, 0.15),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(color, 0.3)}`,
  boxShadow: `0 16px 32px rgba(0, 0, 0, 0.2)`,
  height: '100%',
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${alpha(color, 0.15)}`,
    backgroundColor: alpha(color, 0.2),
  }
}));

// Service icon container
const IconContainer = styled('div')(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 64,
  height: 64,
  borderRadius: "50%",
  backgroundColor: alpha(color, 0.2),
  marginBottom: theme.spacing(2),
  "& svg": {
    fontSize: 32,
    color: color,
  }
}));

export default function LandingHero() {
  // Service cards data
  const serviceCards = [
    {
      title: "CSCS Cards",
      description: "Get approved quickly",
      icon: <CardMembershipIcon />,
      color: "#FCA700",
      delay: 0.2
    },
    {
      title: "Construction Safety",
      description: "Work safely on site",
      icon: <ConstructionIcon />,
      color: "#42A5F5",
      delay: 0.3
    },
    {
      title: "CITB Tests",
      description: "Pass your tests easily",
      icon: <AssignmentIcon />,
      color: "#43A047",
      delay: 0.4
    },
    {
      title: "NVQ Qualifications",
      description: "Advance your career",
      icon: <SchoolIcon />,
      color: "#AB47BC",
      delay: 0.5
    }
  ];

  return (
    <RootStyle>
      {/* Enhanced Background Layers */}
      <HeroOverlayStyle
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.8 }}
      />

      <BeamEffectStyle
        animate={{
          opacity: [0.4, 0.6, 0.4],
          rotateZ: [28, 32, 28]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <BlueprintGridStyle
        animate={{
          y: ['-40%', '-38%', '-40%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <ConstructionAccentsStyle />
      <GeometryOverlayStyle />
      <EnhancedParticlesStyle />

      {/* Rest of your component content */}
      <Container sx={{ position: 'relative', zIndex: 10, py: { xs: 8, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={7}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: "common.white",
                    fontSize: { xs: '2.5rem', md: '3.25rem', lg: '3.75rem' },
                    fontWeight: 800,
                    lineHeight: 1.2
                  }}
                >
                  Fast & Reliable CSCS Card Services in the UK
                </Typography>
              </motion.div>

              {/* Subtitle */}
              <Typography
                variant="h6"
                sx={{
                  color: "grey.400",
                  mt: 2,
                  mb: 4,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  maxWidth: { md: '95%' }
                }}
              >
                Get your CSCS Card, book CITB tests, or obtain NVQ qualifications with our
                industry-leading service.
              </Typography>

              {/* Feature Badges */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 4 }}
                sx={{
                  mb: 4,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  alignItems: { xs: 'center', sm: 'flex-start' }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FeatureBadge>
                    <AccessTimeIcon sx={{ color: '#FCA700', mr: 1.5, fontSize: '1.2rem' }} />
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      Same-Day Service
                    </Typography>
                  </FeatureBadge>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FeatureBadge>
                    <ThumbUpIcon sx={{ color: '#FCA700', mr: 1.5, fontSize: '1.2rem' }} />
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      98% Success Rate
                    </Typography>
                  </FeatureBadge>
                </motion.div>
              </Stack>

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <CTACardStyle>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                    Ready to get started?
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <Button
                      size="large"
                      variant="contained"
                      component={RouterLink}
                      to={CATEGORY_PATH.root}
                      startIcon={<BuildIcon />}
                      endIcon={<SendIcon />}
                      aria-label="View all Trades"
                      sx={{
                        height: '3.5rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        boxShadow: '0 4px 14px rgba(252, 167, 0, 0.4)',
                        background: 'linear-gradient(45deg, #FCA700, #FFB938)',
                        color: 'black',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FFB938, #FCA700)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(252, 167, 0, 0.5)',
                        }
                      }}
                    >
                      Select your Trade
                    </Button>

                    <Button
                      size="large"
                      variant="outlined"
                      target="_blank"
                      href="tel:+919971714172"
                      startIcon={<Icon icon={phoneCallFill} />}
                      sx={{
                        height: '3.5rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      +91 99717 14172
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocationOnIcon sx={{ color: 'grey.500', fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: 'grey.500' }}>
                      Serving all construction sites across the United Kingdom
                    </Typography>
                  </Stack>
                </CTACardStyle>
              </motion.div>

              {/* Action Buttons */}
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{
                  mt: 4,
                  justifyContent: { xs: "center", md: "flex-start" },
                  gap: 2
                }}
              >
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <HLink to="/trades#csl-cards">
                    <ActionButton
                      size="large"
                      variant="contained"
                      sx={{
                        color: "black",
                        bgcolor: "#FCA700",
                        "&:hover": { bgcolor: "#FFB938", transform: 'translateY(-2px)' },
                      }}
                    >
                      CSCS Cards
                    </ActionButton>
                  </HLink>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <HLink to="/trades#csl-tests">
                    <ActionButton
                      size="large"
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(255,255,255,0.5)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderColor: "white",
                          transform: 'translateY(-2px)'
                        },
                      }}
                    >
                      CITB Tests
                    </ActionButton>
                  </HLink>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <HLink to="/qualifications">
                    <ActionButton
                      size="large"
                      variant="contained"
                      sx={{
                        color: "black",
                        bgcolor: "#FCA700",
                        "&:hover": { bgcolor: "#FFB938", transform: 'translateY(-2px)' },
                      }}
                    >
                      NVQ Quals
                    </ActionButton>
                  </HLink>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <HLink to="/trades#csl-courses">
                    <ActionButton
                      size="large"
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(255,255,255,0.5)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderColor: "white",
                          transform: 'translateY(-2px)'
                        },
                      }}
                    >
                      Courses
                    </ActionButton>
                  </HLink>
                </motion.div>
              </Stack>
            </Box>
          </Grid>

          {/* Right Column - Service Cards */}
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Grid container spacing={3}>
              {serviceCards.map((card, index) => (
                <Grid item xs={6} key={card.title}>
                  <ServiceCard
                    color={card.color}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay, duration: 0.5 }}
                  >
                    <IconContainer color={card.color}>
                      {card.icon}
                    </IconContainer>
                    <Typography
                      variant="h5"
                      sx={{
                        color: card.color,
                        fontWeight: 700,
                        mb: 1,
                        textAlign: 'center',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'white',
                        opacity: 0.8,
                        textAlign: 'center'
                      }}
                    >
                      {card.description}
                    </Typography>
                  </ServiceCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}