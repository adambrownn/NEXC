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
} from "@material-ui/core";

import { Save as SaveIcon } from "@material-ui/icons";

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
        setFormInput(resp.data?.length ? resp.data[0] : {});
        setSelectedTrade(resp.data?.length && resp.data[0].tradeId?._id);
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
    if (editId && Object.entries(formInput).length > 4) {
      const resp = await axiosInstance.put(
        `/qualifications/${editId}`,
        formInput
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
        alert("Qualification edited successfully");
      }
    } else {
      alert("All Inputs are required");
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
                <InputLabel id="cards-id">Category</InputLabel>
                <Select
                  labelId="cards-id"
                  id="demo-simple-select"
                  name="category"
                  value={formInput.category || ""}
                  onChange={handleInputChange}
                >
                  <MenuItem value={"6-months"}>6 Months</MenuItem>
                  <MenuItem value={"12-months"}>12 Months</MenuItem>
                  <MenuItem value={"18-months"}>18 Months</MenuItem>
                  <MenuItem value={"full-payment"}>Full Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Qualification Level"}
                variant="outlined"
                fullWidth
                name="level"
                value={formInput.level || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Qualification Description"}
                variant="outlined"
                fullWidth
                name="description"
                value={formInput.description || ""}
                onChange={handleInputChange}
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
