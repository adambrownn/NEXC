import React from "react";
import { Icon } from "@iconify/react";
import Chip from "@mui/material/Chip";
import { Typography, Box, Grid, Stack, Avatar, Button, Card, Divider } from "@mui/material";
import { alpha, experimentalStyled as styled } from "@mui/material/styles";
// import shieldCheck from "@iconify/icons-eva/shield-fill";
import clockFill from "@iconify/icons-eva/clock-fill";
// import personDone from "@iconify/icons-eva/person-done-fill";
// import fileTextFill from "@iconify/icons-eva/file-text-fill";
import checkmarkCircle from "@iconify/icons-eva/checkmark-circle-2-fill";
// import compassFill from "@iconify/icons-eva/compass-fill";
import starFill from "@iconify/icons-eva/star-fill";
import awardFill from "@iconify/icons-eva/award-fill";
import trendingUpFill from "@iconify/icons-eva/trending-up-fill";

// Career-focused trust factors
const TRUST_FACTORS = [
  {
    title: "Career Advancement",
    description: "Unlock higher-paying positions with the right industry qualifications.",
    icon: trendingUpFill,
    highlight: true
  },
  {
    title: "Earning Potential",
    description: "Qualified professionals earn up to 32% more than their unqualified counterparts.",
    icon: starFill,
    highlight: true
  },
  {
    title: "Industry Recognition",
    description: "Get qualifications that top employers specifically look for.",
    icon: awardFill,
  },
  {
    title: "Fast-Track Progress",
    description: "Accelerate your career growth with strategic qualification paths.",
    icon: clockFill,
  },
];

// Career-focused benefits
const CAREER_BENEFITS = [
  "Access to higher-paying management and supervisor roles",
  "Industry recognition across multiple employers",
  "Increased job security and promotion opportunities",
  "Qualification verification trusted by leading contractors"
];

// Career success statistics
const CAREER_STATS = [
  { figure: "32%", label: "Average Salary Increase" },
  { figure: "87%", label: "Career Advancement Rate" },
  { figure: "9 mo.", label: "Avg. Time to Promotion" },
  { figure: "£12k+", label: "Typical First-Year ROI" },
];

// Success stories/testimonials
const SUCCESS_STORIES = [
  {
    name: "Michael T.",
    position: "Site Manager",
    quote: "After getting my NVQ Level 3, I was promoted within 4 months. My salary increased by £9,500 annually.",
    qualification: "NVQ Level 3 in Site Supervision",
  },
  {
    name: "Sarah L.",
    position: "Project Manager",
    quote: "The qualification advice from NEXC helped me choose the right path. My new role came with a company vehicle and £15k raise.",
    qualification: "NVQ Level 6 in Construction Management",
  },
];

// Career pathway data - showing progression
const CAREER_PATHWAYS = [
  {
    level: "Entry Level",
    roles: ["General Laborer", "Apprentice"],
    salary: "£18,000 - £22,000",
    qualifications: ["CSCS Card", "Health & Safety Awareness"]
  },
  {
    level: "Skilled Worker",
    roles: ["Skilled Tradesperson", "Specialist"],
    salary: "£25,000 - £35,000",
    qualifications: ["NVQ Level 2", "Specialist Certifications"]
  },
  {
    level: "Supervisor",
    roles: ["Team Leader", "Site Supervisor"],
    salary: "£35,000 - £45,000",
    qualifications: ["NVQ Level 3", "SSSTS"]
  },
  {
    level: "Management",
    roles: ["Site Manager", "Project Manager"],
    salary: "£45,000 - £65,000+",
    qualifications: ["NVQ Level 6", "SMSTS"]
  }
];

// ----------------------------------------------------------------------

const IconWrapperStyle = styled("div")(({ theme, highlight }) => ({
  margin: "auto",
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  width: theme.spacing(8),
  justifyContent: "center",
  height: theme.spacing(8),
  marginBottom: theme.spacing(3),
  color: highlight ? theme.palette.primary.main : theme.palette.info.main,
  backgroundColor: highlight
    ? `${alpha(theme.palette.primary.main, 0.08)}`
    : `${alpha(theme.palette.info.main, 0.08)}`,
  transition: theme.transitions.create('all'),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: highlight
      ? `0 4px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`
      : `0 4px 16px 0 ${alpha(theme.palette.info.main, 0.24)}`
  }
}));

const BenefitItemStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  transition: 'all 0.3s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    transform: 'translateY(-4px)',
  }
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.neutral, 0.4),
  position: 'relative',
  '&:before': {
    content: '"""',
    position: 'absolute',
    top: 8,
    left: 16,
    fontSize: 60,
    color: alpha(theme.palette.primary.main, 0.1),
    fontFamily: 'Georgia, serif',
  }
}));

const PathwayCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s',
  position: 'relative',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.lighter, 0.1),
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -15,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '15px solid transparent',
    borderRight: '15px solid transparent',
    borderTop: `15px solid ${theme.palette.divider}`,
    display: 'block',
    zIndex: -1,
  }
}));

export default function QualificationTrust() {
  return (
    <Box sx={{ py: 6 }}>
      {/* Career-focused headline */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
          Transform Your Construction Career
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
          The right qualification can increase your earning potential by up to 32% and unlock
          opportunities for career advancement in the construction industry.
        </Typography>
      </Box>

      {/* Career success statistics */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {CAREER_STATS.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <StatBox>
              <Typography variant="h3" sx={{ color: 'primary.main', mb: 1 }}>
                {stat.figure}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {stat.label}
              </Typography>
            </StatBox>
          </Grid>
        ))}
      </Grid>

      {/* Career benefits & factors */}
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        Qualifications That Advance Your Career
      </Typography>
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {TRUST_FACTORS.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Box
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                textAlign: "center",
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'background.neutral',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <IconWrapperStyle highlight={item.highlight}>
                <Icon icon={item.icon} width={36} height={36} />
              </IconWrapperStyle>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {item.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Career Pathway Visualization - NEW */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          Your Career Advancement Pathway
        </Typography>

        <Grid container spacing={5} sx={{ position: 'relative' }}>
          {/* Connecting line for pathway */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 4,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            zIndex: 0
          }} />

          {CAREER_PATHWAYS.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <PathwayCard>
                <Box sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}>
                  {index + 1}
                </Box>
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom
                  sx={{ color: 'primary.main' }}
                >
                  {step.level}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Typical Roles:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.roles.join(', ')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Salary Range:</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    {step.salary}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Required Qualifications:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.qualifications.join(', ')}
                  </Typography>
                </Box>
              </PathwayCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Success Stories - NEW */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          Success Stories
        </Typography>

        <Grid container spacing={3}>
          {SUCCESS_STORIES.map((story, index) => (
            <Grid item xs={12} md={6} key={index}>
              <TestimonialCard>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ pl: 3, fontStyle: 'italic' }}
                >
                  "{story.quote}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1">{story.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{story.position}</Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={story.qualification}
                    sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.1) }}
                  />
                </Box>
              </TestimonialCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How we help section */}
      <Box
        sx={{
          mb: 8,
          p: 4,
          borderRadius: 2,
          bgcolor: theme => alpha(theme.palette.primary.lighter, 0.5),
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          How We Accelerate Your Career Growth
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>1</Avatar>
                <Typography variant="h6">
                  Career Goal Assessment
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>2</Avatar>
                <Typography variant="h6">
                  Qualification Pathway Planning
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>3</Avatar>
                <Typography variant="h6">
                  Provider Selection & Application
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>4</Avatar>
                <Typography variant="h6">
                  Career Advancement Support
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                sx={{ mt: 2, alignSelf: 'flex-start' }}
                href="#qualification-options"
              >
                Start Your Career Advancement
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2
              }}
            >
              <Typography variant="subtitle1" paragraph fontWeight="bold">
                Career Benefits of Our Approach:
              </Typography>
              <Stack spacing={2}>
                {CAREER_BENEFITS.map((benefit, index) => (
                  <BenefitItemStyle key={index}>
                    <Icon icon={checkmarkCircle} width={24} height={24} style={{ marginRight: 12, color: '#36B37E' }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </BenefitItemStyle>
                ))}
              </Stack>

              <Box sx={{
                mt: 3,
                p: 2,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.warning.lighter, 0.5),
                border: '1px dashed',
                borderColor: 'warning.main'
              }}>
                <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                  Did you know?
                </Typography>
                <Typography variant="body2">
                  Most construction professionals qualify for partial or complete funding assistance
                  for their qualifications. Our advisors can help determine your eligibility.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
