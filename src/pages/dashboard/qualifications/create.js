import React, { createContext, useEffect, useState } from "react";
import {
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';

import SubCard from "../../../components/_dashboard/cards/SubCard";
import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";
import TradeSelectCard from "../../../components/_dashboard/cards/TradeSelectCard";
import { useLocation } from "react-router-dom";

const TradeContext = createContext();

const CreateQualification = (props) => {
  const [qualificationsList, setQualificationsList] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isEditingId, setIsEditingId] = useState("");
  const [selectedTrade, setSelectedTrade] = useState();

  const editId = useLocation().pathname?.split("/")[4];

  useEffect(() => {
    if (editId) {
      setIsEditingId(editId);
      (async () => {
        const resp = await axiosInstance.get(`/qualifications/${editId}`);
        const qualData = resp.data?.length ? resp.data[0] : resp.data;
        setFormInput(qualData);
        // Handle tradeId whether it's populated or just an ID
        const tradeIdValue = qualData.tradeId?._id || qualData.tradeId;
        setSelectedTrade(tradeIdValue);
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

  const handleAddNewQual = async () => {
    if (selectedTrade && Object.entries(formInput).length > 2) {
      formInput.tradeId = selectedTrade;
      const resp = await axiosInstance.post("/qualifications", formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        setQualificationsList([...qualificationsList, resp.data]);
        setFormInput({});
        setSelectedTrade("");
        alert("Qualification created successfully");
      }
    } else {
      alert("All Inputs are required");
    }
  };

  const handleEditQual = async () => {
    if (editId && selectedTrade && Object.entries(formInput).length > 4) {
      const updateData = { ...formInput, tradeId: selectedTrade };
      const resp = await axiosInstance.put(
        `/qualifications/${editId}`,
        updateData
      );
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        const _qualList = qualificationsList.filter(
          (qual) => qual._id !== formInput?._id
        );
        setQualificationsList([..._qualList, formInput]);
        setFormInput({});
        setIsEditingId("");
        setSelectedTrade("");
        alert("Qualification updated successfully");
        window.location.href = '/dashboard/qualifications';
      }
    } else {
      alert("All fields including trade selection are required");
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title="Qualification">
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <TradeContext.Provider
                value={{ selectedTrade, setSelectedTrade }}
              >
                <TradeSelectCard
                  selectedTrade={selectedTrade}
                  tradeContext={TradeContext}
                />
              </TradeContext.Provider>
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Qualification title"}
                variant="outlined"
                fullWidth
                name="title"
                value={formInput.title || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="outlined-adornment-price">
                  Amount
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-price"
                  name="price"
                  value={formInput.price || ""}
                  onChange={handleInputChange}
                  startAdornment={
                    <InputAdornment position="start">£ </InputAdornment>
                  }
                  label="Amount"
                />
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl fullWidth>
                <InputLabel id="category-id">Category</InputLabel>
                <Select
                  labelId="category-id"
                  id="category-select"
                  name="category"
                  value={formInput.category || ""}
                  onChange={handleInputChange}
                >
                  <MenuItem value="NVQ">NVQ</MenuItem>
                  <MenuItem value="Craft Certificate">Craft Certificate</MenuItem>
                  <MenuItem value="Diploma">Diploma</MenuItem>
                  <MenuItem value="Apprenticeship">Apprenticeship</MenuItem>
                  <MenuItem value="Technical Certificate">Technical Certificate</MenuItem>
                  <MenuItem value="BTEC">BTEC</MenuItem>
                  <MenuItem value="HNC/HND">HNC/HND</MenuItem>
                  <MenuItem value="Degree">Degree</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl fullWidth>
                <InputLabel id="level-id">Qualification Level</InputLabel>
                <Select
                  labelId="level-id"
                  id="level-select"
                  name="level"
                  value={formInput.level || ""}
                  onChange={handleInputChange}
                >
                  <MenuItem value={0}>No Level</MenuItem>
                  <MenuItem value={1}>Level 1 - Entry</MenuItem>
                  <MenuItem value={2}>Level 2 - Skilled Worker</MenuItem>
                  <MenuItem value={3}>Level 3 - Supervisor</MenuItem>
                  <MenuItem value={4}>Level 4 - Management</MenuItem>
                  <MenuItem value={5}>Level 5 - Higher Management</MenuItem>
                  <MenuItem value={6}>Level 6 - Degree</MenuItem>
                  <MenuItem value={7}>Level 7 - Masters</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Qualification Description"}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                name="description"
                value={formInput.description || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Number of Providers"}
                variant="outlined"
                fullWidth
                type="number"
                name="providerCount"
                value={formInput.providerCount || ""}
                onChange={handleInputChange}
                helperText="How many providers offer this qualification"
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Available Providers"}
                variant="outlined"
                fullWidth
                name="availableProviders"
                value={formInput.availableProviders?.join(', ') || ""}
                onChange={(e) => {
                  const providers = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                  setFormInput({ ...formInput, availableProviders: providers });
                }}
                helperText="Comma-separated list (e.g., City and Guilds, Pearson Edexcel, GQA)"
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={isEditingId ? handleEditQual : handleAddNewQual}
              >
                {isEditingId ? "Save Edit" : "Create Qualification"}
              </Button>
            </Grid>
          </Grid>
        </SubCard>
      </Grid>
    </Grid>
  );
};

export default CreateQualification;
