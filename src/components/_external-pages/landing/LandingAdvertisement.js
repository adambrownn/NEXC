// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Box, Container } from "@material-ui/core";
//
import { ContactForm } from "../contact";

// ----------------------------------------------------------------------

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 500,
  margin: "auto 10%",
  marginBlock: 55,
  overflow: "hidden",
  paddingBottom: theme.spacing(10),
  borderRadius: theme.shape.borderRadiusMd,
  // backgroundImage: `linear-gradient(180deg,
  //   ${theme.palette.primary.main} 0%,
  //   ${theme.palette.primary.dark} 100%)`,
  [theme.breakpoints.up("md")]: {
    display: "flex",
    maxWidth: "100%",
    paddingBottom: 0,
    alignItems: "center",
  },
}));

// ----------------------------------------------------------------------

export default function LandingAdvertisement() {
  return (
    <Container maxWidth="lg">
      <ContentStyle>
        <Box
          component="img"
          alt="rocket"
          src="/static/home/contact.svg"
          sx={{ maxWidth: 460, width: 1 }}
        />

        <Box>
          <ContactForm />
        </Box>
      </ContentStyle>
    </Container>
  );
}
