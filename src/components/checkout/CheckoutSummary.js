import PropTypes from "prop-types";
// material
import {
  Box,
  Card,
  Stack,
  Divider,
  CardHeader,
  Typography,
  CardContent,
} from "@material-ui/core";

CheckoutSummary.propTypes = {
  total: PropTypes.number,
  discount: PropTypes.number,
  subtotal: PropTypes.number,
  shipping: PropTypes.number,
  onEdit: PropTypes.func,
  enableEdit: PropTypes.bool,
  onApplyDiscount: PropTypes.func,
  enableDiscount: PropTypes.bool,
  sx: PropTypes.object,
};

export default function CheckoutSummary({
  totalItems,
  itemsTotal,
  grandTotal,
  sx,
}) {
  return (
    <Card sx={{ mb: 3, ...sx }}>
      <CardHeader title="Order Summary" />

      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Quantity
            </Typography>
            <Typography variant="subtitle2">{totalItems}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Total
            </Typography>
            <Typography variant="subtitle2">£ {itemsTotal}</Typography>
          </Stack>
          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">Grand Total</Typography>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="subtitle1" sx={{ color: "success.main" }}>
                £ {grandTotal}
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                (VAT included if applicable)
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
