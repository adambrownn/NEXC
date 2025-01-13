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
} from "@material-ui/core";
import axiosInstance from "../../../axiosConfig";

export default function QualificationApplicationForm(props) {
  const [qualFormOpen, setQualFormOpen] = React.useState(false);
  const [formInput, setFormInput] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleQualFormClose = () => {
    setQualFormOpen(false);
  };

  const handlePurchaseQualification = async () => {
    setQualFormOpen(true);
  };

  const handleSubmit = async () => {
    formInput.applicationType = "qualification";
    formInput.appliedFor = props.price;
    const resp = await axiosInstance.post("/applications/create", formInput);
    if (resp.data?.err) {
      alert(resp.data?.err);
    } else {
      alert("Details Saved! Our executive will contact you shortly");
      setFormInput({});
    }
    setQualFormOpen(false);
  };

  return (
    <div>
      <CardActions>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handlePurchaseQualification}
        >
          Apply Now
        </Button>
      </CardActions>
      <Dialog
        open={qualFormOpen}
        onClose={handleQualFormClose}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"sm"}
      >
        <DialogTitle sx={{ pb: 2 }}>Qualification Form</DialogTitle>

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
                label="Contact Address *"
                name="address"
                value={formInput.address || ""}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQualFormClose}>Close</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
