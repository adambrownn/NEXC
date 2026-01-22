import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from 'framer-motion';
// material
import { experimentalStyled as styled } from "@mui/material/styles";
import {
  Box,
  Card,
  Link,
  Container,
  Typography,
  alpha,
  Icon,
  // Button,
} from "@mui/material";
// routes
import { PATH_AUTH } from "../../routes/paths";
// hooks
import AuthLayout from "../../layouts/AuthLayout";
// components
import Page from "../../components/Page";
import { MHidden } from "../../components/@material-extend";
import { LoginForm } from "../../components/authentication/login";
import AuthService from "../../services/auth.service";
import AuthIllustration from '../../components/authentication/AuthIllustration';
import { Icon as IconifyIcon } from "@iconify/react";

// ----------------------------------------------------------------------

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

export default function Login() {

  React.useEffect(() => {
    (async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        window.location.replace(`/dashboard`);
      }
    })();
  }, []);

  return (
    <RootStyle title="Login | NEXC">
      <AuthLayout>
        Don't have an account? &nbsp;
        <Link
          underline="none"
          variant="subtitle2"
          component={RouterLink}
          to={PATH_AUTH.register}
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            transition: 'color 0.2s',
            '&:hover': {
              color: 'primary.dark'
            }
          }}
        >
          Get started
        </Link>
      </AuthLayout>

      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Welcome to NEXC Construction Services
          </Typography>
          <AuthIllustration type="login" />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{
              mb: 3,
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
                  Sign in to NEXC
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Access your construction certification dashboard.
                </Typography>
              </Box>
            </Box>

            {/* Removed Google OAuth - replaced with info box */}
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
              <Box
                component="span"
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  mr: 2
                }}
              >
                <IconifyIcon icon="mdi:shield-check" width={24} style={{ color: 'currentColor' }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Secure access to your certification management account
              </Typography>
            </Box>

            <LoginForm />

            <MHidden width="smUp">
              <Typography variant="subtitle2" sx={{ mt: 3, textAlign: "center" }}>
                Don't have an account?&nbsp;
                <Link
                  variant="subtitle2"
                  component={RouterLink}
                  to={PATH_AUTH.register}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Get started
                </Link>
              </Typography>
            </MHidden>
          </motion.div>

          {/* Add construction-themed accent */}
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
