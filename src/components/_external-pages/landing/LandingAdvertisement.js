import React, { useState, useEffect } from 'react';
import { styled, alpha, useTheme } from "@mui/material/styles";
import {
  Box, Container, Typography, Grid, Paper, Stack, Tabs, Tab,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { ContactForm } from "../contact";
import { MotionInView, varFadeInUp, varFadeInDown } from "../../animate";
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import axiosInstance from "../../../axiosConfig";

// Enhanced styling with better visual appeal
const RootStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(10, 0),
  background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.lighter, 0.2)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage: 'url(/static/illustrations/dot-pattern.svg)',
    opacity: 0.07,
    zIndex: 1
  }
}));

const ContentStyle = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
}));

// Advanced icon grid styles - UPDATED FOR BETTER SPACE UTILIZATION
const IconGridStyle = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  gap: theme.spacing(3),
  position: 'relative',
  maxWidth: { xs: 400, sm: 450, md: 520 }, // Increased width on larger screens
  margin: '0 auto',
  height: '100%',
  aspectRatio: '1/1', // Makes it a perfect square
  [theme.breakpoints.up('md')]: {
    marginRight: 0,
    marginLeft: 'auto',
    maxHeight: 520, // Limit height on large screens
  }
}));

// Styled icon container with hover effects - UPDATED SIZE AND PADDING
const IconBoxStyle = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 8px 16px 0 rgba(0,0,0,0.05)',
  padding: theme.spacing(2.5), // Increased padding
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s',
  cursor: 'default',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px 0 rgba(0,0,0,0.1)',
    '& .hover-content': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    '& .icon': {
      transform: 'translateY(-30px)',
      opacity: 0,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    transform: 'scaleX(0)',
    transformOrigin: 'center',
    transition: 'transform 0.3s ease-out',
  },
  '&:hover::after': {
    transform: 'scaleX(1)',
  }
}));

const HoverContentStyle = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  textAlign: 'center',
  opacity: 0,
  transform: 'translateY(10px)',
  transition: 'all 0.3s',
}));

const ContactPaperStyle = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadiusMd,
  padding: theme.spacing(4),
  boxShadow: '0 10px 40px 0 rgba(0,0,0,0.1)',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    width: '100%',
  },
}));

// Decorative element for visual interest
const ShapeStyle = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: -40,
  top: -40,
  width: 150,
  height: 150,
  borderRadius: '50%',
  background: alpha(theme.palette.primary.main, 0.08),
  zIndex: 0,
  [theme.breakpoints.down('md')]: {
    right: -20,
    top: -20,
    width: 80,
    height: 80,
  }
}));

// Icon info configuration - USING STRING REFERENCES INSTEAD OF IMPORTS
const ICON_CONFIG = [
  {
    icon: 'mdi:hard-hat', // String reference instead of imported icon
    color: '#1890FF',
    label: 'CSCS Testing',
    delay: 0.1
  },
  {
    icon: 'mdi:certificate',
    color: '#FFC107',
    label: 'Certification',
    delay: 0.2
  },
  {
    icon: 'mdi:map-marker',
    color: '#FF4842',
    label: 'Test Centers',
    delay: 0.3
  },
  {
    icon: 'mdi:clipboard-check',
    color: '#54D62C',
    label: 'Application Support',
    delay: 0.4
  },
  {
    icon: 'mdi:account-card-details',
    color: '#7635dc',
    label: 'Card Services',
    delay: 0.5
  },
  {
    icon: 'mdi:calendar-check',
    color: '#00AB55',
    label: 'Scheduling',
    delay: 0.6
  },
  {
    icon: 'mdi:school',
    color: '#1890FF',
    label: 'Training',
    delay: 0.7
  },
  {
    icon: 'mdi:account-group',
    color: '#FFC107',
    label: 'Trade Support',
    delay: 0.8
  },
  {
    icon: 'mdi:shield-check',
    color: '#00AB55',
    label: 'Health & Safety',
    delay: 0.9
  }
];

// New FAQ-related styled components
const TabsWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const AccordionStyle = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '&:not(:last-child)': {
    marginBottom: theme.spacing(2),
  },
  '&::before': {
    display: 'none',
  },
  boxShadow: theme.shadows[2],
}));

export default function LandingAdvertisement() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'faqs'
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (activeTab === 'faqs') {
      (async () => {
        setLoading(true);
        let resp = [];
        if (category) {
          resp = await axiosInstance.get(`/others/faqs?category=${category}`);
        } else {
          resp = await axiosInstance.get(`/others/faqs`);
        }
        setFaqs(resp.data || []);
        setLoading(false);
      })();
    }
  }, [activeTab, category]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  return (
    <RootStyle>
      <ContentStyle maxWidth="lg">
        {/* Section header */}
        <MotionInView variants={varFadeInDown}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              component="p"
              variant="overline"
              sx={{
                mb: 2,
                color: 'primary.main',
                fontWeight: 600,
                display: 'inline-block',
                px: 3,
                py: 0.5,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08)
              }}
            >
              SUPPORT CENTER
            </Typography>
            <Typography variant="h2" gutterBottom>
              How Can We Help You?
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Find answers in our FAQs or contact our team for personalized assistance with
              CSCS cards, CITB tests, and NVQ qualifications.
            </Typography>
          </Box>
        </MotionInView>

        {/* Navigation Tabs */}
        <TabsWrapper>
          <Tabs
            value={activeTab}
            onChange={(e, tab) => setActiveTab(tab)}
            centered
            sx={{ mb: 2 }}
          >
            <Tab
              label="Contact Us"
              value="contact"
              icon={<Icon icon="mdi:email-fast-outline" width={22} height={22} />}
              iconPosition="start"
            />
            <Tab
              label="Frequently Asked Questions"
              value="faqs"
              icon={<Icon icon="mdi:frequently-asked-questions" width={22} height={22} />}
              iconPosition="start"
            />
          </Tabs>
        </TabsWrapper>

        {/* Main content area */}
        <Grid
          container
          spacing={{ xs: 5, md: 4 }}
          alignItems="flex-start"
          justifyContent={activeTab === 'contact' ? "space-between" : "center"}
        >
          {/* Left column: Icons or Category selection */}
          <Grid item xs={12} md={6}>
            {activeTab === 'contact' ? (
              /* Your existing icon grid for Contact tab */
              <MotionInView variants={varFadeInUp}>
                <IconGridStyle>
                  {ICON_CONFIG.map((item, index) => (
                    <IconBoxStyle
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: item.delay,
                          duration: 0.5
                        }
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Icon
                        icon={item.icon}
                        className="icon"
                        style={{
                          fontSize: 42,
                          color: item.color,
                          transition: 'all 0.3s'
                        }}
                      />
                      <HoverContentStyle className="hover-content">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: item.color,
                            mb: 0.5
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                          Expert guidance and support
                        </Typography>
                      </HoverContentStyle>
                    </IconBoxStyle>
                  ))}
                </IconGridStyle>
              </MotionInView>
            ) : (
              /* Category chips for FAQs tab */
              <MotionInView variants={varFadeInUp}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ mb: 3, fontWeight: 600, textAlign: { xs: 'center', md: 'left' } }}
                  >
                    Browse by Category
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1, mb: 4 }}
                  >
                    {['all', 'card', 'test', 'qualification', 'course', 'center', 'trade', 'payment'].map((cat) => (
                      <Box
                        key={cat}
                        component={motion.div}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryChange(cat === 'all' ? '' : cat)}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: category === cat || (cat === 'all' && category === '') ? '#fff' : 'text.primary',
                          bgcolor: category === cat || (cat === 'all' && category === '')
                            ? 'primary.main'
                            : alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            bgcolor: category === cat || (cat === 'all' && category === '')
                              ? 'primary.dark'
                              : alpha(theme.palette.primary.main, 0.16),
                          }
                        }}
                      >
                        {cat === 'all' ? 'All FAQs' : cat}
                      </Box>
                    ))}
                  </Stack>

                  {/* Visual element for empty FAQ state */}
                  {faqs.length === 0 && !loading && (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 5,
                        height: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderRadius: 2
                      }}
                    >
                      <Icon
                        icon="mdi:file-search-outline"
                        width={80}
                        height={80}
                        style={{ opacity: 0.4 }}
                      />
                      <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                        No FAQs found in this category
                      </Typography>
                    </Box>
                  )}
                </Box>
              </MotionInView>
            )}
          </Grid>

          {/* Right column: Contact form or FAQs */}
          <Grid item xs={12} md={6}>
            {activeTab === 'contact' ? (
              /* Contact form for Contact tab - your existing form */
              <MotionInView variants={varFadeInUp} sx={{ position: 'relative' }}>
                <ShapeStyle />
                <ShapeStyle sx={{
                  left: -20,
                  bottom: -20,
                  top: 'auto',
                  right: 'auto',
                  width: 100,
                  height: 100,
                  background: alpha('#FCA700', 0.08)
                }} />
                <ContactPaperStyle elevation={0}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      }}
                    >
                      <Icon
                        icon="mdi:email-fast-outline"
                        style={{
                          fontSize: 24,
                          color: theme.palette.primary.main
                        }}
                      />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Send us a message
                    </Typography>
                  </Stack>
                  <ContactForm />
                </ContactPaperStyle>
              </MotionInView>
            ) : (
              /* FAQ accordion list for FAQs tab */
              <MotionInView variants={varFadeInUp}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    maxHeight: 600,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Frequently Asked Questions
                  </Typography>

                  {loading ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <motion.div
                        animate={{
                          rotate: 360
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      >
                        <Icon icon="mdi:loading" width={40} height={40} />
                      </motion.div>
                      <Typography sx={{ mt: 2 }}>Loading FAQs...</Typography>
                    </Box>
                  ) : (
                    faqs.map((faq) => (
                      <AccordionStyle key={faq._id}>
                        <AccordionSummary
                          expandIcon={<Icon icon="mdi:chevron-down" width={20} height={20} />}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {faq.title}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2">
                            {faq.description}
                          </Typography>
                        </AccordionDetails>
                      </AccordionStyle>
                    ))
                  )}

                  {!loading && faqs.length > 0 && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Didn't find what you were looking for?
                      </Typography>
                      <Box
                        component={motion.div}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          cursor: 'pointer',
                        }}
                        onClick={() => setActiveTab('contact')}
                      >
                        <Typography sx={{ fontWeight: 500 }}>
                          Contact our support team directly
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </MotionInView>
            )}
          </Grid>
        </Grid>
      </ContentStyle>
    </RootStyle>
  );
}