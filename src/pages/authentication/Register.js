import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from 'framer-motion';
// material
import { experimentalStyled as styled } from "@mui/material/styles";
import { Box, Card, Link, Container, Typography, alpha, Stack, Button, Divider } from "@mui/material";
import { Icon } from '@iconify/react';
// hooks
import { PATH_AUTH } from "../../routes/paths";
// layouts
import AuthLayout from "../../layouts/AuthLayout";
// components
import Page from "../../components/Page";
import { MHidden } from "../../components/@material-extend";
import { RegisterForm, PhoneRegisterForm } from "../../components/authentication/register";
// import AuthGoogleSocials from "../../components/authentication/AuthGoogleSocial";
import AuthService from "../../services/auth.service";
import AuthIllustration from '../../components/authentication/AuthIllustration';

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
  backgroundImage: 'linear-gradient(135deg, rgba(66, 165, 245, 0.04) 0%, rgba(21, 101, 192, 0.04) 100%)',
  backgroundSize: 'cover',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("/static/auth-pattern.svg")',
    backgroundSize: '800px',
    opacity: 0.05,
    pointerEvents: 'none'
  }
}));

// Update the SectionStyle to match our design system
const SectionStyle = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 464,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  margin: theme.spacing(2, 0, 2, 2),
  borderRadius: theme.shape.borderRadiusMd,
  boxShadow: theme.customShadows.z16,
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.primary.lighter, 0.1),
    top: '-100px',
    right: '-100px',
    zIndex: 0
  }
}));

// Improved ContentStyle
const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(12, 0),
  position: 'relative',
  '& > *': {
    position: 'relative',
    zIndex: 1
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '15%',
    left: '-5%',
    width: '35%',
    height: '35%',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.primary.lighter, 0.06),
    zIndex: 0
  }
}));

export default function Register(props) {
  // const method = "google";

  const [registrationMethod, setRegistrationMethod] = useState("email");

  React.useEffect(() => {
    (async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        window.location.replace(`/dashboard`);
      }
    })();
  }, [props]);

  return (
    <RootStyle title="Register | NEXC">
      <AuthLayout>
        Already have an account? &nbsp;
        <Link
          underline="none"
          variant="subtitle2"
          component={RouterLink}
          to={PATH_AUTH.login}
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            transition: 'color 0.2s',
            '&:hover': {
              color: 'primary.dark'
            }
          }}
        >
          Login
        </Link>
      </AuthLayout>

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Simplify construction certification with NEXC
          </Typography>
          <AuthIllustration type="login" />
        </SectionStyle>
      </MHidden>

      <Container>
        <ContentStyle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{
              mb: 3, // Reduced from mb: 5
              display: "flex",
              alignItems: "center",
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-12px',
                left: '0',
                width: '40px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'primary.main',
              }
            }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Get started with NEXC
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Create your account to access UK construction certification services.
                </Typography>
              </Box>
            </Box>

            {/* {method === "google" && <AuthGoogleSocials />} */}

            <Box sx={{ mb: 4, mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Choose how you want to register:
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1,
                    color: 'text.primary',
                    borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
                      borderColor: 'primary.main',
                      boxShadow: (theme) => theme.customShadows.z8,
                    },
                    '&.Mui-selected': {
                      borderColor: 'primary.main',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                    transition: (theme) => theme.transitions.create([
                      'border-color',
                      'background-color',
                      'box-shadow'
                    ]),
                    ...(registrationMethod === "email" && {
                      borderColor: 'primary.main',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    })
                  }}
                  startIcon={<Icon icon="eva:email-outline" width={22} height={22} />}
                  onClick={() => setRegistrationMethod("email")}
                >
                  Email
                </Button>

                {/* Updated Phone button - now active */}
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1,
                    color: 'text.primary',
                    borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
                      borderColor: 'primary.main',
                      boxShadow: (theme) => theme.customShadows.z8,
                    },
                    '&.Mui-selected': {
                      borderColor: 'primary.main',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                    transition: (theme) => theme.transitions.create([
                      'border-color',
                      'background-color',
                      'box-shadow'
                    ]),
                    ...(registrationMethod === "phone" && {
                      borderColor: 'primary.main',
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    })
                  }}
                  startIcon={<Icon icon="eva:phone-outline" width={22} height={22} />}
                  onClick={() => setRegistrationMethod("phone")}
                >
                  Phone
                </Button>
              </Stack>

              <Divider>
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                  Enter your details below
                </Typography>
              </Divider>
            </Box>

            <Box
              sx={{
                py: 1.5,
                px: 2,
                mb: 3,
                borderRadius: 1,
                backgroundColor: (theme) => alpha(theme.palette.info.light, 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Icon icon="eva:info-fill" width={20} height={20} style={{ color: '#0288d1', marginRight: 8 }} />
              <Typography variant="body2" sx={{ color: 'info.dark' }}>
                Your account will give you access to CSCS card applications, health & safety courses, and test booking services.
              </Typography>
            </Box>

            {/* Add this condition before rendering the form: */}
            {registrationMethod === "email" ? (
              <RegisterForm />
            ) : (
              <PhoneRegisterForm />  // You'll need to create this component
            )}

            <Typography
              variant="body2"
              align="center"
              sx={{
                color: "text.secondary",
                mt: 3,
                px: 2,
                py: 1.5,
                borderRadius: 1,
                backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
              }}
            >
              By registering, I agree to NEXC&nbsp;
              <Link
                underline="always"
                sx={{
                  color: "primary.main",
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.dark'
                  }
                }}
                component={RouterLink}
                to="/terms-of-service"
              >
                Terms of Service
              </Link>
              &nbsp;and&nbsp;
              <Link
                underline="always"
                sx={{
                  color: "primary.main",
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.dark'
                  }
                }}
                component={RouterLink}
                to="/privacy-policy"
              >
                Privacy Policy
              </Link>
              .
            </Typography>

            <MHidden width="smUp">
              <Typography variant="subtitle2" sx={{ mt: 3, textAlign: "center" }}>
                Already have an account?&nbsp;
                <Link to={PATH_AUTH.login} component={RouterLink}>
                  Login
                </Link>
              </Typography>
            </MHidden>
          </motion.div>
          {/* Add construction-themed accents */}
          <Box
            sx={{
              position: 'absolute',
              right: { xs: '-50px', md: '0' },
              bottom: '10%',
              width: '150px',
              height: '150px',
              opacity: 0.08,
              zIndex: 0,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon
              icon="mdi:hard-hat"
              style={{ fontSize: 120, color: '#637381' }}
            />
          </Box>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
