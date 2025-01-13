import { Container, Typography } from "@material-ui/core";

export default function AboutTeam() {
  return (
    <Container maxWidth="lg" sx={{ pb: 10, textAlign: "center" }}>
      <Typography
        component="p"
        variant="overline"
        sx={{ mb: 2, color: "text.secondary" }}
      ></Typography>

      <Typography variant="h2" sx={{ mb: 3 }}>
        Reliable services
      </Typography>

      <Typography
        sx={{
          mb: 10,
          mx: "auto",
          maxWidth: 630,
          color: (theme) =>
            theme.palette.mode === "light" ? "text.secondary" : "common.white",
        }}
      >
        Construction safety line will provide you support with every services we
        offer and with products you are interested in. We reply within a day and
        we also have proper documentations.
      </Typography>
    </Container>
  );
}
