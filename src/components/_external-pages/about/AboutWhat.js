import PropTypes from "prop-types";
// material
import {
  alpha,
  useTheme,
  experimentalStyled as styled,
} from "@material-ui/core/styles";
import {
  Box,
  Grid,
  Container,
  Typography,
  LinearProgress,
} from "@material-ui/core";
// utils
import { fPercent } from "../../../utils/formatNumber";
//
import { MHidden } from "../../@material-extend";

const RootStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  paddingTop: theme.spacing(20),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up("md")]: {
    textAlign: "left",
  },
}));

// ----------------------------------------------------------------------

ProgressItem.propTypes = {
  progress: PropTypes.object,
};

function ProgressItem({ progress }) {
  const { label, value } = progress;
  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
        <Typography variant="subtitle2">{label}&nbsp;-&nbsp;</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {fPercent(value)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          "& .MuiLinearProgress-bar": { bgcolor: "grey.700" },
          "&.MuiLinearProgress-determinate": { bgcolor: "divider" },
        }}
      />
    </Box>
  );
}

export default function AboutWhat() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const shadow = `-40px 40px 80px ${alpha(
    isLight ? theme.palette.grey[500] : theme.palette.common.black,
    0.48
  )}`;

  return (
    <RootStyle>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <MHidden width="mdDown">
            <Grid item xs={12} md={6} lg={7} sx={{ pr: { md: 7 } }}>
              <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={6}>
                  <Box
                    component="img"
                    src="/static/about/what-1.jpg"
                    sx={{
                      borderRadius: 2,
                      boxShadow: shadow,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Box
                    component="img"
                    src="/static/about/what-2.jpg"
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </MHidden>

          <Grid item xs={12} md={6} lg={5}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              About us
            </Typography>

            <Typography
              sx={{
                color: (theme) =>
                  theme.palette.mode === "light"
                    ? "text.secondary"
                    : "common.white",
              }}
            >
              Construction Safety Line offers services for UK construction
              sector in terms of Cards, Health and Safety Test and trainings. We
              also deliver best qualification experience. With us you will get
              clear understanding and knowledge to go through the whole process
              to obtain your desired qualification.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}
