import React from 'react';
import { styled, alpha } from "@mui/material/styles";
import { Box, Grid, Container, Typography, Button, Stack, Chip } from "@mui/material";
import { MotionInView, varFadeInUp, varFadeInDown, varFadeInRight } from "../../animate";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { HashLink as HLink } from "react-router-hash-link";

// Keep original styled components - they work correctly with the theme
const RootStyle = styled("div")(({ theme }) => ({
  padding: theme.spacing(15, 0),
  backgroundColor: theme.palette.grey[900],
  backgroundImage: `linear-gradient(to bottom, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`,
  position: 'relative',
  overflow: 'hidden',
}));

const ContentStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  position: "relative",
  marginBottom: theme.spacing(10),
  [theme.breakpoints.up("md")]: {
    height: "100%",
    marginBottom: 0,
    textAlign: "left",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
}));

const CardImage = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadiusMd,
  boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.4)}`,
  transition: 'all 0.4s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 32px 60px ${alpha(theme.palette.common.black, 0.5)}`,
  },
}));

// List of card schemes we support - NO LOGOS
const CARD_SCHEMES = [
  { name: "CSCS" },
  { name: "CPCS" },
  { name: "ECS" },
  { name: "CCDO" },
  { name: "CISRS" }
];

// Use original component name to maintain compatibility with imports
export default function LandingDarkMode() {
  return (
    <RootStyle>
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        {/* Background elements */}
        <Box
          component="img"
          alt="background shape"
          src="/static/home/shape.svg"
          sx={{
            top: 0,
            right: 0,
            bottom: 0,
            my: "auto",
            position: "absolute",
            filter: "grayscale(1) opacity(48%)",
            display: { xs: "none", md: "block" },
          }}
          loading="lazy"
        />

        {/* Circular gradient for visual interest - using direct color values */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: -100, md: -300 },
            bottom: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(32, 101, 209, 0.15), transparent 70%)',
          }}
        />

        <Grid
          container
          spacing={5}
          direction="row-reverse"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={5}>
            <ContentStyle>
              <MotionInView variants={varFadeInRight}>
                <Typography
                  component="p"
                  variant="overline"
                  sx={{
                    mb: 2,
                    color: "#2065D1", // Direct hex instead of "primary.main"
                    display: "block",
                    fontWeight: 600
                  }}
                >
                  CARD SCHEMES
                </Typography>

                <Typography variant="h2" sx={{ mb: 3, color: "#ffffff" }}>
                  Construction Skills Cards Services
                </Typography>

                <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 4, fontSize: '1.1rem' }}>
                  We provide services for various construction skills card schemes.
                  As an independent provider, we offer convenient booking and application
                  facilities for workers needing to obtain their construction skills cards.
                </Typography>

                {/* Card Schemes section - TEXT ONLY */}
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 2, fontWeight: 500 }}>
                    Available schemes types:
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {CARD_SCHEMES.map((scheme) => (
                      <Chip
                        key={scheme.name}
                        label={scheme.name}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontWeight: 600,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      />
                    ))}
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: "rgba(255, 255, 255, 0.5)",
                      mt: 1,
                      fontSize: '0.75rem',
                      fontStyle: 'italic'
                    }}
                  >
                    *We are an independent provider and not affiliated with any card scheme organizations.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  component={HLink}
                  to="/trades#csl-cards"
                  sx={{
                    borderRadius: 2,
                    borderWidth: 2,
                    py: 1,
                    px: 3,
                    color: '#ffffff',
                    textDecoration: 'none',
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: 'rgba(32, 101, 209, 0.1)'
                    }
                  }}
                >
                  Explore Card Types
                </Button>
              </MotionInView>
            </ContentStyle>
          </Grid>

          <Grid item xs={12} md={7} sx={{ position: "relative" }}>
            <Box sx={{ position: 'relative', height: { xs: 400, md: 500 } }}>
              {/* First card with enhanced animation and styling */}
              <MotionInView
                threshold={0.5}
                variants={varFadeInDown}
                sx={{
                  position: "absolute",
                  top: { xs: '5%', md: '10%' },
                  left: { xs: '15%', md: '30%' },
                  zIndex: 2,
                  width: { xs: '70%', md: '60%' },
                  transformOrigin: 'center bottom'
                }}
              >
                <CardImage
                  alt="CSCS Partner Card"
                  src="/static/images/cscs/6.png"
                  sx={{
                    width: '100%',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                    transform: 'rotate(5deg)',
                  }}
                  loading="lazy"
                />
              </MotionInView>

              {/* Second card with enhanced animation and styling */}
              <MotionInView
                threshold={0.5}
                variants={varFadeInUp}
                sx={{
                  position: "absolute",
                  bottom: { xs: '5%', md: '10%' },
                  left: { xs: '5%', md: '10%' },
                  zIndex: 1,
                  width: { xs: '75%', md: '65%' },
                }}
              >
                <CardImage
                  alt="CSCS Card Example"
                  src="/static/images/cscscard3.jpeg"
                  sx={{
                    width: '100%',
                    transform: 'rotate(-3deg)',
                  }}
                  loading="lazy"
                />
              </MotionInView>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}