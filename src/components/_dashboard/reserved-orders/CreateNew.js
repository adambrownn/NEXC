import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { enGB } from "date-fns/locale";
import {
  Button,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@material-ui/core";
import DatePicker from "@mui/lab/DatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { Edit as EditIcon } from "@material-ui/icons";
import axiosInstance from "../../../axiosConfig";
import plusFill from "@iconify/icons-eva/plus-fill";

export default function NewReservedOrder(props) {
  const [reservedOrderFormOpen, setReservedOrderFormOpen] =
    React.useState(false);
  const [dob, setDob] = useState("");
  const [formInput, setFormInput] = useState({
    payStatus: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleReservedOrderFormClose = () => {
    setReservedOrderFormOpen(false);
  };

  const handleReservedOrderFormOpen = async () => {
    setReservedOrderFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formInput.name || !formInput.grandTotal) {
      alert("Fill required inputs");
      return;
    }
    formInput.dob = dob;
    const resp = await axiosInstance.post("/others/reserved-orders", formInput);
    if (resp.data?.err) {
      alert(resp.data?.err);
    } else {
      props.appendToList(resp.data);
      alert("Saved");
      setFormInput({});
    }
    setReservedOrderFormOpen(false);
  };

  const handleEdit = async () => {
    handleReservedOrderFormOpen();
    setFormInput(props.orderData);
  };

  const handleEditSubmit = async () => {
    if (!formInput.name || !formInput.grandTotal) {
      alert("Fill required inputs");
      return;
    }
    formInput.dob = dob;
    const resp = await axiosInstance.put(
      `/others/reserved-orders/${props.orderData?._id}`,
      formInput
    );
    if (resp.data?.err) {
      alert(resp.data?.err);
    } else {
      await props.editOrder(formInput);
      alert("Edited Successfully");
      setFormInput({});
    }
    setReservedOrderFormOpen(false);
  };

  return (
    <>
      {props.edit ? (
        <IconButton onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      ) : (
        <CardActions>
          <Button
            variant="contained"
            startIcon={<Icon icon={plusFill} />}
            onClick={handleReservedOrderFormOpen}
          >
            New Order
          </Button>
        </CardActions>
      )}
      <Dialog
        open={reservedOrderFormOpen}
        onClose={handleReservedOrderFormClose}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"lg"}
      >
        <DialogTitle sx={{ pb: 2 }}>Create new Order</DialogTitle>

        <DialogContent dividers={true}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Full Name *"
                name="name"
                value={formInput.name || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Contact Number *"
                name="phoneNumber"
                value={formInput.phoneNumber || ""}
                onChange={handleInputChange}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }}>
              <TextField
                fullWidth
                label="Email Address *"
                name="email"
                value={formInput.email || ""}
                onChange={handleInputChange}
                style={{ marginRight: 20 }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
                <DatePicker
                  label="Date of Birth"
                  name="dob"
                  sx={{ minWidth: 200 }}
                  value={dob}
                  onChange={(newValue) => {
                    setDob(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Address *"
                name="address"
                value={formInput.address || ""}
                onChange={handleInputChange}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Postcode *"
                name="zipcode"
                value={formInput.zipcode || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="NI Number *"
                name="NINumber"
                value={formInput.NINumber || ""}
                onChange={handleInputChange}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Products (Items purchased) *"
                name="products"
                value={formInput.products || ""}
                onChange={handleInputChange}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Card Id"
                name="cardid"
                value={formInput.cardid || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="CITB Test Id *"
                name="citbtestid"
                value={formInput.citbtestid || ""}
                onChange={handleInputChange}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Amount (Grand Total)"
                name="grandTotal"
                type="number"
                value={formInput.grandTotal || ""}
                onChange={handleInputChange}
              />
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Payment Status
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="payStatus"
                  value={formInput.payStatus || false}
                  label="Payment Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value={true}>Paid</MenuItem>
                  <MenuItem value={false}>Pending</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Order Status
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="orderCheckPoint"
                  value={formInput.orderCheckPoint}
                  label="Order Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value={0}>Details Capture Complete</MenuItem>
                  <MenuItem value={1}>Details Capture Inomplete</MenuItem>
                  <MenuItem value={2}>Documents Pending</MenuItem>
                  <MenuItem value={3}>Order Placed.</MenuItem>
                  <MenuItem value={4}>Confirmation Sent</MenuItem>
                  <MenuItem value={5}>Application Under Process</MenuItem>
                  <MenuItem value={6}>Order Complete</MenuItem>
                  <MenuItem value={7}>Refunded</MenuItem>
                  <MenuItem value={8}>Follow up</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReservedOrderFormClose}>Close</Button>
          <Button
            variant="contained"
            onClick={props.edit ? handleEditSubmit : handleSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
