// material
import { Button, Typography, TextField, Stack } from "@mui/material";
import { useState } from "react";
import axiosInstance from "../../../axiosConfig";
//

export default function ContactForm() {
  const [formInput, setFormInput] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleSendMessage = async () => {
    formInput.applicationType = "contactus";
    const resp = await axiosInstance.post("/applications/create", formInput);
    if (resp.data?.err) {
      alert(resp.data?.err);
    } else {
      alert("Message Sent!");
      setFormInput({});
    }
  };

  return (
    <Stack spacing={5}>
      <Typography variant="h3">
        <br />
        How can we help? Send us a message.
      </Typography>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Full Name *"
          name="name"
          value={formInput.name || ""}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          label="Email *"
          name="email"
          value={formInput.email || ""}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          label="Subject"
          name="subject"
          value={formInput.subject || ""}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          label="Enter your message here."
          multiline
          rows={4}
          name="message"
          value={formInput.message || ""}
          onChange={handleInputChange}
        />
      </Stack>

      <Button size="large" variant="contained" onClick={handleSendMessage}>
        Send
      </Button>
    </Stack>
  );
}
