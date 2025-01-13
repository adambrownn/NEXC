import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  IconButton,
} from "@material-ui/core";
import { Visibility as VisibilityIcon } from "@material-ui/icons";
import Label from "../../Label";

export default function OrderDetails(props) {
  const [orderDetailsFormOpen, setOrderDetailsFormOpen] = React.useState(false);

  const handleOrderDetailsFormClose = () => {
    setOrderDetailsFormOpen(false);
  };

  const handleOrderDetailsFormOpen = async () => {
    setOrderDetailsFormOpen(true);
  };

  return (
    <>
      <IconButton onClick={handleOrderDetailsFormOpen}>
        <VisibilityIcon />
      </IconButton>
      <Dialog
        open={orderDetailsFormOpen}
        onClose={handleOrderDetailsFormClose}
        scroll={"paper"}
        fullWidth
        maxWidth={"sm"}
      >
        <DialogTitle sx={{ pb: 2 }}>Order Details</DialogTitle>

        <DialogContent dividers={true}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 12, sm: 12 }}
            >
              <Typography>
                <strong>Name: </strong> {props.name}{" "}
              </Typography>
              <Typography>
                <strong>Contact: </strong>
                {props.phoneNumber || "NA"}{" "}
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 12, sm: 12 }}
            >
              <Typography>
                <strong>Email: </strong>
                {props.email || "NA"}
              </Typography>
              <Typography>
                <strong>DOB: </strong>
                {new Date(props.dob)
                  ?.toLocaleString("en-GB")
                  ?.substring(0, 10) || "NA"}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }}>
              <Typography>
                <strong>Address: </strong>
                {props.address || "NA"}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 12, sm: 12 }}
            >
              <Typography>
                <strong>Postcode: </strong>
                {props.zipcode || "NA"}
              </Typography>
              <Typography>
                <strong>NI Number: </strong>
                {props.NINumber || "NA"}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 12, sm: 12 }}
            >
              <Typography>
                <strong>Card Id: </strong>
                {props.cardid || "NA"}
              </Typography>
              <Typography>
                <strong>CITB Test Id: </strong>
                {props.citbtestid || "NA"}
              </Typography>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }}>
              <Typography>
                <strong>Product Purchased: </strong>
                {props.products || "NA"}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 12, sm: 12 }}
            >
              <Typography>
                <strong>Grant Total: </strong>£ {props.grandTotal || "NA"}
              </Typography>
              <Typography>
                {" "}
                <strong>Payment Status: </strong>
                <Label
                  variant="ghost"
                  color={props.payStatus ? "success" : "error"}
                >
                  {props.payStatus ? "Paid" : "Unpaid"}
                </Label>
              </Typography>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }}>
              <Typography>
                <strong>Date Created: </strong>
                {new Date(props.createdAt)?.toLocaleString("en-GB") || "NA"}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOrderDetailsFormClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
