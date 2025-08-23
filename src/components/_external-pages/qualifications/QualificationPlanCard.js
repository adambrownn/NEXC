import React, { useState } from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import checkmarkFill from "@iconify/icons-eva/checkmark-fill";
import trendingUpFill from "@iconify/icons-eva/trending-up-fill";
import arrowForwardFill from "@iconify/icons-eva/arrow-forward-fill";
import clockFill from "@iconify/icons-eva/clock-fill";
import barChartFill from "@iconify/icons-eva/bar-chart-fill";
// material
import { experimentalStyled as styled, useTheme, alpha } from "@mui/material/styles";
import {
  Card,
  Typography,
  Box,
  Stack,
  Divider,
  Button,
  Grid,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Container
} from "@mui/material";
import QualificationApplicationForm from "../forms/QualificationForm";

// Import the components instead of using placeholders
import {
  QualificationConnector,
  QualStepIcon,
  MetricBadge,
  WhyChooseItem
} from "./QualificationComponents";

// Move qualification data outside component for better performance
const QUAL_LEVELS = [
  {
    label: 'Entry Level',
    description: 'CSCS Cards & Level 1',
    title: 'Entry Level Qualifications',
    targetRole: 'Qualified Construction Worker',
    salary: '£20K - £25K',
    price: '495',
    timeToROI: '3',
    duration: '1-2m',
    benefits: [
      "Access to construction sites with official CSCS card",
      "Foundation for career advancement in construction",
      "Essential health and safety knowledge",
      "Improved employability in the construction sector"
    ],
    demandScore: 75
  },
  {
    label: 'Skilled Level',
    description: 'NVQ Level 2',
    title: 'Trade Qualification (NVQ Level 2)',
    targetRole: 'Skilled Tradesperson',
    salary: '£28K - £35K',
    price: '995',
    timeToROI: '6',
    duration: '3-4m',
    benefits: [
      "Recognition as a qualified tradesperson",
      "Ability to work independently on construction sites",
      "Eligibility for the CSCS Skilled Worker Card (Blue)",
      "Increased earning potential in your trade"
    ],
    demandScore: 85
  },
  {
    label: 'Supervisory',
    description: 'NVQ Level 3',
    title: 'Supervisory Qualification (NVQ Level 3)',
    targetRole: 'Team Leader/Supervisor',
    salary: '£35K - £45K',
    price: '1,495',
    timeToROI: '8',
    duration: '4-6m',
    benefits: [
      "Eligibility for supervisory positions",
      "Qualification for CSCS Gold Card",
      "Recognition of leadership competence",
      "Path to management roles and higher earnings"
    ],
    demandScore: 90
  },
  {
    label: 'Management',
    description: 'NVQ Level 4+',
    title: 'Management Qualification (NVQ Level 4+)',
    targetRole: 'Site/Project Manager',
    salary: '£45K - £65K+',
    price: '1,995',
    timeToROI: '10',
    duration: '6-8m',
    benefits: [
      "Recognition as a construction professional",
      "Eligibility for senior management positions",
      "Qualification for CSCS Black Card",
      "Significantly higher earning potential"
    ],
    demandScore: 95
  }
];

// Move testimonial data outside component
const TESTIMONIALS = [
  {
    name: "Michael S.",
    location: "London",
    story: (qualDesc, role) => `I completed my ${qualDesc} qualification with NEXC and secured a ${role} position within 2 months. My salary increased by over 25%.`,
    image: "/static/mock-images/avatars/avatar_default.jpg"
  },
  {
    name: "Sarah T.",
    location: "Birmingham",
    story: (qualDesc, role, salary) => `The ${qualDesc} qualification process was straightforward with NEXC's help. I'm now working as a ${role} earning ${salary}.`,
    image: "/static/mock-images/avatars/avatar_default.jpg"
  }
];

// Fix 1: Use a styled component for QualificationCard that properly handles the active prop
const QualificationCard = styled(Card)(({ theme, active }) => ({
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  boxShadow: active === "true" ? theme.shadows[10] : theme.shadows[1],
  border: active === "true" ? `1px solid ${theme.palette.primary.light}` : 'none'
}));

// Fix 2: Use default parameters instead of defaultProps
const QualificationPlanCard = ({ qualificationData = [] }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // Handle step change
  const handleStepChange = (step) => {
    setActiveStep(step);
    setShowForm(false); // Hide form when changing qualifications
  };

  // Handle keyboard navigation for accessibility
  const handleStepKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepChange(index);
    }
  };

  // Current qualification based on selected step
  const currentQual = QUAL_LEVELS[activeStep];

  return (
    <Container>
      {/* Hero Section - New addition for better SEO and immediate value proposition */}
      <Box sx={{
        textAlign: 'center',
        mb: { xs: 4, md: 6 },
        px: { xs: 2, sm: 0 }
      }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Construction Qualifications That Advance Your Career
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'text.secondary',
            maxWidth: 800,
            mx: 'auto',
            mb: 3,
            px: { xs: 1, sm: 2 }
          }}
        >
          Get industry-recognized NVQs and CSCS cards to increase your earning potential
          and unlock new career opportunities in the construction industry.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => setShowForm(true)}
          sx={{
            px: { xs: 3, sm: 4 },
            py: 1
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Career path stepper - Simplified to focus on qualification levels */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Your Construction Career Path
        </Typography>

        <Stepper alternativeLabel activeStep={activeStep} connector={<QualificationConnector />} sx={{ mb: 2 }}>
          {QUAL_LEVELS.map((level, index) => (
            <Step key={level.label} completed={index <= activeStep}>
              <StepLabel
                StepIconComponent={QualStepIcon}
                onClick={() => handleStepChange(index)}
                onKeyDown={(event) => handleStepKeyDown(event, index)}
                tabIndex={0}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{level.label}</Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>{level.description}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mb: 2 }}>
          Click on any level to view details
        </Typography>
      </Box>

      {/* Qualification details and application section */}
      <Grid container spacing={4}>
        {/* Qualification information column */}
        <Grid item xs={12} md={7}>
          {/* Fix: Pass active as a string "true" instead of boolean true */}
          <QualificationCard active="true">
            {/* Qualification header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                {currentQual.description}
              </Typography>

              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                {currentQual.title}
              </Typography>

              {/* Career progression section - Highlighted for impact */}
              <Box
                sx={{
                  mb: 4,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.lighter, 0.6),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.light, 0.2)
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Career Impact
                </Typography>

                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="text.secondary">Current Position</Typography>
                    <Typography variant="subtitle2">Unqualified Worker</Typography>
                  </Grid>

                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Icon icon={arrowForwardFill} width={24} height={24} />
                    </Box>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography variant="body2" color="text.secondary">Target Position</Typography>
                    <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {currentQual.targetRole}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600 }}>
                      {currentQual.salary}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Rest of the component remains the same */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                What You'll Gain
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 4 }}>
                {currentQual.benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        mr: 1.5,
                        display: 'flex',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'success.lighter',
                        color: 'success.dark',
                        flexShrink: 0
                      }}
                    >
                      <Icon icon={checkmarkFill} width={16} height={16} />
                    </Box>
                    <Typography variant="body2">{benefit}</Typography>
                  </Box>
                ))}
              </Stack>

              {/* Key metrics - Visual representation of value */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={4}>
                  <MetricBadge color="success">
                    <Icon icon={trendingUpFill} width={24} height={24} />
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                      {currentQual.timeToROI} mo
                    </Typography>
                    <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                      Average ROI
                    </Typography>
                  </MetricBadge>
                </Grid>

                <Grid item xs={4}>
                  <MetricBadge color="info">
                    <Icon icon={clockFill} width={24} height={24} />
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                      {currentQual.duration}
                    </Typography>
                    <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                      Completion Time
                    </Typography>
                  </MetricBadge>
                </Grid>

                <Grid item xs={4}>
                  <MetricBadge color="warning">
                    <Icon icon={barChartFill} width={24} height={24} />
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
                      {currentQual.demandScore}%
                    </Typography>
                    <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                      Industry Demand
                    </Typography>
                  </MetricBadge>
                </Grid>
              </Grid>

              {/* Pricing and CTA */}
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  £{currentQual.price}
                </Typography>
                <Typography variant="body2" sx={{ ml: 1, mb: 0.5, color: 'text.secondary' }}>
                  all-inclusive package
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => setShowForm(true)}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                Start Your Application
              </Button>
            </Box>
          </QualificationCard>
        </Grid>

        {/* Rest of the component remains the same */}
        <Grid item xs={12} md={5}>
          {showForm ? (
            <Card sx={{ p: 3, mb: 3, boxShadow: theme.shadows[20] }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Apply for {currentQual.title}
              </Typography>
              <QualificationApplicationForm price={currentQual.price} level={currentQual.description} />
            </Card>
          ) : (
            <>
              {/* Trust factors - Social proof */}
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Success Stories
                </Typography>

                <Stack spacing={3}>
                  {TESTIMONIALS.map((story, index) => (
                    <Box key={index} sx={{ p: 2.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar src={story.image} sx={{ width: 48, height: 48 }} />
                        <Box>
                          <Typography variant="subtitle2">{story.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{story.location}</Typography>
                        </Box>
                      </Stack>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{story.story(currentQual.description, currentQual.targetRole, currentQual.salary)}"
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setShowForm(true)}
                  sx={{ mt: 3 }}
                >
                  Get Your Qualification
                </Button>
              </Card>

              {/* Why choose section - Value proposition */}
              <Card
                sx={{ p: 3 }}
                component="section"
                aria-labelledby="why-choose-title"
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 3 }}
                  component="h2"
                  id="why-choose-title"
                >
                  Why Choose NEXC for Your Qualification
                </Typography>

                <Stack spacing={2.5}>
                  <WhyChooseItem
                    number="1"
                    title="Dedicated Support Team"
                    description="Expert advisors guide you through the entire qualification process from start to finish."
                  />
                  <WhyChooseItem
                    number="2"
                    title="98% Assessment Pass Rate"
                    description="Our preparation and support ensures exceptional success rates for all candidates."
                  />
                  <WhyChooseItem
                    number="3"
                    title="Multiple Assessment Options"
                    description="Flexible assessment methods to fit around your working schedule."
                  />
                  <WhyChooseItem
                    number="4"
                    title="Career Progression Focus"
                    description="We don't just help with qualifications - we help advance your career."
                  />
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setShowForm(true)}
                  sx={{ mt: 3 }}
                >
                  Apply Now
                </Button>
              </Card>
            </>
          )}
        </Grid>
      </Grid>

      {/* Rest of the component remains the same */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Frequently Asked Questions
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>What is an NVQ qualification?</Typography>
              <Typography variant="body2">
                National Vocational Qualifications (NVQs) are work-based qualifications that recognize the skills and knowledge needed to perform effectively in a specific job role. They assess your competence in real work environments and are highly valued by employers across the construction industry.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>How long does it take to get qualified?</Typography>
              <Typography variant="body2">
                The timeframe varies depending on the qualification level and your prior experience. Entry-level qualifications typically take 1-2 months, while higher-level management qualifications may take 6-8 months. Our team works to expedite the process wherever possible.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Do I need to take time off work?</Typography>
              <Typography variant="body2">
                No. Our qualification process is designed to assess you in your workplace during normal working hours. The assessor will visit you on-site or conduct remote assessments, minimizing disruption to your regular work schedule.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Will this qualification help me get a CSCS card?</Typography>
              <Typography variant="body2">
                Yes. NVQ qualifications are the primary route to obtaining CSCS cards above the basic laborer level. Each NVQ level corresponds to a specific CSCS card, with higher NVQ levels qualifying you for more advanced cards that provide access to better job opportunities and higher pay.
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setShowForm(true)}
            sx={{ px: 4, py: 1 }}
          >
            Apply for Your Qualification Now
          </Button>
        </Box>
      </Box>

      {/* Schema markup for SEO */}
      <Box sx={{ display: 'none' }} aria-hidden="true">
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Construction Industry Qualifications",
            "description": "Industry-recognized NVQ qualifications and CSCS cards for construction professionals to advance their careers",
            "provider": {
              "@type": "Organization",
              "name": "NEXC",
              "url": "https://nexc.co.uk"
            },
            "serviceType": "Construction Qualification Services",
            "offers": {
              "@type": "Offer",
              "price": "${currentQual.price}",
              "priceCurrency": "GBP"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United Kingdom"
            },
            "termsOfService": "https://nexc.co.uk/terms",
            "review": {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "4.8",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "Michael S."
              }
            }
          }
        `}</script>
      </Box>
    </Container>
  );
};

// Keep propTypes for validation, but remove defaultProps
QualificationPlanCard.propTypes = {
  qualificationData: PropTypes.array
};

export default QualificationPlanCard;