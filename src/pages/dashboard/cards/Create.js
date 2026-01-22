import React, { createContext, useEffect, useState } from "react";
import {
  CardContent,
  Grid,
  InputAdornment,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import SaveIcon from '@mui/icons-material/Save';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import { gridSpacing } from "../../../utils/constant";
import SubCard from "../../../components/_dashboard/cards/SubCard";
import axiosInstance from "../../../axiosConfig";
import MultiTradeSelectCard from "../../../components/_dashboard/cards/MultiTradeSelectCard";
import MediaGallery from "../../../components/_dashboard/blog/MediaGallery";
import { useLocation } from "react-router-dom";

const TradeContext = createContext();

function CardCreate() {
  const [cardsList, setCardsList] = useState([]);
  const [isEditingId, setIsEditingId] = useState("");
  const [formInput, setFormInput] = useState({});
  const [selectedTrades, setSelectedTrades] = useState([]);
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  const editId = useLocation().pathname?.split("/")[4];

  useEffect(() => {
  if (editId) {
    setIsEditingId(editId);
    (async () => {
      const resp = await axiosInstance.get(`/cards/${editId}`);
      const cardData = resp.data?.length ? resp.data[0] : {};
      setFormInput(cardData);
      
      // Handle tradeId - can be array of IDs or objects
      if (cardData.tradeId) {
        if (Array.isArray(cardData.tradeId)) {
          // If it's already an array, check if they're objects or just IDs
          const trades = cardData.tradeId.map(trade => 
            typeof trade === 'object' ? trade : { _id: trade, title: 'Loading...' }
          );
          setSelectedTrades(trades);
        } else if (typeof cardData.tradeId === 'object') {
          // Single trade object
          setSelectedTrades([cardData.tradeId]);
        } else {
          // Single trade ID
          setSelectedTrades([{ _id: cardData.tradeId, title: 'Loading...' }]);
        }
      } else {
        setSelectedTrades([]);
      }
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

  const handleSelectCardImage = (media) => {
    setFormInput(prev => ({
      ...prev,
      image: media.url
    }));
    setShowMediaGallery(false);
  };

  const handleAddNewCard = async () => {
  if (selectedTrades.length > 0 && Object.entries(formInput).length > 4) {
    formInput.tradeId = selectedTrades.map(trade => trade._id);
    const resp = await axiosInstance.post("/cards", formInput);
    if (resp.data.err) {
      alert(resp.data.err);
    } else {
      setCardsList([...cardsList, resp.data]);
      setFormInput({});
      setSelectedTrades([]);
      alert("Card created successfully");
    }
  } else {
    alert("Enter all fields and select at least one trade");
  }
};

  const handleEditCard = async () => {
  if (selectedTrades.length > 0 && Object.entries(formInput).length > 4) {
    formInput.tradeId = selectedTrades.map(trade => trade._id);
    const resp = await axiosInstance.put(`/cards/${editId}`, formInput);
    if (resp.data.err) {
      alert(resp.data.err);
    } else {
      const _cardsList = cardsList.filter(
        (card) => card._id !== formInput?._id
      );
      setCardsList([..._cardsList, formInput]);
      setFormInput({});
      setSelectedTrades([]);
      alert("Card edited successfully");
    }
  } else {
    alert("Enter all fields and select at least one trade");
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
                      value={{ selectedTrades, setSelectedTrades }}
                    >
                      <MultiTradeSelectCard
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
                    <Box>
                      <InputLabel sx={{ mb: 1 }}>Card Image</InputLabel>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {formInput.image && (
                          <Box
                            component="img"
                            src={formInput.image}
                            alt="Card preview"
                            sx={{
                              width: 100,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'divider'
                            }}
                          />
                        )}
                        <Stack spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<PhotoLibraryIcon />}
                            onClick={() => setShowMediaGallery(true)}
                          >
                            Select Image
                          </Button>
                          <TextField
                            size="small"
                            label="Or enter URL"
                            fullWidth
                            name="image"
                            value={formInput.image || ""}
                            onChange={handleInputChange}
                          />
                        </Stack>
                      </Stack>
                    </Box>
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

      <Dialog
        open={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Card Image</DialogTitle>
        <DialogContent>
          <MediaGallery
            onSelectMedia={handleSelectCardImage}
            selectionMode={true}
            allowMultiple={false}
            allowedTypes={['image']}
            category="cover"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMediaGallery(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default CardCreate;
