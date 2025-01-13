import React, { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardHeader,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
} from "@material-ui/core";
import validator from "validator";
import { LoadingButton } from "@material-ui/lab";
import UserService from "../../../services/user";
import AxiosInstance from "../../../axiosConfig";

export default function UserForm(props) {
  const { userFormOpen, setUserFormOpen } = useContext(
    props.userDetailsContext
  );
  const [formInput, setFormInput] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleSaveUserDetails = async () => {
    if (!formInput.name || !formInput.email || !formInput.phoneNumber) {
      alert("Please enter all inputs");
    } else if (!validator.isEmail(formInput?.email)) {
      alert("Invalid Email!");
    } else if (
      formInput?.phoneNumber?.toString()?.length < 10 ||
      formInput?.phoneNumber?.toString()?.length > 13
    ) {
      alert("Invalid Contact Number");
    } else if (Object.entries(formInput).length >= 3) {
      formInput.accountType = "visitor";
      formInput.registrationType = "visitor";
      const resp = await AxiosInstance.post("/user/registration", formInput);
      if (!resp.data.err) {
        await UserService.createUser(resp.data?.user);
        setUserFormOpen(false);
      } else {
        formInput.userId = uuidv4();
        delete formInput.registrationType;
        delete formInput.accountType;
        await UserService.createUser(formInput);
        setUserFormOpen(false);
      }
    } else {
      alert("All inputs are required");
    }
  };

  const handleBucketClose = () => {
    setUserFormOpen(false);
  };

  return (
    <div>
      <Dialog
        open={userFormOpen}
        onClose={handleBucketClose}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"sm"}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <CardHeader
              title={<Typography variant="h6">Enter your details</Typography>}
            />
            <Card sx={{ p: 3 }}>
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
                    label="Phone Number *"
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
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }}>
                  <LoadingButton
                    align="center"
                    variant="contained"
                    size="large"
                    onClick={handleSaveUserDetails}
                  >
                    Continue
                  </LoadingButton>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Button onClick={handleBucketClose} sx={{ color: "#0003" }}>
            Skip for now
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
