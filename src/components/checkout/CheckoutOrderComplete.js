import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import filePdfFilled from "@iconify/icons-ant-design/file-pdf-filled";
import arrowIosBackFill from "@iconify/icons-eva/arrow-ios-back-fill";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Box, Button, Divider, Typography, Stack } from "@material-ui/core";
//
import { DialogAnimate } from "../animate";
import { OrderCompleteIllustration } from "../../assets";

// ----------------------------------------------------------------------

const DialogStyle = styled(DialogAnimate)(({ theme }) => ({
  "& .MuiDialog-paper": {
    margin: 0,
    [theme.breakpoints.up("md")]: {
      maxWidth: "calc(100% - 48px)",
      maxHeight: "calc(100% - 48px)",
    },
  },
}));

export default function CheckoutOrderComplete(props) {
  return (
    <DialogStyle fullScreen open={props.open}>
      <Box sx={{ p: 4, maxWidth: 480, margin: "auto" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" paragraph>
            Thanks for your Trust on us!
          </Typography>

          <OrderCompleteIllustration sx={{ height: 260, my: 10 }} />

          <Typography align="left" paragraph>
            Please save this Order ID for future reference: &nbsp;
            <Link to={`/orders/invoice/${props.orderId}`}>{props.orderId}</Link>
          </Typography>

          <Typography align="left" sx={{ color: "text.secondary" }}>
            You will recieve your Invoice on your email or follow the link below
            to download your invoice.
            <br />
            <br />
            Thank you.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <a href={"/trades"}>
            <Button
              color="inherit"
              startIcon={<Icon icon={arrowIosBackFill} />}
            >
              Continue Shopping
            </Button>
          </a>
          <a href={`/orders/invoice/${props.orderId}`}>
            <Button
              variant="contained"
              startIcon={<Icon icon={filePdfFilled} />}
            >
              Download Invoice
            </Button>
          </a>
        </Stack>
      </Box>
    </DialogStyle>
  );
}
