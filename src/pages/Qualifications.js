// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Grid, Container, Typography } from "@material-ui/core";
// components
import Page from "../components/Page";
import {
  QualificationPlanCard,
  QualificationTrust,
} from "../components/_external-pages/qualifications";

const PLANS = [
  {
    price: 0,
    caption: "Lifetime Qualification.",
    lists: [
      { text: "On-site Assessment", isAvailable: true },
      { text: "Flexible payment options", isAvailable: true },
      { text: "No hidden charges", isAvailable: false },
      { text: "Complete guidance", isAvailable: false },
    ],
    labelAction: "current plan",
  },
  {
    price: "NVQ Level 3",
    caption: "Lifetime Qualifications",
    lists: [
      { text: "On-site Assessment", isAvailable: true },
      { text: "Free Experienced worker card", isAvailable: true },
      { text: "Flexible payment options", isAvailable: true },
      { text: "No hidden charges", isAvailable: false },
    ],
    labelAction: "choose starter",
  },
  {
    price: "NVQ level 4",
    caption: "Lifetime Qualification",
    lists: [
      { text: "On site Assessment", isAvailable: true },
      { text: "Free CSCS TSM card and HS&E Test", isAvailable: true },
      { text: "Flexible & easy installments", isAvailable: true },
      { text: "No extra or hidden cost", isAvailable: true },
    ],
    labelAction: "choose premium",
  },
  {
    price: "NVQ level 5 and above",
    caption: "Lifetime Qualifications",
    lists: [
      { text: "On-site Assessment", isAvailable: true },
      { text: "Free Experienced worker card", isAvailable: true },
      { text: "Flexible payment options", isAvailable: true },
      { text: "No hidden charges", isAvailable: false },
    ],
  },
];
const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: "100%",
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

export default function QualificationsPage() {
  return (
    <RootStyle title="Qualifications | CSL">
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" paragraph>
          Flexible plans for your <br /> Qualification and needs.
        </Typography>
        <Typography align="center" sx={{ color: "text.secondary" }}>
          Choose your level of qualification and we will guide you through the
          whole process of achieving your desired qualification.
        </Typography>
        {/* 
        <Box sx={{ my: 5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Typography variant="overline" sx={{ mr: 1.5 }}>
              MONTHLY
            </Typography>
            <Switch />
            <Typography variant="overline" sx={{ ml: 1.5 }}>
              YEARLY (save 10%)
            </Typography>
          </Box>
          <Typography
            variant="caption"
            align="right"
            sx={{ color: "text.secondary", display: "block" }}
          >
            * Plus applicable taxes
          </Typography>
        </Box> */}

        <Grid container spacing={3}>
          {PLANS.map((card, index) => (
            <Grid
              style={{
                display: "block",
                margin: "1% auto",
              }}
              item
              xs={12}
              md={5}
              key={card.subscription}
            >
              <QualificationPlanCard card={card} index={index} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <QualificationTrust />
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}
