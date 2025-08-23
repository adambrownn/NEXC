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
        setFormInput(resp.data?.length ? resp.data[0] : {});
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
    if (Object.entries(formInput).length > 4) {
      const coords = formInput.location?.split(",");
      formInput.geoLocation = {
        type: "Point",
        coordinates: [coords[0], coords[1]],
      };
      delete formInput.location;
      const resp = await axiosInstance.post("/centers", formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        setCentersList([...centersList, resp.data.centerData]);
        setFormInput({});
        alert("Center created successfully");
      }
    } else {
      alert("All Inputs are required");
    }
  };

  const handleEditCenter = async () => {
    if (Object.entries(formInput).length > 4) {
      const coords = formInput.location?.split(",");
      formInput.geoLocation = {
        type: "Point",
        coordinates: [coords[0], coords[1]],
      };
      delete formInput.location;
      const resp = await axiosInstance.put(`/centers/${editId}`, formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        const _centerList = centersList.filter(
          (center) => center._id !== formInput?._id
        );
        setCentersList([..._centerList, formInput]);
        setFormInput({});
        setIsEditingId("");
        alert("Center edited successfully");
      }
    } else {
      alert("All Inputs are required");
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
