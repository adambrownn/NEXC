import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import roundArrowRightAlt from "@iconify/icons-ic/round-arrow-right-alt";
// material
import {
  alpha,
  experimentalStyled as styled,
} from "@mui/material/styles";
import {
  Box,
  Grid,
  Link,
  Rating,
  Avatar,
  Container,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
//
import { MHidden } from "../../@material-extend";
import { motion } from "framer-motion";

// ----------------------------------------------------------------------

// Enhanced testimonials with more data and better structure
const TESTIMONIALS = [
  {
    id: '1',
    name: "John Thurston",
    role: "CSCS Green Card Holder",
    avatar: "/static/testimonials/avatar_1.jpg",
    rating: 5,
    date: "Jan 12, 2025",
    content: `Excellent service from start to finish! NEXC helped me get my CSCS card quickly with minimal hassle. The test center they recommended was convenient and the staff were professional.`,
  },
  {
    id: '2',
    name: "Joris Ruitenbeek",
    role: "Construction Manager",
    avatar: "/static/testimonials/avatar_2.jpg",
    rating: 5,
    date: "Mar 3, 2025",
    content: `Got a few questions after booking my test. The support team responded very fast and were incredibly helpful. The test center was modern and well-equipped. Overall the service is excellent. 5/5 stars!`,
  },
  {
    id: '3',
    name: "Sarah Mitchell",
    role: "Site Supervisor",
    avatar: "/static/testimonials/avatar_3.jpg",
    rating: 5,
    date: "Mar 18, 2025",
    content: `I needed to get my team certified quickly and NEXC made the process smooth and efficient. The online booking system was easy to use and the follow-up was impressive.`,
  },
  {
    id: '4',
    name: "David Thompson",
    role: "Electrician",
    avatar: "/static/testimonials/avatar_4.jpg",
    rating: 4,
    date: "March 22, 2025",
    content: `As someone new to the construction industry, I was worried about the CSCS test process. NEXC guided me through every step and I passed first time. Very grateful for their support.`,
  },
];

// Enhanced styling for a more modern look
const RootStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(10, 0),
  backgroundColor: "#1B2129", // Dark background retained
  backgroundImage: `linear-gradient(to bottom, #1B2129, #252E39)`, // Subtle gradient
  [theme.breakpoints.up("md")]: {
    textAlign: "left",
    padding: theme.spacing(15, 0),
    minHeight: 720,
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
}));

// Enhanced card styling
const TestimonialCardStyle = styled(Card)(({ theme }) => ({
  height: '100%',
  marginTop: theme.spacing(3),
  padding: 0,
  color: theme.palette.common.white,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderRadius: theme.shape.borderRadiusMd,
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.2)}`,
    backgroundColor: alpha(theme.palette.common.white, 0.08),
  }
}));

// ----------------------------------------------------------------------

TestimonialCard.propTypes = {
  testimonial: PropTypes.object,
  index: PropTypes.number,
};

function TestimonialLink() {
  return (
    <Link
      href="/trades"
      variant="subtitle2"
      sx={{
        display: "flex",
        alignItems: "center",
        color: "primary.main",
        transition: 'all 0.2s',
        '&:hover': {
          color: 'primary.light',
        }
      }}
    >
      Check out our services
      <Box
        component={Icon}
        icon={roundArrowRightAlt}
        sx={{ ml: 1, width: 20, height: 20 }}
      />
    </Link>
  );
}

// Enhanced testimonial card with animation and better layout
function TestimonialCard({ testimonial, index }) {
  const { name, role, rating, date, content, avatar } = testimonial;

  // Staggered animation for cards
  const animationDelay = index * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
    >
      <TestimonialCardStyle>
        <CardContent sx={{ p: 3 }}>
          {/* Card header with avatar and info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={avatar}
              alt={name}
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {name}
              </Typography>
              {role && (
                <Typography variant="caption" sx={{ color: 'grey.400' }}>
                  {role}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Rating and date */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
            <Rating value={rating} readOnly size="small" />
            {date && (
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                {date}
              </Typography>
            )}
          </Box>

          {/* Content */}
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: alpha('#fff', 0.87),
              fontStyle: 'italic',
              // '&::before': {
              //   content: '"""',
              //   fontSize: '1.5rem',
              //   lineHeight: 1,
              //   color: 'primary.main',
              //   mr: 0.5
              // },
              // '&::after': {
              //   content: '"""',
              //   fontSize: '1.5rem',
              //   lineHeight: 1,
              //   color: 'primary.main',
              //   ml: 0.5
              // }
            }}
          >
            {content}
          </Typography>
        </CardContent>
      </TestimonialCardStyle>
    </motion.div>
  );
}

export default function AboutTestimonials() {
  // const theme = useTheme();
  // // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <RootStyle>
      {/* Decorative elements */}
      <Box
        component="img"
        src="/static/illustrations/pattern-1.svg"
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          opacity: 0.05,
          maxWidth: '50%',
          display: { xs: 'none', md: 'block' }
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid
          container
          spacing={5}
          alignItems="center"
          justifyContent={{ xs: "center", md: "space-between" }}
        >
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ maxWidth: { md: 420 } }}>
                <Typography
                  component="p"
                  variant="overline"
                  sx={{ mb: 2, color: 'primary.main' }}
                >
                  Client Testimonials
                </Typography>

                <Typography variant="h2" sx={{ mb: 3, color: "common.white" }}>
                  What Our Customers Say About Us
                </Typography>

                <Typography sx={{ color: alpha('#fff', 0.87), mb: 4 }}>
                  Our goal is to provide service that you're satisfied with and
                  would recommend to others in need. We're constantly
                  improving our services and truly value what our customers have to say.
                </Typography>

                <MHidden width="mdUp">
                  <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                    <TestimonialLink />
                  </Box>
                </MHidden>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative' }}>
              <Grid container spacing={3}>
                {TESTIMONIALS.map((testimonial, index) => (
                  <Grid key={testimonial.id} item xs={12} sm={6}>
                    <TestimonialCard
                      testimonial={testimonial}
                      index={index}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <MHidden width="mdDown">
          <Box sx={{ mt: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <TestimonialLink />
            </motion.div>
          </Box>
        </MHidden>
      </Container>
    </RootStyle>
  );
}
