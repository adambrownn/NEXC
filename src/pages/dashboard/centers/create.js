import React, { useEffect, useState } from "react";
import { Grid, Button, TextField } from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';

import SubCard from "../../../components/_dashboard/cards/SubCard";
import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";
import { useLocation } from "react-router-dom";

const CentersCreate = (props) => {
  const [centersList, setCentersList] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isEditingId, setIsEditingId] = useState("");

  const editId = useLocation().pathname?.split("/")[4];

  useEffect(() => {
    if (editId) {
      setIsEditingId(editId);
      (async () => {
        const resp = await axiosInstance.get(`/centers/${editId}`);
        // Handle new API format: { success: true, data: {...} }
        const centerData = resp.data?.success 
          ? resp.data.data 
          : (resp.data?.length ? resp.data[0] : resp.data);
        setFormInput(centerData || {});
      })();
    }
  }, [editId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleAddNewCenter = async () => {
    if (Object.entries(formInput).length >= 4) {
      const coords = formInput.location?.split(",").map(c => parseFloat(c.trim()));
      
      if (!coords || coords.length !== 2 || coords.some(isNaN)) {
        alert("Please enter valid coordinates in format: longitude,latitude");
        return;
      }
      
      const centerData = {
        ...formInput,
        geoLocation: {
          type: "Point",
          coordinates: coords,
        }
      };
      delete centerData.location;
      
      const resp = await axiosInstance.post("/centers", centerData);
      if (resp.data?.err || !resp.data?.success) {
        alert(resp.data?.err || resp.data?.error || "Failed to create center");
      } else {
        const _centerList = [...centersList, resp.data?.data || formInput];
        setCentersList(_centerList);
        setFormInput({});
        alert("Center created successfully");
        window.location.href = '/dashboard/centers';
      }
    } else {
      alert("All fields are required (Title, Address, Postcode, Location)");
    }
  };

  const handleEditCenter = async () => {
    if (Object.entries(formInput).length >= 4) {
      const coords = formInput.location?.split(",").map(c => parseFloat(c.trim()));
      
      if (!coords || coords.length !== 2 || coords.some(isNaN)) {
        alert("Please enter valid coordinates in format: longitude,latitude");
        return;
      }
      
      const centerData = {
        ...formInput,
        geoLocation: {
          type: "Point",
          coordinates: coords,
        }
      };
      delete centerData.location;
      
      const resp = await axiosInstance.put(`/centers/${editId}`, centerData);
      if (resp.data?.err || !resp.data?.success) {
        alert(resp.data?.err || resp.data?.error || "Failed to update center");
      } else {
        const _centerList = centersList.filter(
          (center) => center._id !== formInput?._id
        );
        setCentersList([..._centerList, formInput]);
        setFormInput({});
        setIsEditingId("");
        alert("Center edited successfully");
        window.location.href = '/dashboard/centers';
      }
    } else {
      alert("All fields are required (Title, Address, Postcode, Location)");
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title="Create New Center">
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Center Name"}
                variant="outlined"
                fullWidth
                name="title"
                value={formInput?.title || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Center Location (Latiude and Longitude)"}
                variant="outlined"
                fullWidth
                name="location"
                value={
                  formInput?.location ||
                  formInput.geoLocation?.coordinates?.toString() ||
                  ""
                }
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Center Direction"}
                variant="outlined"
                fullWidth
                name="direction"
                value={formInput?.direction || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Center Address"}
                variant="outlined"
                fullWidth
                name="address"
                value={formInput?.address || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Post Code"}
                variant="outlined"
                fullWidth
                name="postcode"
                value={formInput?.postcode || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={isEditingId ? handleEditCenter : handleAddNewCenter}
              >
                {isEditingId ? "Save Edit" : "Create"}
              </Button>
            </Grid>
          </Grid>
        </SubCard>
      </Grid>
    </Grid>
  );
};

export default CentersCreate;
