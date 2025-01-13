// material
import { Stack, Button, Divider, Typography } from "@material-ui/core";
import { Icon } from "@iconify/react";
import googleFill from "@iconify/icons-eva/google-fill";
import GoogleLogin from "react-google-login";

import axiosInstance from "../../axiosConfig";

export default function AuthGoogleSocials() {
  const responseGoogle = async (googleRes) => {
    if (googleRes && googleRes?.profileObj) {
      let loginType = "google";
      let email = googleRes.profileObj.email;
      let socialIdentityToken = googleRes.tokenObj.id_token;
      let googleAccessToken = googleRes.accessToken;

      await axiosInstance.post("/auth/login", {
        loginType,
        email,
        socialIdentityToken,
        googleAccessToken,
      });
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <GoogleLogin
          clientId="GOOGLE_CLIENT_ID"
          render={(renderProps) => (
            <Button
              disableElevation
              fullWidth={true}
              onClick={renderProps.onClick}
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                border: "1px solid",
                textTransform: "none",
              }}
              // disabled={renderProps.disabled}
              disabled
              size="large"
              variant="contained"
            >
              <Icon
                icon={googleFill}
                color="#DF3E30"
                height={24}
                width={20}
                style={{
                  marginInline: 16,
                }}
              />
              {/* <img
                src={Google}
                alt="google"
                width="20px"
                className={classes.loginIcon}
              />{" "} */}
              Continue with Google
            </Button>
          )}
          buttonText="Login"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
      </Stack>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          OR
        </Typography>
      </Divider>
    </>
  );
}
