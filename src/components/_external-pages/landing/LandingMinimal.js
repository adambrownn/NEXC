// material
import {
  alpha,
  useTheme,
  experimentalStyled as styled,
} from "@material-ui/core/styles";
import {
  Box,
  Grid,
  Card,
  Container,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
//
import { HashLink as Link } from "react-router-hash-link";

const CARDS = [
  {
    path: "/trades#csl-cards",
    icon: "/static/icons/ic_design.svg",
    title: "CSCS Cards",
    description:
      "Cards plays a crucial role in UK construction Industry. Having a right CSCS Card shows you are qualified and aware about health and safety of construction sites.",
  },
  {
    path: "/trades#csl-tests",
    icon: "/static/icons/ic_code.svg",
    title: "HS&E Test",
    description:
      "Test is an important exam of any construction worker training process, passing a test make sure workers can work securely on sites.",
  },
  {
    path: "/trades#csl-courses",
    icon: "/static/brand/logo_single.svg",
    title: "Courses",
    description:
      "Courses and trainings are major section for construction workers. Courses helps individual with required knowledge to improve their skills and establish safe working conditions.",
  },
  {
    path: "/qualifications",
    icon: "/static/icons/ic_qualification.svg",
    title: "Qualification",
    description:
      "National Vocational Qualification (NVQ's) are lifetime qualification awards which are obtained through trainings or assesments while working on sites.",
  },
];

const shadowIcon = (color) => `drop-shadow(2px 2px 2px ${alpha(color, 0.48)})`;

const RootStyle = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(15),
  [theme.breakpoints.up("md")]: {
    paddingBottom: theme.spacing(15),
  },
}));

const CardStyle = styled(Card)(({ theme }) => {
  const shadowCard = (opacity) =>
    theme.palette.mode === "light"
      ? alpha(theme.palette.grey[500], opacity)
      : alpha(theme.palette.common.black, opacity);

  return {
    maxWidth: 380,
    minHeight: 440,
    margin: "auto",
    textAlign: "center",
    padding: theme.spacing(10, 5, 0),
    boxShadow: `-40px 40px 80px 0 ${shadowCard(0.48)}`,
    [theme.breakpoints.up("md")]: {
      boxShadow: "none",
      backgroundColor:
        theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    "&.cardLeft": {
      [theme.breakpoints.up("md")]: { marginTop: -40 },
    },
    "&.cardCenter": {
      [theme.breakpoints.up("md")]: {
        marginTop: -80,
        backgroundColor: theme.palette.background.paper,
        boxShadow: `-40px 40px 80px 0 ${shadowCard(0.4)}`,
        "&:before": {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          content: "''",
          margin: "auto",
          position: "absolute",
          width: "calc(100% - 40px)",
          height: "calc(100% - 40px)",
          borderRadius: theme.shape.borderRadiusMd,
          backgroundColor: theme.palette.background.paper,
          boxShadow: `-20px 20px 40px 0 ${shadowCard(0.12)}`,
        },
      },
    },
  };
});

const CardIconStyle = styled("img")(({ theme }) => ({
  width: 190,
  height: 140,
  margin: "-3% auto auto auto",
  marginBottom: theme.spacing(1),
  filter: shadowIcon(theme.palette.primary.main),
}));

// ----------------------------------------------------------------------

export default function LandingMinimalHelps() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <RootStyle>
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 10, md: 25 } }}>
          <Typography
            component="p"
            variant="overline"
            sx={{ mb: 2, color: "text.secondary", textAlign: "center" }}
          >
            Construction Safety line
          </Typography>

          <Typography variant="h2" sx={{ textAlign: "center" }}>
            Choose your products
          </Typography>
        </Box>

        <Grid container spacing={isDesktop ? 10 : 5}>
          {CARDS.map((card, index) => (
            <Grid
              key={card.title}
              item
              xs={12}
              md={6}
              style={{ margin: "3% auto" }}
            >
              <Link to={card.path} style={{ textDecoration: "none" }}>
                <CardStyle className={"cardCenter"}>
                  <CardIconStyle
                    src={card.icon}
                    alt={card.title}
                    sx={{
                      ...(index === 0 && {
                        filter: (theme) => shadowIcon(theme.palette.info.main),
                      }),
                      ...(index === 1 && {
                        filter: (theme) => shadowIcon(theme.palette.error.main),
                      }),
                    }}
                  />
                  <Typography variant="h5" paragraph>
                    {card.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: isLight ? "text.secondary" : "common.white",
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardStyle>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </RootStyle>
  );
}
