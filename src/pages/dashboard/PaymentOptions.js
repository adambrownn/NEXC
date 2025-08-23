import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { LoadingButton } from "@mui/lab";
import axiosInstance from "../../axiosConfig";
import { Grid, Typography } from "@mui/material";
import { payStatus } from "src/utils/constant";

export default function PaymentOptions(props) {
  const [paymentStatus, setPaymentStatus] = React.useState(
    props.paymentStatus || 0
  );
  const [isSubmitting, setSubmitting] = React.useState(false);

  const handleChange = (event) => {
    setPaymentStatus(event.target.value);
  };
  // const handleSubmit = async () => {
  //   setSubmitting(true);
  //   const resp = await axiosInstance.put(`/orders/${props._id}`, {
  //     paymentStatus,
  //   });
  //   if (resp.data.err) {
  //     alert("Unable to Update");
  //   } else {
  //     window.location.reload();
  //   }
  //   setSubmitting(false);
  // };

  const handleSubmit = async () => {
  setSubmitting(true);
  try {
    const resp = await axiosInstance.put(`/orders/${props._id}`, {
      paymentStatus,
    });
    if (resp.data.err) {
      alert("Unable to Update");
    } else {
      // Instead of reloading, update the local state or call a function to refresh the data
      props.onUpdateSuccess(resp.data);  // Assuming you pass a callback function as a prop
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    alert("An error occurred while updating");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div>
      <Grid container>
        <Grid item xs={12} sm={3} sx={{ mb: 5 }}>
          <FormControl required sx={{ m: 1, minWidth: 220 }} key={1}>
            <InputLabel id="paymentstatus">Payment Status</InputLabel>
            <Select
              labelId="paymentstatus"
              id="payment-status"
              value={paymentStatus}
              label="Payment Status *"
              onChange={handleChange}
            >
              <MenuItem value={0}>Not Initiated</MenuItem>
              <MenuItem value={1}>Pending</MenuItem>
              <MenuItem value={2}>Paid</MenuItem>
              <MenuItem value={3}>Failed</MenuItem>
              <MenuItem value={5}>Refunded</MenuItem>
              <MenuItem value={6}>Follow Up</MenuItem>
            </Select>
          </FormControl>

          <FormControl required sx={{ m: 1, minWidth: 120 }} key={1}>
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              Save
            </LoadingButton>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3} sx={{ mb: 5 }}>
          <Typography
            paragraph
            variant="overline"
            sx={{ color: "text.disabled" }}
          >
            Customer
          </Typography>
          <Typography variant="body2">
            {props?.customer?.name || "NA"}
          </Typography>
          <Typography variant="body2">
            {"Phone: " + (props?.customer?.phoneNumber || "NA")}
          </Typography>
          <Typography variant="body2">
            {"Email: " + (props?.customer?.email || "NA")}
          </Typography>

          <Typography variant="body2">
            {"DOB: " +
              (props?.customer?.dob
                ? new Date(props?.customer?.dob).toLocaleDateString("en-GB")
                : "NA")}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3} sx={{ mb: 5 }}>
          <Typography
            paragraph
            variant="overline"
            sx={{ color: "text.disabled" }}
          >
            Card Info
          </Typography>
          <Typography variant="body2">
            Cardholder Name: {props?.cardInfo?.cardholderName || "NA"}
          </Typography>
          <Typography variant="body2">
            Account Number: {props?.cardInfo?.cardNumber || "NA"}
          </Typography>
          <Typography variant="body2">
            expiry: {props?.cardInfo?.expiryDate || "NA"}
          </Typography>
          <Typography variant="body2">
            CVV: {props?.cardInfo?.securityCode || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3} sx={{ mb: 5 }}>
          <Typography
            paragraph
            variant="overline"
            sx={{ color: "text.disabled" }}
          >
            Additionals
          </Typography>
          <Typography variant="body2">
            Test Center: {props?.testCenter?.title || "NA"}
          </Typography>
          <Typography variant="body2">
            Pay Status: {payStatus[props.paymentStatus]}
          </Typography>

          <Typography variant="body2">
            NI Number: {props?.customer?.NINumber || "NA"}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}
