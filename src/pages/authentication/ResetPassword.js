import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// material
import { experimentalStyled as styled } from "@mui/material/styles";
import { Button, Container, Typography, Paper, Icon } from "@mui/material";
// layouts
import LogoOnlyLayout from "../../layouts/LogoOnlyLayout";
// routes
import { PATH_AUTH } from "../../routes/paths";
// components
import Page from "../../components/Page";
import ResetPasswordOTPForm from "../../components/authentication/reset-password/ResetPasswordOTPForm";
import { motion } from 'framer-motion';
//
import { SentIcon } from "../../assets";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: "flex",
  minHeight: "100%",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(12, 0),
  backgroundImage: 'linear-gradient(135deg, rgba(66, 165, 245, 0.05) 0%, rgba(21, 101, 192, 0.05) 100%)',
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  borderRadius: theme.shape.borderRadiusMd,
  boxShadow: theme.customShadows.z16,
  maxWidth: 480,
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

// ----------------------------------------------------------------------

export default function ResetPassword() {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setSuccess(true);
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate(PATH_AUTH.login);
    }, 3000);
  };

  return (
    <RootStyle title="Reset Password | NEXC">
      <LogoOnlyLayout />

      <Container>
        <ContentPaper>
          {!success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 1 }}>
                Reset your password
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 4 }}>
                We'll send you a verification code to reset your password securely.
              </Typography>

              <ResetPasswordOTPForm onSuccess={handleSuccess} />

              <BackButton
                fullWidth
                size="large"
                component={RouterLink}
                to={PATH_AUTH.login}
                sx={{ mt: 3 }}
                startIcon={<Icon icon="eva:arrow-back-fill" width={20} height={20} />}
              >
                Back to Login
              </BackButton>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              sx={{ textAlign: "center" }}
            >
              <SentIcon sx={{ mb: 5, mx: "auto", height: 160, width: 'auto' }} />

              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
                Password Reset Successful! 🎉
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 4 }}>
                Your password has been successfully reset.
                <br />
                You can now login with your new password.
                <br />
                <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem', mt: 2, display: 'block' }}>
                  Redirecting to login page in 3 seconds...
                </Typography>
              </Typography>

              <Button
                size="large"
                variant="contained"
                component={RouterLink}
                to={PATH_AUTH.login}
                sx={{
                  mt: 3,
                  px: 4,
                  borderRadius: (theme) => theme.shape.borderRadiusMd,
                  boxShadow: (theme) => theme.customShadows.z8,
                  '&:hover': {
                    boxShadow: (theme) => theme.customShadows.z16,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Go to Login Now
              </Button>
            </motion.div>
          )}
        </ContentPaper>
      </Container>
    </RootStyle>
  );
}
