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
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";

import TradeCard from "./tradeCard";
import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";
import Searchbar from "../../../layouts/dashboard/Searchbar";

const Trades = (props) => {
  const theme = useTheme();

  const [openAddTrade, setOpenAddTrade] = useState(false);
  const [tradesList, setTradesList] = useState([]);
  const [tradesListReplica, setTradesListReplica] = useState([]);
  const [newTradeName, setNewTradeName] = useState("");
  const [selectedTradeId, setSelectedTradeId] = useState("");

  const [showScreenFor, setShowScreenFor] = useState("tradeslist");

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/trades");
      setTradesList(resp.data);
      setTradesListReplica(resp.data);
    })();
  }, [props, showScreenFor]);

  const handleAddTrade = () => {
    setOpenAddTrade(true);
  };

  const handleCloseAddTrade = () => {
    setOpenAddTrade(false);
  };

  const handleAddNewTrade = async () => {
    const resp = await axiosInstance.post("/trades", {
      title: newTradeName,
    });
    if (resp.data?.err) {
      alert(resp.data.err);
    } else {
      setTradesList([...tradesList, resp.data]);
    }
    setOpenAddTrade(false);
    setNewTradeName("");
  };

  const handFilterByTitle = (e) => {
    if (e.target.value) {
      const newList = tradesList.filter(
        (trade) =>
          trade.title.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
      );
      setTradesList(newList);
    } else {
      setTradesList(tradesListReplica);
    }
  };

  return (
    <Card>
      <CardHeader title={<Searchbar handFilterByTitle={handFilterByTitle} />} />
      <Divider />
      <div style={{ position: "relative", textAlign: "center", marginTop: 70 }}>
        <Button variant="contained" color="secondary" onClick={handleAddTrade}>
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
                onChange={(e) => {
                  setNewTradeName(e.target.value);
                }}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleAddNewTrade}
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
              {tradesList?.map((trade) => (
                <Grid
                  item
                  xs={12}
                  lg={12}
                  key={Math.random()}
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
                    action={
                      <IconButton>
                        <ArrowForwardIcon style={{ color: "black" }} />
                      </IconButton>
                    }
                    title={trade.title}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid item xs={12}>
              <IconButton>
                <ArrowBackIcon
                  style={{ color: "black" }}
                  onClick={() => {
                    setSelectedTradeId("");
                    setShowScreenFor("tradeslist");
                  }}
                />
              </IconButton>
              <TradeCard tradeId={selectedTradeId} />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Trades;
