import React from "react";
import { Icon } from "@iconify/react";

import { Typography, Box, Grid } from "@material-ui/core";
import { alpha, experimentalStyled as styled } from "@material-ui/core/styles";
import clockFill from "@iconify/icons-eva/clock-fill";
import roundVerified from "@iconify/icons-ic/round-verified";
import roundVerifiedUser from "@iconify/icons-ic/round-verified-user";

const PRODUCT_DESCRIPTION = [
  {
    title: "Payment",
    description: "Pay in installments.",
    icon: roundVerified,
  },
  {
    title: "Dedicated manager",
    description: "Get one point of contact for all your queries.",
    icon: clockFill,
  },
  {
    title: "Call us",
    description: "Call us today to get your Quote.",
    icon: roundVerifiedUser,
  },
];

// ----------------------------------------------------------------------

const IconWrapperStyle = styled("div")(({ theme }) => ({
  margin: "auto",
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  width: theme.spacing(8),
  justifyContent: "center",
  height: theme.spacing(8),
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  backgroundColor: `${alpha(theme.palette.primary.main, 0.08)}`,
}));

export default function QualificationTrust() {
  return (
    <div>
      <Grid container sx={{ my: 8 }}>
        {PRODUCT_DESCRIPTION.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Box
              sx={{
                my: 2,
                mx: "auto",
                maxWidth: 280,
                textAlign: "center",
              }}
            >
              <IconWrapperStyle>
                <Icon icon={item.icon} width={36} height={36} />
              </IconWrapperStyle>
              <Typography variant="subtitle1" gutterBottom>
                {item.title}
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {item.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
