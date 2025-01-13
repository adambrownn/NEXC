import { motion } from "framer-motion";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  CardMedia,
} from "@material-ui/core";

import { Icon } from "@iconify/react";
import phoneCallFill from "@iconify/icons-eva/phone-call-fill";
import CSLIntro from "../../../assets/logos/csl-intro.gif";
import { Link as RouterLink } from "react-router-dom";
import { HashLink as HLink } from "react-router-hash-link";
import SendIcon from "@material-ui/icons/Send";
import { CATEGORY_PATH } from "src/routes/paths";

const RootStyle = styled(motion.div)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#000",
  [theme.breakpoints.up("md")]: {
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    display: "flex",
    position: "fixed",
    alignItems: "center",
  },
}));

const ContentStyle = styled((props) => <Stack spacing={5} {...props} />)(
  ({ theme }) => ({
    zIndex: 10,
    maxWidth: 520,
    margin: "auto",
    textAlign: "center",
    position: "relative",
    paddingTop: theme.spacing(15),
    paddingBottom: theme.spacing(15),
    [theme.breakpoints.up("lg")]: {
      margin: "unset",
      textAlign: "left",
    },
  })
);

const HeroOverlayStyle = styled(motion.img)({
  zIndex: 9,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
});

const QualCardStyle = styled(CardMedia)(({ theme }) => {
  return {
    zIndex: 9,
    top: 100,
    width: "100%",
    position: "absolute",
    filter: `drop-shadow(40px 80px 80px rgba(0, 0, 0, 0.48))`,
    [theme.breakpoints.up("lg")]: {
      right: "8%",
      width: "auto",
      height: "48vh",
    },
    "@media (max-width: 1200px)": {
      display: "none",
    },
  };
});

export default function LandingHero(props) {
  return (
    <>
      <RootStyle initial="initial">
        <HeroOverlayStyle alt="" src="/static/overlay.svg" />

        <QualCardStyle>
          <img
            src={CSLIntro}
            style={{
              width: 620,
              height: 620,
              borderRadius: 15,
            }}
            alt=""
          />
        </QualCardStyle>

        <Container maxWidth="lg">
          <ContentStyle>
            <motion.div>
              <Typography variant="h1" sx={{ color: "common.white" }}>
                Book your <br />
                CSCS Card <br />
                <Typography
                  component="span"
                  variant="h1"
                  sx={{ color: "primary.main" }}
                >
                  &nbsp;today!
                </Typography>
              </Typography>
            </motion.div>

            <motion.div>
              <Typography sx={{ color: "common.white" }}>
                {/* The starting point for your next project based on
                easy-to-customize Material-UI © helps you build apps faster and
                better. */}
              </Typography>
            </motion.div>

            <motion.div style={{ marginTop: "-2.5%", marginBottom: "5%" }}>
              <Button
                size="large"
                variant="contained"
                target="_blank"
                href="tel:+44(0)330 912 1773"
                startIcon={<Icon icon={phoneCallFill} />}
                sx={{
                  margin: 3,
                  "@media (min-width: 1200px)": {
                    display: "none",
                  },
                }}
              >
                +44(0)330 912 1773
              </Button>
              <Button
                size="large"
                variant="outlined"
                component={RouterLink}
                to={CATEGORY_PATH.root}
                startIcon={<Typography>View all Trades</Typography>}
                endIcon={<SendIcon />}
              ></Button>
            </motion.div>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              <motion.div>
                <HLink to={"/trades#csl-cards"}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: 50,
                      border: "0px solid",
                      width: "5rem",
                      color: "black",
                      fontSize: "0.9rem",
                      bgcolor: "#FCA700",
                      height: "2.5rem",
                      "&:hover": { bgcolor: "grey", color: "#FCA700" },
                      textDecoration: "none",
                    }}
                  >
                    Cards
                  </Button>
                </HLink>
              </motion.div>
              <motion.div>
                <HLink to={"/trades#csl-tests"}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: 50,
                      border: "1.6px solid",
                      "&:hover": { bgcolor: "#FCA700", color: "black" },
                      width: "5rem",
                      height: "2.5rem",
                      textDecoration: "none",
                    }}
                  >
                    Tests
                  </Button>
                </HLink>
              </motion.div>
              <motion.div>
                <HLink to={"/qualifications"}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: 50,
                      border: "0px solid",
                      width: "5rem",
                      color: "black",
                      fontSize: "0.9rem",
                      bgcolor: "#FCA700",
                      height: "2.5rem",
                      "&:hover": { bgcolor: "grey", color: "#FCA700" },
                      textDecoration: "none",
                    }}
                  >
                    NVQ's
                  </Button>
                </HLink>
              </motion.div>
              <motion.div>
                <HLink to={"/trades#csl-courses"}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: 50,
                      border: "1.6px solid",
                      "&:hover": { bgcolor: "#FCA700", color: "black" },
                      width: "5rem",
                      height: "2.5rem",
                      textDecoration: "none",
                    }}
                  >
                    Courses
                  </Button>
                </HLink>
              </motion.div>
            </Stack>
          </ContentStyle>
        </Container>
      </RootStyle>
      <Box sx={{ height: { md: "100vh" } }} />
    </>
  );
}
