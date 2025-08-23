// material
import { Box, Container, Typography, Grid } from "@mui/material";

export default function AboutVision() {
  return (
    <Container maxWidth="lg" sx={{ mt: 10 }}>
      <Box
        sx={{
          mb: 10,
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <img src="/static/about/vision.jpg" alt="about-vision" />

        <Box
          sx={{
            bottom: { xs: 24, md: 80 },
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            position: "absolute",
            justifyContent: "center",
          }}
        >
          {[
            "logo_amazon",
            "logo_hbo",
            "logo_ibm",
            "logo_lya",
            "logo_spotify",
            "logo_netflix",
          ].map((logo, idx) => (
            <Box
              key={idx}
              component="img"
              src={`/static/about/${logo}.svg`}
              sx={{ m: { xs: 1.5, md: 5 }, height: { xs: 24, md: 40 } }}
            />
          ))}
        </Box>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8}>
          <Typography variant="h3" sx={{ textAlign: "center" }}>
            Our Vision is dedicated to make UK construction sites a safe
            workplace for everyone. Uk construction sector has lot to offer to
            its existing workers and to those who are willing to secure a good
            future ahead of them.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
