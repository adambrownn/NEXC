// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Box, Grid, Container, Typography } from "@material-ui/core";
//
import { MotionInView, varFadeInUp, varFadeInDown } from "../../animate";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  padding: theme.spacing(28, 0),
  backgroundColor: theme.palette.grey[900],
}));

const ContentStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  position: "relative",
  marginBottom: theme.spacing(10),
  [theme.breakpoints.up("md")]: {
    height: "100%",
    marginBottom: 0,
    textAlign: "left",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
}));

// ----------------------------------------------------------------------

export default function LandingDarkMode() {
  return (
    <RootStyle>
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Box
          component="img"
          alt="image shape"
          src="/static/home/shape.svg"
          sx={{
            top: 0,
            right: 0,
            bottom: 0,
            my: "auto",
            position: "absolute",
            filter: "grayscale(1) opacity(48%)",
            display: { xs: "none", md: "block" },
          }}
        />

        <Grid
          container
          spacing={5}
          direction="row-reverse"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={4}>
            <ContentStyle>
              <Typography
                component="p"
                variant="overline"
                sx={{ mb: 2, color: "text.disabled", display: "block" }}
              >
                Partner card schemes
              </Typography>

              <Typography variant="h2" sx={{ mb: 3, color: "common.white" }}>
                We offer cards from affliated partners of CSCS.
              </Typography>

              <Typography sx={{ color: "common.white", mb: 5 }}>
                Partner card schemes are allowed to use CSCS Logo and they issue
                cards for specific construction sector.
              </Typography>
            </ContentStyle>
          </Grid>

          <Grid item xs={12} md={6} sx={{ position: "relative" }}>
            <MotionInView
              threshold={0.5}
              variants={varFadeInDown}
              sx={{ top: 0, left: 0, position: "absolute" }}
            >
              <img
                alt="dark mode"
                src="/static/images/cscs/6.png"
                style={{
                  magin: "auto 5%",
                  position: "relative",
                  left: "30%",
                  transform: "skew(0deg)",
                  borderRadius: "11px",
                }}
              />
            </MotionInView>
            <MotionInView threshold={0.5} variants={varFadeInUp}>
              <img
                alt="light mode"
                src="/static/images/cscscard3.jpeg"
                style={{
                  transform: "skew(0deg)",
                  borderRadius: "11px",
                }}
              />
            </MotionInView>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}
