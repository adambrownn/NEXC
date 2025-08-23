import React, { useState, forwardRef, useImperativeHandle } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import axiosInstance from "../../../axiosConfig";

// Modified to accept external control and expose ref methods
const GroupBookingForm = forwardRef((props, ref) => {
  const [groupBookingFormOpen, setGroupBookingFormOpen] = useState(false);
  const [formInput, setFormInput] = useState({});

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    openForm: () => {
      setGroupBookingFormOpen(true);
    },
    closeForm: () => {
      setGroupBookingFormOpen(false);
    }
  }));

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

  const handleGroupBookingForm = () => {
    setGroupBookingFormOpen(true);
  };

  const handleSubmit = async () => {
    formInput.applicationType = "groupbooking";
    try {
      const resp = await axiosInstance.post("/applications/create", formInput);
      if (resp.data?.err) {
        alert(resp.data?.err);
      } else {
        alert("Details Saved! Our executive will contact you shortly");
        setFormInput({});
      }
      setGroupBookingFormOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting your application. Please try again.");
    }
  };

  if (props.menuIntegration) {
    return (
      <React.Fragment>
        {/* Use span instead of div for direct nesting in Typography */}
        <Box
          component="span"
          onClick={handleGroupBookingForm}
          sx={{
            cursor: 'pointer',
            display: 'inline-flex',  // Changed from flex to inline-flex
            alignItems: 'center'
          }}
          data-group-booking-form="true"
        >
          {props.children}
        </Box>
        <Dialog
          open={groupBookingFormOpen}
          onClose={handleGroupBookingFormClose}
          scroll={"paper"}
          fullWidth={true}
          maxWidth={"sm"}
        >
          {/* Dialog content */}
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
      </React.Fragment>
    );
  }

  // Original standalone component with image
  return (
    <div data-group-booking-form="true">
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
});

GroupBookingForm.displayName = 'GroupBookingForm';

export default GroupBookingForm;