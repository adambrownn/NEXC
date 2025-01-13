import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import checkmarkCircle2Fill from "@iconify/icons-eva/checkmark-circle-2-fill";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import {
  Box,
  Card,
  Grid,
  Radio,
  Collapse,
  TextField,
  Typography,
  RadioGroup,
  CardHeader,
  CardContent,
  FormControlLabel,
  Stack,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import { MHidden } from "../@material-extend";

const OptionStyle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2.5),
  justifyContent: "space-between",
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create("all"),
  border: `solid 1px ${theme.palette.grey[500_32]}`,
}));

CheckoutPaymentMethods.propTypes = {
  paymentOptions: PropTypes.array,
};

export default function CheckoutPaymentMethods({
  formInput,
  handleInputChange,
  paymentOptions,
}) {
  return (
    <Card sx={{ my: 3 }}>
      <CardHeader title="Payment options" />
      <CardContent>
        <RadioGroup row>
          <Grid container spacing={2}>
            {paymentOptions.map((method) => {
              const { value, title, icons, description } = method;
              const hasChildren = "credit_card";

              return (
                <Grid key={title} item xs={12}>
                  <OptionStyle
                    sx={{
                      ...(hasChildren && {
                        boxShadow: (theme) => theme.customShadows.z8,
                      }),
                      ...(hasChildren && { flexWrap: "wrap" }),
                    }}
                  >
                    <FormControlLabel
                      onChange={handleInputChange}
                      name="paymentMode"
                      value={value}
                      control={
                        <Radio
                          checked={true}
                          checkedIcon={<Icon icon={checkmarkCircle2Fill} />}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="subtitle2">{title}</Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            {description}
                          </Typography>
                        </Box>
                      }
                      sx={{ flexGrow: 1, py: 3 }}
                    />
                    <MHidden width="smDown">
                      <Box
                        sx={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {icons.map((icon) => (
                          <Icon
                            key={icon.logo}
                            style={{
                              marginInline: 4,
                              fontSize: icon.fontSize,
                              color: "#4E238E",
                            }}
                            icon={icon.logo}
                          />
                        ))}
                      </Box>
                    </MHidden>

                    {/* {formInput.paymentMode === "credit_card" && */}
                    {hasChildren && (
                      <Collapse
                        in={hasChildren}
                        sx={{ width: "100%", marginBottom: 4 }}
                      >
                        <Stack spacing={3}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 3, sm: 2 }}
                          >
                            <TextField
                              fullWidth
                              label="Name On Card *"
                              name="cardholderName"
                              value={formInput.cardholderName || ""}
                              onChange={handleInputChange}
                            />
                          </Stack>

                          <Stack direction={{ xs: "column", sm: "row" }}>
                            <TextField
                              fullWidth
                              label="Card Number *"
                              name="cardNumber"
                              type="number"
                              value={formInput.cardNumber || ""}
                              onChange={handleInputChange}
                            />
                          </Stack>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 3, sm: 2 }}
                          >
                            <FormControl sx={{ minWidth: 150 }}>
                              <InputLabel id="expiry-month">
                                Expiry Month
                              </InputLabel>
                              <Select
                                labelId="expiry-month"
                                id="expiry-month"
                                name="month"
                                value={formInput.month}
                                label="Expiry Month *"
                                onChange={handleInputChange}
                              >
                                <MenuItem value={"01"}>01 | January</MenuItem>
                                <MenuItem value={"02"}>02 | February</MenuItem>
                                <MenuItem value={"03"}>03 | March</MenuItem>
                                <MenuItem value={"04"}>04 | April</MenuItem>
                                <MenuItem value={"05"}>05 | May</MenuItem>
                                <MenuItem value={"06"}>06 | June</MenuItem>
                                <MenuItem value={"07"}>07 | July</MenuItem>
                                <MenuItem value={"08"}>08 | August</MenuItem>
                                <MenuItem value={"09"}>09 | September</MenuItem>
                                <MenuItem value={"10"}>10 | October</MenuItem>
                                <MenuItem value={"11"}>11 | November</MenuItem>
                                <MenuItem value={"12"}>12 | December</MenuItem>
                              </Select>
                            </FormControl>
                            <FormControl sx={{ minWidth: 150 }}>
                              <InputLabel id="expiry-year">
                                Expiry Year
                              </InputLabel>
                              <Select
                                labelId="expiry-year"
                                id="expiry-year"
                                name="year"
                                value={formInput.year}
                                label="Expiry Year *"
                                onChange={handleInputChange}
                              >
                                {[...Array(15)].map((value, idx) => (
                                  <MenuItem
                                    value={new Date().getFullYear() + idx}
                                    key={idx}
                                  >
                                    {new Date().getFullYear() + idx}{" "}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <TextField
                              sx={{ minWidth: 150 }}
                              label="Security Code"
                              name="securityCode"
                              type="number"
                              value={formInput.securityCode || ""}
                              onChange={handleInputChange}
                            />
                          </Stack>
                        </Stack>
                      </Collapse>
                    )}
                  </OptionStyle>
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
