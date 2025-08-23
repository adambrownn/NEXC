import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Button,
  useTheme,
  Dialog,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import TradeCard from "./tradeCard";
import { gridSpacing } from "../../../utils/constant";
import { salesService } from "../../../services/sales.service";
import Searchbar from "../../../layouts/dashboard/Searchbar";

const Trades = () => {
  const theme = useTheme();

  const [openAddTrade, setOpenAddTrade] = useState(false);
  const [tradesList, setTradesList] = useState([]);
  const [tradesListReplica, setTradesListReplica] = useState([]);
  const [newTradeName, setNewTradeName] = useState("");
  const [selectedTradeId, setSelectedTradeId] = useState("");
  const [showScreenFor, setShowScreenFor] = useState("tradeslist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching trades...');
      const trades = await salesService.getTrades();
      console.log('Received trades:', trades);
      
      // Ensure trades is an array and has required fields
      const validTrades = (Array.isArray(trades) ? trades : [])
        .filter(trade => trade && (trade._id || trade.id) && (trade.title || trade.name))
        .map(trade => ({
          _id: trade._id || trade.id,
          title: trade.title || trade.name,
          ...trade
        }));
      
      console.log('Processed trades:', validTrades);
      setTradesList(validTrades);
      setTradesListReplica(validTrades);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError(err.message || 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [showScreenFor]);

  const handleAddTrade = () => {
    setOpenAddTrade(true);
  };

  const handleCloseAddTrade = () => {
    setOpenAddTrade(false);
    setNewTradeName("");
  };

  const handleAddNewTrade = async () => {
    if (!newTradeName.trim()) {
      setError('Trade name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const resp = await salesService.createTrade({
        title: newTradeName.trim(),
      });
      
      if (resp.error) {
        throw new Error(resp.error);
      }
      
      setTradesList(prevList => [...prevList, resp]);
      setTradesListReplica(prevList => [...prevList, resp]);
      handleCloseAddTrade();
    } catch (err) {
      console.error('Error creating trade:', err);
      setError(err.message || 'Failed to create trade');
    } finally {
      setLoading(false);
    }
  };

  const handFilterByTitle = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm) {
      const filteredList = tradesListReplica.filter(
        (trade) => trade.title.toLowerCase().includes(searchTerm)
      );
      setTradesList(filteredList);
    } else {
      setTradesList(tradesListReplica);
    }
  };

  if (loading && !tradesList.length) {
    return (
      <Card>
        <CardContent style={{ textAlign: 'center', padding: '40px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={<Searchbar handFilterByTitle={handFilterByTitle} />} />
      <Divider />
      
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div style={{ position: "relative", textAlign: "center", marginTop: 70 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleAddTrade}
          disabled={loading}
        >
          Create Trade
        </Button>
      </div>

      <Dialog
        open={openAddTrade}
        onClose={handleCloseAddTrade}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth={true}
      >
        <CardContent>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <TextField
                id="outlined-basic"
                label="Trade Name"
                variant="outlined"
                fullWidth
                value={newTradeName}
                onChange={(e) => {
                  setNewTradeName(e.target.value);
                  setError(null);
                }}
                error={Boolean(error)}
                helperText={error}
                disabled={loading}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleAddNewTrade}
                disabled={loading || !newTradeName.trim()}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Dialog>

      <CardContent>
        <Grid container spacing={gridSpacing}>
          {showScreenFor === "tradeslist" ? (
            <Grid item xs={12}>
              {tradesList.length === 0 ? (
                <Alert severity="info" sx={{ m: 2 }}>
                  No trades found. Create a new trade to get started.
                </Alert>
              ) : (
                tradesList.map((trade) => (
                  <Grid
                    item
                    xs={12}
                    lg={12}
                    key={trade._id || Math.random()}
                    style={{ paddingBottom: 20 }}
                    sx={{
                      ":hover": {
                        boxShadow: "0 4px 24px 0 rgb(34 41 47 / 10%)",
                        border: "1px solid",
                        borderRadius: 8,
                        borderColor: theme.palette.primary.light,
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => {
                      setSelectedTradeId(trade._id);
                      setShowScreenFor("tradeData");
                    }}
                  >
                    <CardHeader
                      title={trade.title}
                      action={
                        <IconButton onClick={() => {
                          setSelectedTradeId(trade._id);
                          setShowScreenFor("tradeData");
                        }}>
                          <ArrowForwardIcon style={{ color: "black" }} />
                        </IconButton>
                      }
                    />
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            <Grid item xs={12}>
              <CardHeader
                title="Trade Details"
                action={
                  <IconButton onClick={() => {
                    setSelectedTradeId("");
                    setShowScreenFor("tradeslist");
                  }}>
                    <ArrowBackIcon style={{ color: "black" }} />
                  </IconButton>
                }
              />
              <TradeCard tradeId={selectedTradeId} />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Trades;
