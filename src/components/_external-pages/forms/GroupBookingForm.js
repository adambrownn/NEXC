import React, { useState } from "react";
import {
  Button,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Box,
} from "@material-ui/core";
import { motion } from "framer-motion";
import axiosInstance from "../../../axiosConfig";

export default function GroupBookingForm(props) {
  const [groupBookingFormOpen, setGroupBookingFormOpen] = React.useState(false);
  const [formInput, setFormInput] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleGroupBookingFormClose = () => {
    setGroupBookingFormOpen(false);
  };

  const handleGroupBookingForm = async () => {
    setGroupBookingFormOpen(true);
  };

  const handleSubmit = async () => {
    formInput.applicationType = "groupbooking";
    const resp = await axiosInstance.post("/applications/create", formInput);
    if (resp.data?.err) {
      alert(resp.data?.err);
    } else {
      alert("Details Saved! Our executive will contact you shortly");
      setFormInput({});
    }
    setGroupBookingFormOpen(false);
  };

  return (
    <div>
      <CardActions>
        <Box
          component={motion.img}
          whileTap="tap"
          whileHover="hover"
          variants={{
            hover: { scale: 1.02 },
            tap: { scale: 0.98 },
          }}
          onClick={handleGroupBookingForm}
          src="/static/groupbooking.png"
          sx={{ borderRadius: 2 }}
        />
      </CardActions>
      <Dialog
        open={groupBookingFormOpen}
        onClose={handleGroupBookingFormClose}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"sm"}
      >
        <DialogTitle sx={{ pb: 2 }}>Group Booking Form</DialogTitle>

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
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Contact Number *"
                name="phoneNumber"
                type="number"
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
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }}>
              <TextField
                fullWidth
                label="Company Name *"
                name="company"
                value={formInput.company || ""}
                onChange={handleInputChange}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGroupBookingFormClose}>Close</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
