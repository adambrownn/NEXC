import React, { createContext, useEffect, useState } from "react";
import {
  CardContent,
  Grid,
  InputAdornment,
  OutlinedInput,
} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import SaveIcon from "@material-ui/icons/Save";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

import { gridSpacing } from "../../../utils/constant";
import SubCard from "../../../components/_dashboard/cards/SubCard";
import axiosInstance from "../../../axiosConfig";
import TradeSelectCard from "../../../components/_dashboard/cards/TradeSelectCard";
import { useLocation } from "react-router-dom";

const TradeContext = createContext();

function CardCreate() {
  const [cardsList, setCardsList] = useState([]);
  const [isEditingId, setIsEditingId] = useState("");
  const [formInput, setFormInput] = useState({});
  const [selectedTrade, setSelectedTrade] = useState();

  const editId = useLocation().pathname?.split("/")[4];

  useEffect(() => {
    if (editId) {
      setIsEditingId(editId);
      (async () => {
        const resp = await axiosInstance.get(`/cards/${editId}`);
        setFormInput(resp.data?.length ? resp.data[0] : {});
        setSelectedTrade(resp.data?.length && resp.data[0].tradeId);
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

  const handleAddNewCard = async () => {
    if (selectedTrade && Object.entries(formInput).length > 4) {
      formInput.tradeId = selectedTrade._id;
      const resp = await axiosInstance.post("/cards", formInput);
      if (resp.data.err) {
        alert(resp.data.err);
      } else {
        setCardsList([...cardsList, resp.data]);
        setFormInput({});
        setSelectedTrade();
        alert("Card created successfully");
      }
    } else {
      alert("Enter all fields");
    }
  };

  const handleEditCard = async () => {
    if (selectedTrade && Object.entries(formInput).length > 4) {
      formInput.tradeId = selectedTrade._id;
      const resp = await axiosInstance.put(`/cards/${editId}`, formInput);
      if (resp.data.err) {
        alert(resp.data.err);
      } else {
        const _cardsList = cardsList.filter(
          (card) => card._id !== formInput?._id
        );
        setCardsList([..._cardsList, formInput]);
        setFormInput({});
        setSelectedTrade();
        alert("Card edited successfully");
      }
    } else {
      alert("Enter all fields");
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <CardContent>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12} sm={12}>
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
                      label="Card title"
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
                    <TextField
                      id="outlined-basic"
                      label="Card Image"
                      variant="outlined"
                      fullWidth
                      name="image"
                      value={formInput.image || ""}
                      onChange={handleInputChange}
                    />
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
                        <MenuItem value={"cscs"}>CSCS Cards</MenuItem>
                        <MenuItem value={"skill"}>Skill Card</MenuItem>
                        <MenuItem value={"cisrs"}>CISRS Cards</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <TextField
                      id="outlined-basic"
                      label="Card Validity"
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
                      label="Card Description"
                      variant="outlined"
                      fullWidth
                      name="description"
                      value={formInput.description || ""}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel id="demo-simple-select-filled-label">
                        Card Color
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        name="color"
                        value={formInput.color || ""}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {/* For Green Card:
                                            #01783e
                                            #58a380

                                            For Red Card:
                                            #e21445
                                            #ed83a4

                                            For Blue Card:
                                            #357bb9
                                            #87accc

                                            For  Gold Card:
                                            #bb9b5e
                                            #e3d4ab

                                            For Black Card:
                                            #1a1a1a
                                            #c7c2c1

                                            For Grey Card:
                                            #eae9e5
                                            #fcf1a3 */}
                        <MenuItem value={"#e21445"}>Red</MenuItem>
                        <MenuItem value={"#01783e"}>Green</MenuItem>
                        <MenuItem value={"#357bb9"}>Blue</MenuItem>
                        <MenuItem value={"#eae9e5"}>white/grey</MenuItem>
                        <MenuItem value={"#bb9b5e"}>Gold</MenuItem>
                        <MenuItem value={"#1a1a1a"}>black</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={isEditingId ? handleEditCard : handleAddNewCard}
                    >
                      {isEditingId ? "Save Edit" : "Save Card"}
                    </Button>
                  </Grid>
                </Grid>
              </SubCard>
            </Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Grid>
  );
}

export default CardCreate;
