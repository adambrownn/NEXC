import PropTypes from "prop-types";
// material
import { Typography, Box, Grid, Paper } from "@mui/material";
//
import { Link } from "react-router-dom";

// ----------------------------------------------------------------------

const CATEGORIES = [
  {
    label: "CARDS",
    icon: "/static/faqs/ic_account.svg",
    href: "?faq=card",
  },
  {
    label: "TESTS",
    icon: "/static/faqs/ic_payment.svg",
    href: "?faq=test",
  },
  {
    label: "QUALIFICATIONS",
    icon: "/static/faqs/ic_delivery.svg",
    href: "?faq=qualification",
  },
  {
    label: "COURSES",
    icon: "/static/faqs/ic_package.svg",
    href: "?faq=course",
  },
  {
    label: "CENTERS",
    icon: "/static/faqs/ic_refund.svg",
    href: "?faq=center",
  },
  {
    label: "TRADES",
    icon: "/static/faqs/ic_assurances.svg",
    href: "?faq=trade",
  },
  {
    label: "PAYMENT",
    icon: "/static/faqs/ic_assurances.svg",
    href: "?faq=payment",
  },
  {
    label: "INFO",
    icon: "/static/faqs/ic_assurances.svg",
    href: "?faq=info",
  },
];

CategoryCard.propTypes = {
  category: PropTypes.object,
};

function CategoryCard({ category }) {
  const { label, icon, href } = category;

  return (
    <Paper
      sx={{
        px: 2,
        height: 150,
        display: "flex",
        textAlign: "center",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: (theme) => theme.customShadows.z8,
      }}
    >
      <Link
        to={`/faqs${href}`}
        style={{ textDecoration: "none", color: "black" }}
      >
        <Box component="img" src={icon} sx={{ mb: 2, width: 80, height: 80 }} />
        <Typography variant="subtitle2">{label}</Typography>
      </Link>
    </Paper>
  );
}

export default function FaqsCategory() {
  return (
    <Grid container spacing={3} sx={{ mb: 15 }}>
      {CATEGORIES.map((category) => (
        <Grid item xs={12} sm={4} md={1.5} key={category.label}>
          <CategoryCard category={category} />
        </Grid>
      ))}
    </Grid>
  );
}
