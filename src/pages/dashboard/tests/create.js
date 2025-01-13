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

const CreateTest = (props) => {
  const [testsList, setTestsList] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isEditingId, setIsEditingId] = useState("");
  const [selectedTrade, setSelectedTrade] = useState();

  const editId = useLocation().pathname?.split("/")[4];

  useEffect(() => {
    if (editId) {
      setIsEditingId(editId);
      (async () => {
        const resp = await axiosInstance.get(`/tests/${editId}`);
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

  const handleAddNewTest = async () => {
    if (selectedTrade && Object.entries(formInput).length > 4) {
      formInput.tradeId = selectedTrade;
      const resp = await axiosInstance.post("/tests", formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        setTestsList([...testsList, resp.data]);
        setFormInput({});
        setSelectedTrade("");
        alert("Test created successfully");
      }
    } else {
      alert("All Inputs are required");
    }
  };

  const handleEditTest = async () => {
    if (editId && Object.entries(formInput).length > 4) {
      const resp = await axiosInstance.put(`/tests/${editId}`, formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        const _testList = testsList.filter(
          (test) => test._id !== formInput?._id
        );
        setTestsList([..._testList, formInput]);
        setFormInput({});
        setIsEditingId("");
        alert("Test edited successfully");
      }
    } else {
      alert("All Inputs are required");
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title="Add New Test">
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <TradeContext.Provider
                value={{ selectedTrade, setSelectedTrade }}
              >
                <TradeSelectCard
                  {...selectedTrade}
                  tradeContext={TradeContext}
                />
              </TradeContext.Provider>
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Test title"}
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
                  <MenuItem value={"operative"}>Operative</MenuItem>
                  <MenuItem value={"managers-and-professional"}>
                    Managers and Professional
                  </MenuItem>
                  <MenuItem value={"specialist"}>Specialist</MenuItem>
                  <MenuItem value={"cpcs-renewal"}>CPCS Renewal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Test Validity"}
                variant="outlined"
                fullWidth
                name="validity"
                value={formInput.validity || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Test Description"}
                variant="outlined"
                fullWidth
                name="description"
                value={formInput.description || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Test Duration"}
                variant="outlined"
                fullWidth
                name="duration"
                value={formInput.duration || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Number of Questions"}
                variant="outlined"
                fullWidth
                name="numberOfQuestions"
                value={formInput.numberOfQuestions || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={isEditingId ? handleEditTest : handleAddNewTest}
              >
                {isEditingId ? "Save Edit" : "Save Test"}
              </Button>
            </Grid>
          </Grid>
        </SubCard>
      </Grid>
    </Grid>
  );
};

export default CreateTest;
