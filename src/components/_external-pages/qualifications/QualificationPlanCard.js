import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import checkmarkFill from "@iconify/icons-eva/checkmark-fill";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Card, Typography, Box, Stack } from "@material-ui/core";
import Label from "../../Label";
import QualificationApplicationForm from "../forms/QualificationForm";

const RootStyle = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  display: "flex",
  position: "relative",
  alignItems: "center",
  flexDirection: "column",
  padding: theme.spacing(3),
  [theme.breakpoints.up(414)]: {
    padding: theme.spacing(5),
  },
}));
QualificationPlanCard.propTypes = {
  index: PropTypes.number,
  card: PropTypes.object,
};

export default function QualificationPlanCard({ card, index }) {
  const { subscription, price, caption, lists } = card;

  return (
    <RootStyle sx={index === 3 && { maxWidth: "100%" }}>
      {index === 1 ||
        (index === 3 && (
          <Label
            color="info"
            sx={{
              top: 16,
              right: 16,
              position: "absolute",
            }}
          >
            PREMIUM
          </Label>
        ))}

      <Typography variant="overline" sx={{ color: "text.secondary" }}>
        {subscription}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", my: 2 }}>
        <Typography variant="h3" sx={{ mx: 1 }}>
          {price === 0 ? "NVQ Level 2" : price}
        </Typography>
        {index !== 0 ? (
          <Typography
            gutterBottom
            component="span"
            variant="subtitle2"
            sx={{
              alignSelf: "flex-end",
              color: "text.secondary",
            }}
          ></Typography>
        ) : (
          ""
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: "primary.main",
          textTransform: "capitalize",
        }}
      >
        {caption}
      </Typography>

      <Stack component="ul" spacing={2} sx={{ my: 5, width: 1 }}>
        {lists.map((item) => (
          <Stack
            key={item.text}
            component="li"
            direction="row"
            alignItems="center"
            //  direction="column"

            justify="center"
            spacing={1.5}
            sx={{
              typography: "body2",
              color: item.isAvailable ? "text.primary" : "text.disabled",
            }}
          >
            <Box
              component={Icon}
              icon={checkmarkFill}
              sx={{ width: 20, height: 20 }}
            />
            <Typography variant="body2">{item.text}</Typography>
          </Stack>
        ))}
      </Stack>

      <QualificationApplicationForm price={price} />
    </RootStyle>
  );
}
