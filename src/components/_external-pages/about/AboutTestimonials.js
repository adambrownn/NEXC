import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import roundArrowRightAlt from "@iconify/icons-ic/round-arrow-right-alt";
// material
import {
  alpha,
  useTheme,
  experimentalStyled as styled,
} from "@material-ui/core/styles";
import {
  Box,
  Grid,
  Link,
  Paper,
  Rating,
  Container,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
//
import { MHidden } from "../../@material-extend";

// ----------------------------------------------------------------------

const TESTIMONIALS = [
  {
    name: "John Thurston",
    rating: 5,
    // dateCreate: "April 19, 2021",
    content: `Excellent Work! Thanks a lot!`,
  },
  {
    name: "Joris Ruitenbeek",
    rating: 5,
    // dateCreate: "April 19, 2021",
    content: `Got a few questions after purchasing the product. The owner responded very fast and very helpfull. Overall the service is excellent. 5/5 stars!`,
  },
];

const RootStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(10, 0),
  backgroundColor: "#1B2129",
  [theme.breakpoints.up("md")]: {
    textAlign: "left",
    padding: 0,
    height: 840,
    overflow: "hidden",
  },
}));

// ----------------------------------------------------------------------

TestimonialCard.propTypes = {
  testimonial: PropTypes.object,
};

function TestimonialLink() {
  return (
    <Link
      href="/trades"
      variant="subtitle2"
      sx={{ display: "flex", alignItems: "center" }}
    >
      check out our services
      <Box
        component={Icon}
        icon={roundArrowRightAlt}
        sx={{ ml: 1, width: 20, height: 20 }}
      />
    </Link>
  );
}

function TestimonialCard({ testimonial }) {
  const { name, rating, dateCreate, content } = testimonial;
  return (
    <Paper
      sx={{
        mt: 3,
        p: 3,
        color: "common.white",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)", // Fix on Mobile
        bgcolor: (theme) => alpha(theme.palette.common.white, 0.04),
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        {name}
      </Typography>
      <Typography
        gutterBottom
        component="p"
        variant="caption"
        sx={{ color: "grey.500" }}
      >
        {dateCreate}
      </Typography>
      <Rating value={rating} readOnly size="small" />
      <Typography variant="body2" sx={{ mt: 1.5 }}>
        {content}
      </Typography>
    </Paper>
  );
}

export default function AboutTestimonials() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <RootStyle>
      <Container maxWidth="lg" sx={{ position: "relative", height: "100%" }}>
        <Grid
          container
          spacing={3}
          alignItems="center"
          justifyContent={{ xs: "center", md: "space-between" }}
          sx={{ height: "100%" }}
        >
          <Grid item xs={10} md={4}>
            <Box sx={{ maxWidth: { md: 360 } }}>
              <Typography
                component="p"
                variant="overline"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Testimonials
              </Typography>

              <Typography variant="h2" sx={{ mb: 3, color: "common.white" }}>
                Happy customers <br />
                make all the difference!!
              </Typography>

              <Typography sx={{ color: "common.white" }}>
                Our goal is to provide service that you’re satisfied with and
                recommends to others in need. This is why we’re constantly
                working on our services to make them better every day and really
                listen to what our customers have to say.
              </Typography>

              <MHidden width="mdUp">
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <TestimonialLink />
                </Box>
              </MHidden>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={7}
            lg={6}
            sx={{
              right: { md: 24 },
              position: { md: "absolute" },
            }}
          >
            <Grid container spacing={isDesktop ? 3 : 0} alignItems="center">
              <Grid item xs={12} md={6}>
                {TESTIMONIALS.slice(0, 3).map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.name}
                    testimonial={testimonial}
                  />
                ))}
              </Grid>

              <Grid item xs={12} md={6}>
                {TESTIMONIALS.slice(3, 6).map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.name}
                    testimonial={testimonial}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <MHidden width="mdDown">
          <Box sx={{ bottom: 60, position: "absolute" }}>
            <TestimonialLink />
          </Box>
        </MHidden>
      </Container>
    </RootStyle>
  );
}
