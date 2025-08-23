import React, { createContext, useEffect, useState } from "react";
import {
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  FormControlLabel,
  Checkbox,
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

const CoursesCreate = (props) => {
  const [coursesList, setCoursesList] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isEditingId, setIsEditingId] = useState("");
  const [isOnlineBoxChecked, setisOnlineBox] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState();

  const editId = useLocation().pathname?.split("/")[4];

  useEffect(() => {
    if (editId) {
      setIsEditingId(editId);
      (async () => {
        const resp = await axiosInstance.get(`/courses/${editId}`);
        setFormInput(resp.data?.length ? resp.data[0] : {});
        setSelectedTrade(resp.data?.length && resp.data[0].tradeId?._id);
        setisOnlineBox(resp.data[0].isOnline);
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

  const handleIsOnlineCheckBox = (e) => {
    setFormInput({
      ...formInput,
      isOnline: !isOnlineBoxChecked,
    });
    setisOnlineBox(!isOnlineBoxChecked);
  };

  const handleAddNewcourse = async () => {
    if (selectedTrade && Object.entries(formInput).length > 4) {
      formInput.tradeId = selectedTrade;
      const resp = await axiosInstance.post("/courses", formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        setCoursesList([...coursesList, resp.data]);
        setFormInput({});
        setSelectedTrade("");
        alert("Course created successfully");
      }
    } else {
      alert("All Inputs are required");
    }
  };

  const handleEditCourse = async () => {
    if (editId && Object.entries(formInput).length > 4) {
      const resp = await axiosInstance.put(`/courses/${editId}`, formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        const _coursesList = coursesList.filter(
          (course) => course._id !== formInput?._id
        );
        setCoursesList([..._coursesList, formInput]);
        setFormInput({});
        setIsEditingId("");
        alert("Course edited successfully");
      }
    } else {
      alert("All Inputs are required");
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title="Add New Card">
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
                label={"Course title"}
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
                  <MenuItem value={"citb"}>citb</MenuItem>
                  <MenuItem value={"healthandsafety"}>
                    Health and Safety
                  </MenuItem>
                  <MenuItem value={"plantoperations"}>Plant Operations</MenuItem>
                  <MenuItem value={"scaffolding"}>Scaffolding</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField
                id="outlined-basic"
                label={"Course Validity"}
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
                label={"Course Description"}
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
                label={"Course Duration"}
                variant="outlined"
                fullWidth
                name="duration"
                value={formInput.duration || ""}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isOnlineBoxChecked}
                    onChange={handleIsOnlineCheckBox}
                    name="isOnline"
                  />
                }
                label="is Available Online?"
              />
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={isEditingId ? handleEditCourse : handleAddNewcourse}
              >
                {isEditingId ? "Save Edit" : "Save Course"}
              </Button>
            </Grid>
          </Grid>
        </SubCard>
      </Grid>
    </Grid>
  );
};

export default CoursesCreate;
