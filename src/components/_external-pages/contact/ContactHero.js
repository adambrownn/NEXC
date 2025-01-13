import { motion } from "framer-motion";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Box, Container, Typography, Grid } from "@material-ui/core";
//
import { varWrapEnter, varFadeInRight, TextAnimate } from "../../animate";

// ----------------------------------------------------------------------

const CONTACTS = [
  {
    country: "London",
    address: "71-75 Shelton Street, Covent garden, London WC2H 9JQ.",
    phoneNumber: "+44(0)330 912 1773",
  },
];

const RootStyle = styled(motion.div)(({ theme }) => ({
  backgroundColor: "#1B2129",
  padding: theme.spacing(10, 0),
  [theme.breakpoints.up("md")]: {
    height: 560,
    padding: 0,
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  [theme.breakpoints.up("md")]: {
    textAlign: "left",
    position: "absolute",
    bottom: theme.spacing(10),
  },
}));

// ----------------------------------------------------------------------

export default function ContactHero() {
  return (
    <RootStyle initial="initial" animate="animate" variants={varWrapEnter}>
      <Container maxWidth="lg" sx={{ position: "relative", height: "100%" }}>
        <ContentStyle>
          <TextAnimate
            text="Where"
            sx={{ color: "primary.main" }}
            variants={varFadeInRight}
          />
          <br />
          <Box sx={{ display: "inline-flex", color: "common.white" }}>
            <TextAnimate text="to" sx={{ mr: 2 }} />
            <TextAnimate text="find" sx={{ mr: 2 }} />
            <TextAnimate text="us?" />
          </Box>

          <Grid container spacing={5} sx={{ mt: 5, color: "common.white" }}>
            {CONTACTS.map((contact) => (
              <Grid
                key={contact.country}
                item
                xs={12}
                sm={6}
                md={3}
                lg={7}
                sx={{ pr: { md: 5 } }}
              >
                <Typography variant="h6" paragraph>
                  {contact.country}
                </Typography>
                <Typography variant="body2">
                  {contact.address}
                  <br /> {contact.phoneNumber}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
