import React from 'react';
// material
import {
  alpha,
  useTheme,
  experimentalStyled as styled,
} from "@mui/material/styles";
import {
  Box,
  Grid,
  Card,
  Container,
  Typography,
  Button,
} from "@mui/material";
//
import { HashLink as Link } from "react-router-hash-link";
import { motion } from "framer-motion";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Import Material Icons instead of using static SVGs
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SchoolIcon from '@mui/icons-material/School';
import EngineeringIcon from '@mui/icons-material/Engineering';

const CARDS = [
  {
    path: "/trades#csl-cards",
    icon: <CardMembershipIcon style={{ fontSize: 36 }} />,
    title: "CSCS Cards",
    color: "#2196f3", // blue shade
    description:
      "Essential for UK construction site access, CSCS cards verify your qualifications and health & safety knowledge. Fast application processing available.",
    cta: "Get Your Card →",
  },
  {
    path: "/trades#csl-tests",
    icon: <HealthAndSafetyIcon style={{ fontSize: 36 }} />,
    title: "Health & Safety Test",
    color: "#f44336", // red shade
    description:
      "Book your CITB Health, Safety & Environment test with real time availability check. Required for all CSCS cards. Preparation materials included.",
    cta: "Book Test →",
  },
  {
    path: "/trades#csl-courses",
    icon: <EngineeringIcon style={{ fontSize: 36 }} />,
    title: "Construction Courses",
    color: "#4caf50", // green shade
    description:
      "Expert-led training for construction skills and safety certification. UK-recognized courses to enhance your career and improve site safety.",
    cta: "Find Courses →",
  },
  {
    path: "/qualifications",
    icon: <SchoolIcon style={{ fontSize: 36 }} />,
    title: "NVQ Qualifications",
    color: "#ff9800", // orange shade
    description:
      "Earn lifetime NVQ qualifications through on-site assessment. Level 2 & Level 3 NVQs available for all construction trades to secure your CSCS card.",
    cta: "Explore NVQs →",
  },
];

const RootStyle = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
  position: "relative",
  backgroundColor: theme.palette.background.neutral,
  [theme.breakpoints.up("md")]: {
    paddingBottom: theme.spacing(15),
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: "radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)",
    backgroundSize: "20px 20px",
  }
}));

const CardStyle = styled(motion.div)(({ theme }) => ({
  height: '100%',
  position: "relative",
  borderRadius: theme.shape.borderRadiusMd,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
  },
}));

const CardInner = styled(Card)(({ theme, color }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(5),
  borderRadius: theme.shape.borderRadiusMd,
  boxShadow: `0 10px 40px 0 ${alpha(theme.palette.grey[500], 0.12)}`,
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "8px",
    backgroundColor: color || theme.palette.primary.main,
  },
  "&:hover": {
    boxShadow: `0 20px 50px 0 ${alpha(theme.palette.grey[500], 0.2)}`,
  },
}));

const CardIconStyle = styled("div")(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 64,
  height: 64,
  borderRadius: "50%",
  marginBottom: theme.spacing(3),
  color: color || theme.palette.primary.main,
  backgroundColor: alpha(color || theme.palette.primary.main, 0.08),
}));

const SectionHeading = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(8),
  [theme.breakpoints.up("md")]: {
    marginBottom: theme.spacing(10),
  },
}));

// ----------------------------------------------------------------------

export default function LandingMinimalHelps() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <RootStyle>
      <Container maxWidth="lg">
        <SectionHeading>
          <Typography
            component="p"
            variant="overline"
            sx={{
              mb: 2,
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 2,
              display: "inline-block",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.08)
            }}
          >
            UK CONSTRUCTION SERVICES
          </Typography>

          <Typography variant="h2" sx={{ mb: 3 }}>
            Complete Construction Certification Solutions
          </Typography>

          <Typography
            variant="body1"
            sx={{
              maxWidth: 650,
              mx: 'auto',
              color: 'text.secondary',
              mb: 4,
              px: 2
            }}
          >
            Everything you need to work legally and safely on UK construction sites - from CSCS cards
            and CITB tests to NVQ qualifications and specialized training courses.
          </Typography>
        </SectionHeading>

        <Grid container spacing={4}>
          {CARDS.map((card, index) => (
            <Grid key={card.title} item xs={12} sm={6} md={6} lg={3}>
              <CardStyle
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1
                  }
                }}
                viewport={{ once: true }}
              >
                <CardInner color={card.color}>
                  <CardIconStyle color={card.color}>
                    {card.icon}
                  </CardIconStyle>

                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      mb: 2,
                      fontWeight: 700
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: isLight ? "text.secondary" : "text.primary",
                      mb: 3,
                      flexGrow: 1
                    }}
                  >
                    {card.description}
                  </Typography>

                  <Link
                    to={card.path}
                    style={{
                      textDecoration: "none",
                      display: "inline-block"
                    }}
                  >
                    <Button
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: alpha(card.color, 0.08),
                        }
                      }}
                    >
                      {card.cta}
                    </Button>
                  </Link>
                </CardInner>
              </CardStyle>
            </Grid>
          ))}
        </Grid>
      </Container>
    </RootStyle>
  );
}
