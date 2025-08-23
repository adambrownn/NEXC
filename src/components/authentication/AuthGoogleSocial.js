import { Stack, Button, Divider, Typography } from "@mui/material";
import { experimentalStyled as styled } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import googleFill from "@iconify/icons-eva/google-fill";
import axiosInstance from "../../axiosConfig";
import { GoogleLogin } from '@react-oauth/google';

// Enhanced Google Button
const GoogleButton = styled(Button)(({ theme }) => ({
  color: theme.palette.grey[800],
  backgroundColor: theme.palette.common.white,
  borderColor: theme.palette.grey[300],
  boxShadow: '0 2px 6px 0 rgba(0,0,0,0.05)',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
  },
  transition: theme.transitions.create([
    'background-color',
    'box-shadow',
    'transform'
  ], {
    duration: 0.2,
  }),
}));

// Enhanced Divider
const StyledDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.divider,
  width: '100%',
  '&.MuiDivider-root': {
    '&::before, &::after': {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  },
  '& .MuiDivider-wrapper': {
    padding: theme.spacing(0, 2),
  }
}));

export default function AuthGoogleSocials() {
  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse && credentialResponse.credential) {
      let loginType = "google";
      let socialIdentityToken = credentialResponse.credential;

      try {
        await axiosInstance.post("/auth/login", {
          loginType,
          socialIdentityToken,
        });
        // Handle successful login (e.g., redirect to dashboard)
        window.location.replace(`/dashboard`);
      } catch (error) {
        console.error("Google login error:", error);
        // Show error message to user
      }
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.log('Login Failed');
          }}
          render={({ onClick }) => (
            <GoogleButton
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              onClick={onClick}
              startIcon={
                <Icon icon={googleFill} color="#DF3E30" height={24} />
              }
            >
              Continue with Google
            </GoogleButton>
          )}
        />
      </Stack>

      <StyledDivider sx={{ my: 3 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          OR
        </Typography>
      </StyledDivider>
    </>
  );
}