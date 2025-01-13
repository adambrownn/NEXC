import { Icon } from "@iconify/react";
import facebookFill from "@iconify/icons-eva/facebook-fill";
import linkedinFill from "@iconify/icons-eva/linkedin-fill";
import { Link as ScrollLink } from "react-scroll";
import { HashLink as Link } from "react-router-hash-link";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import {
  Grid,
  Divider,
  Container,
  Typography,
  IconButton,
  Stack,
} from "@material-ui/core";
// routes
import { PATH_PAGE } from "../../routes/paths";
//
import Logo from "../../components/Logo";

const SOCIALS = [
  {
    name: "FaceBook",
    icon: facebookFill,
    link: "https://www.facebook.com/108746878157255/posts/129638336068109/",
  },
  {
    name: "Linkedin",
    icon: linkedinFill,
    link: "https://www.linkedin.com/company/construction-safety-line",
  },
];

const LINKS = [
  {
    headline: "Quick Links",
    children: [
      { name: "About us", href: PATH_PAGE.about },
      { name: "Contact us", href: PATH_PAGE.contact },
      { name: "FAQs", href: PATH_PAGE.faqs },
    ],
  },
  {
    headline: "Legal",
    children: [
      { name: "Terms and Condition", href: PATH_PAGE.tnc },
      { name: "Privacy Policy", href: PATH_PAGE.privacypolicy },
      { name: "Refund Policy", href: PATH_PAGE.refund },
      { name: "Cancellation Policy", href: PATH_PAGE.cancellation },
      { name: "Rescheduling Policy", href: PATH_PAGE.return },
    ],
  },
  {
    headline: "Contact",
    children: [
      { name: "support@constructionsafetyline.co.uk", href: "" },
      { name: "", href: "" },
      {
        name: "71 - 75 Shelton Street Covent Garden ",
        href: "",
      },
      {
        name: "London WC2H 9JQ UNITED KINGDOM",
        href: "",
      },
    ],
  },
];

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

export default function MainFooter() {
  return (
    <RootStyle>
      <Divider />
      <Container maxWidth="lg" sx={{ pt: 10 }}>
        <Grid
          container
          justifyContent={{ xs: "center", md: "space-between" }}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Grid item xs={12} sx={{ mb: 3 }}>
            <ScrollLink to="move_top" spy smooth>
              <Logo sx={{ mx: { xs: "auto", md: "inherit" } }} />
            </ScrollLink>
          </Grid>
          <Grid item xs={8} md={3}>
            <Typography variant="body2" sx={{ pr: { md: 5 } }}>
              Construction Safety Line offers services for UK construction
              sector. We value each and every individual looking for our help
              related to CSCS Cards, Health and Safety Courses and HS&E Test.
            </Typography>

            <Stack
              spacing={1.5}
              direction="row"
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{ mt: 5, mb: { xs: 5, md: 0 } }}
            >
              {SOCIALS.map((social) => (
                <IconButton key={social.name} color="primary" sx={{ p: 1 }}>
                  <a href={social.link} target="_blank" rel="noreferrer">
                    <Icon icon={social.icon} width={25} height={25} />
                  </a>
                </IconButton>
              ))}
            </Stack>

            <Stack
              spacing={1.5}
              direction="row"
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{ mt: 5, mb: { xs: 5, md: 0 } }}
            >
              {[
                { logo: "logos:visa", fontSize: 14 },
                { logo: "logos:mastercard", fontSize: 24 },
                { logo: "logos:jcb", fontSize: 26 },
                { logo: "cib:cc-diners-club", fontSize: 30 },
              ]?.map((icon) => (
                <Icon
                  key={icon.logo}
                  sx={{ p: 1 }}
                  style={{
                    marginInline: 4,
                    fontSize: icon.fontSize,
                    color: "#4E238E",
                  }}
                  icon={icon.logo}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
            >
              {LINKS.map((list) => {
                const { headline, children } = list;
                return (
                  <Stack key={headline} spacing={2} style={{ marginBlock: 10 }}>
                    <Typography component="p" variant="overline">
                      {headline}
                    </Typography>
                    {children.map((link) => (
                      <Link
                        to={link.href}
                        key={link.name}
                        variant="body2"
                        style={{
                          display: "block",
                          textDecoration: "none",
                          color: "grey",
                          fontSize: "0.8em",
                        }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </Stack>
                );
              })}
            </Stack>
          </Grid>
        </Grid>

        <Typography
          component="p"
          variant="body2"
          sx={{
            mt: 10,
            pb: 5,
            fontSize: 13,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Construction Safety Line Limited clearly states that we are not part
          of, or associated with CSCS or CITB. If you need any information on
          CSCS please <a href="https://www.cscs.uk.com/">click here</a>.
          <br></br>© 2021. All rights reserved{" "}
          <a href="https://constructionsafetyline.co.uk">
            Construction Safety Line
          </a>
        </Typography>
      </Container>
    </RootStyle>
  );
}
