import { Icon } from "@iconify/react";
import facebookFill from "@iconify/icons-eva/facebook-fill";
import linkedinFill from "@iconify/icons-eva/linkedin-fill";
import shieldFill from "@iconify/icons-eva/shield-fill";
import checkmarkCircleFill from "@iconify/icons-eva/checkmark-circle-fill";
import lockFill from "@iconify/icons-eva/lock-fill";
import { Link as ScrollLink } from "react-scroll";
import { HashLink as Link } from "react-router-hash-link";
// material
import { experimentalStyled as styled } from "@mui/material/styles";
import {
  Grid,
  Divider,
  Container,
  Typography,
  IconButton,
  alpha,
  Stack,
  TextField,
  Button,
  Box,
} from "@mui/material";
// routes
import { PATH_PAGE } from "../../routes/paths";
//
import Logo from "../../components/Logo";
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SOCIALS = [
  {
    name: "FaceBook",
    icon: facebookFill,
    link: "https://www.facebook.com/108746878157255/posts/129638336068109/",
  },
  {
    name: "Linkedin",
    icon: linkedinFill,
    link: "https://www.linkedin.com/company/construction-safety-line",
  },
];

const LINKS = [
  {
    headline: "Quick Links",
    children: [
      { name: "About us", href: PATH_PAGE.about },
      { name: "Contact us", href: PATH_PAGE.contact },
      { name: "FAQs", href: PATH_PAGE.faqs },
      { name: "Blogs", href: PATH_PAGE.blog },
    ],
  },
  {
    headline: "Legal",
    children: [
      { name: "Terms and Condition", href: PATH_PAGE.tnc },
      { name: "Privacy Policy", href: PATH_PAGE.privacypolicy },
      { name: "Refund Policy", href: PATH_PAGE.refund },
      { name: "Cancellation Policy", href: PATH_PAGE.cancellation },
      { name: "Rescheduling Policy", href: PATH_PAGE.return },
    ],
  },
  {
    headline: "Contact",
    children: [
      { name: "NEXC", href: "https://nexc.co.uk" },
      { name: "support@nexc.co.uk", href: "mailto: support@nexc.co.uk" },
      {
        name: "71-75 Shelton Street, Covent Garden, London, WC2H 2JQ.",
        href: "",
      },
    ],
  },
];

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(10, 0, 0),
  borderTopLeftRadius: theme.shape.borderRadiusMd,
  borderTopRightRadius: theme.shape.borderRadiusMd,
  boxShadow: `0 -1px 3px ${alpha(theme.palette.grey[500], 0.12)}`,
}));

const FooterSectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2.5),
  color: theme.palette.text.primary,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
      left: '50%',
      transform: 'translateX(-50%)'
    }
  }
}));

// ----------------------------------------------------------------------

export default function MainFooter() {
  const [subscribed, setSubscribed] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Must be a valid email').required('Email is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      // Submit newsletter logic here
      console.log('Newsletter subscription:', values.email);
      setSubscribed(true);
      resetForm();
      setTimeout(() => setSubscribed(false), 3000);
    }
  });

  return (
    <RootStyle>
      <Divider />
      <Container maxWidth="lg" sx={{ pt: 10 }}>
        <Grid
          container
          justifyContent={{ xs: "center", md: "space-between" }}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Grid item xs={12} sx={{ mb: 3 }}>
            <ScrollLink to="move_top" spy smooth aria-label="Return to top of page">
              <Logo sx={{ mx: { xs: "auto", md: "inherit" } }} />
            </ScrollLink>
          </Grid>
          <Grid item xs={8} md={3}>
            <Typography variant="body2" sx={{ pr: { md: 5 } }}>
              NEXC offers services for UK construction
              sector. We value each and every individual looking for our help
              related to CSCS Cards, Health and Safety Courses and HS&E Test.
            </Typography>

            <Stack
              spacing={1.5}
              direction="row"
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{ mt: 5, mb: { xs: 5, md: 0 } }}
            >
              {SOCIALS.map((social) => (
                <IconButton
                  key={social.name}
                  color="primary"
                  sx={{
                    p: 1,
                    transition: 'transform 0.2s, background-color 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      backgroundColor: 'rgba(32, 101, 209, 0.08)'
                    }
                  }}
                  aria-label={`Follow us on ${social.name}`}
                >
                  <a href={social.link} target="_blank" rel="noreferrer">
                    <Icon icon={social.icon} width={25} height={25} />
                  </a>
                </IconButton>
              ))}
            </Stack>

            <Stack
              spacing={1.5}
              direction="row"
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{ mt: 5, mb: { xs: 5, md: 0 } }}
            >
              <Typography variant="caption" sx={{ mr: 1, alignSelf: 'center', color: 'text.secondary' }}>
                Secure payments:
              </Typography>
              {[
                { logo: "logos:visa", fontSize: 14 },
                { logo: "logos:mastercard", fontSize: 24 },
                { logo: "logos:jcb", fontSize: 26 },
                { logo: "cib:cc-diners-club", fontSize: 30 },
              ]?.map((icon) => (
                <Icon
                  key={icon.logo}
                  sx={{ p: 1 }}
                  style={{
                    marginInline: 4,
                    fontSize: icon.fontSize,
                    color: "#4E238E",
                  }}
                  icon={icon.logo}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
            >
              {LINKS.map((list) => {
                const { headline, children } = list;
                return (
                  <Stack key={headline} spacing={2} style={{ marginBlock: 10 }}>
                    <Typography component="p" variant="overline">
                      {headline}
                    </Typography>
                    {children.map((link) => (
                      <Link
                        to={link.href}
                        key={link.name}
                        variant="body2"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                          color: "grey",
                          fontSize: "0.85em",
                          transition: "transform 0.2s ease, color 0.2s ease",
                          marginBottom: 6,
                        }}
                        sx={{
                          '&:hover': {
                            color: 'primary.main',
                            transform: 'translateX(5px)',
                          },
                          '&::before': {
                            content: '""',
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: 'text.disabled',
                            display: 'inline-block',
                            marginRight: 1.5,
                            transition: 'background-color 0.2s ease',
                          },
                          '&:hover::before': {
                            backgroundColor: 'primary.main',
                          }
                        }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </Stack>
                );
              })}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4} sx={{ mt: { xs: 5, md: 0 } }}>
            <FooterSectionTitle variant="overline">
              Stay Updated
            </FooterSectionTitle>

            <Typography variant="body2" sx={{ mb: 3 }}>
              Subscribe to our newsletter for the latest updates on construction certification requirements.
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  name="email"
                  placeholder="Your email"
                  size="small"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    sx: { bgcolor: 'background.paper', borderRadius: 1 }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color={subscribed ? "success" : "primary"}
                  sx={{
                    px: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme => theme.customShadows.z8
                    }
                  }}
                >
                  {subscribed ? "Thanks!" : "Subscribe"}
                </Button>
              </Stack>
            </form>

            <Stack direction="row" sx={{ mt: 4 }}>
              <Box sx={{ mr: 2.5, display: 'flex', alignItems: 'flex-start' }}>
                <Icon icon="eva:pin-fill" width={20} height={20} style={{ color: 'text.secondary', marginTop: 1, marginRight: 12 }} />
                <Typography component="div" variant="body2">
                  Barampur, UP, 246731<br />United Kingdom
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 6,
            mb: 4,
            pt: 3,
            borderTop: theme => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-start' },
            gap: 3
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 1,
              py: 1,
              px: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Icon icon={lockFill} width={24} height={24} style={{ color: '#2065D1', marginRight: 8 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              SSL Secure
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 1,
              py: 1,
              px: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Icon icon={checkmarkCircleFill} width={24} height={24} style={{ color: '#00AB55', marginRight: 8 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              UKCA Compliant
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 1,
              py: 1,
              px: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Icon icon={shieldFill} width={24} height={24} style={{ color: '#7635dc', marginRight: 8 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              GDPR Compliant
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            pt: 4,
            pb: 4,
            borderTop: theme => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          }}
        >
          <Container>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    color: 'text.secondary',
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  <Box component="span" sx={{ display: 'inline-block' }} itemScope itemType="http://schema.org/Organization">
                    <span itemProp="name">NEXC</span> clearly states that we are not part
                    of, or associated with CSCS or CITB. If you need any information on
                    CSCS please <a href="https://www.cscs.uk.com/" target="_blank" rel="noopener noreferrer">click here</a>.
                    <br />© <span itemProp="copyrightYear">2025</span>. All rights reserved{" "}
                    <a href="https://nexc.co.uk" itemProp="url">
                      NEXC
                    </a>
                    <meta itemProp="telephone" content="+919971714172" />
                    <meta itemProp="email" content="support@nexc.co.uk" />
                    <Box component="span" sx={{ display: 'inline-block' }} itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
                      <meta itemProp="streetAddress" content="Barampur" />
                      <meta itemProp="addressRegion" content="UP" />
                      <meta itemProp="postalCode" content="246731" />
                      <meta itemProp="addressCountry" content="United Kingdom" />
                    </Box>
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Designed & developed by <Link to="/" sx={{ color: 'primary.main' }}>NEXC Team</Link>
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>
    </RootStyle>
  );
}
