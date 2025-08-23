import React, { useState, useEffect } from 'react';
import { alpha, styled } from '@mui/material/styles';
import { Box, Container, Typography, useTheme, Grid, Button } from '@mui/material';
import { varFadeInUp, varFadeInRight, MotionInView } from '../../animate';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';

// Use more descriptive image names related to your platform
const INTERFACE_IMAGES = [
  {
    src: '/static/home/clean-1.png',
    alt: 'CSCS Test Booking Interface',
    caption: 'Easy test scheduling'
  },
  {
    src: '/static/home/clean-2.png',
    alt: 'Test Center Selection Map',
    caption: 'Convenient location finder'
  },
  {
    src: '/static/home/clean-3.png',
    alt: 'Card Application Form',
    caption: 'Streamlined application process'
  },
  {
    src: '/static/home/clean-4.png',
    alt: 'User Dashboard',
    caption: 'Track your applications'
  },
  {
    src: '/static/home/clean-5.png',
    alt: 'Mobile Booking Experience',
    caption: 'Fully responsive design'
  },
  {
    src: '/static/home/clean-6.png',
    alt: 'Payment Processing',
    caption: 'Secure payment options'
  },
  {
    src: '/static/home/clean-7.png',
    alt: 'Test Completion Summary',
    caption: 'Instant test results'
  },
  {
    src: '/static/home/clean-8.png',
    alt: 'Card Status Tracker',
    caption: 'Real-time status updates'
  },
  {
    src: '/static/home/clean-9.png',
    alt: 'Resource Library',
    caption: 'Test preparation materials'
  },
  {
    src: '/static/home/clean-10.png',
    alt: 'Complete Platform Overview',
    caption: 'All-in-one solution'
  }
];

const RootStyle = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(15),
  background: theme.palette.background.default
}));

// const ContentStyle = styled('div')(({ theme }) => ({
//   maxWidth: 520,
//   margin: 'auto',
//   textAlign: 'center',
//   [theme.breakpoints.up('md')]: {
//     zIndex: 11,
//     textAlign: 'left',
//     position: 'absolute'
//   }
// }));

// Caption overlay for images
const CaptionStyle = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1, 2),
  backgroundColor: alpha(theme.palette.common.black, 0.7),
  color: theme.palette.common.white,
  textAlign: 'center',
  borderRadius: '0 0 8px 8px',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  fontSize: '0.875rem',
  fontWeight: 500
}));

// Enhanced image container
const ImageContainerStyle = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadiusMd,
  boxShadow: theme.customShadows.z16,
  '&:hover .caption': {
    opacity: 1
  }
}));

export default function LandingCleanInterfaces() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [loadedImages, setLoadedImages] = useState([]);

  useEffect(() => {
    let isMounted = true;
    INTERFACE_IMAGES.forEach((item, index) => {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        if (isMounted) {
          setLoadedImages(prev => [...prev, index]);
        }
      };
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <RootStyle>
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={5}>
            <MotionInView variants={varFadeInRight}>
              <Typography component="p" variant="overline" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                USER-FRIENDLY PLATFORM
              </Typography>

              <Typography
                variant="h2"
                paragraph
                sx={{
                  mb: 3,
                  ...(!isLight && {
                    textShadow: (theme) => `4px 4px 16px ${alpha(theme.palette.grey[800], 0.48)}`
                  })
                }}
              >
                Simple, Intuitive Booking Experience
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                Our platform makes booking your CSCS test simple with a streamlined,
                user-friendly interface. From finding your nearest test center to
                receiving your results, every step is designed to be straightforward and efficient.
              </Typography>

              <Button
                component={RouterLink}
                to="/booking"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                size="large"
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: theme.customShadows.z8
                }}
              >
                Start Booking
              </Button>
            </MotionInView>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative', height: { xs: 400, md: 600 } }}>
              {INTERFACE_IMAGES.map((item, index) => (
                <MotionInView
                  key={index}
                  threshold={index / 15}
                  variants={varFadeInUp}
                  sx={{
                    top: 0,
                    left: 0,
                    position: 'absolute',
                    ...(index === 0 && { zIndex: 8 }),
                    ...(index === INTERFACE_IMAGES.length - 1 && { position: 'relative', zIndex: 9 }),
                    opacity: loadedImages.includes(index) ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    transform: `translateY(${index * 16}px) scale(${1 - index * 0.01})`,
                    filter: index > 0 ? `brightness(${1 - index * 0.05})` : 'none',
                    width: '100%'
                  }}
                >
                  <ImageContainerStyle>
                    <Box
                      component="img"
                      src={item.src}
                      alt={item.alt}
                      sx={{ width: '100%', height: 'auto' }}
                      loading="lazy"
                    />
                    <CaptionStyle className="caption">
                      {item.caption}
                    </CaptionStyle>
                  </ImageContainerStyle>
                </MotionInView>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}