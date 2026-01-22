import { useContext, useEffect, useState } from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";

import axiosInstance from "../../../axiosConfig";

function TradeSelectCard(props) {
  const [trades, setTrades] = useState([]);
  const { selectedTrade = null, setSelectedTrade } = useContext(props.tradeContext);

  useEffect(() => {
  console.log('selectedTrade changed:', selectedTrade);
}, [selectedTrade]);

useEffect(() => {
  getTrades();
}, []);

  const getTrades = async () => {
  try {
    const resp = await axiosInstance.get("/trades");
    console.log('Trades API response:', resp.data);
    // API returns { success: true, data: [...] }, so access resp.data.data
    const tradesData = resp.data?.data || [];
    console.log('Trades data extracted:', tradesData);
    setTrades(tradesData);
  } catch (error) {
    console.error("Error fetching trades:", error);
    setTrades([]);
  }
};
  return (
    <div>
      <Autocomplete
        id="combo-box-demo"
        fullWidth
        options={Array.isArray(trades) ? trades : []}
        value={Array.isArray(trades) ? (trades.find(t => t._id === selectedTrade) || null) : null}
        getOptionLabel={(option) => option?.title || ''}
        onChange={(e, value) => setSelectedTrade(value?._id || '')}
        renderInput={(params) => (
          <TextField {...params} label="Select a Trade" variant="outlined" />
        )}
        isOptionEqualToValue={(option, value) => option?._id === value?._id}
      />
      {selectedTrade && (
        <Typography variant="h6" ml={1} color="gray">
          {" "}
          Selected: {Array.isArray(trades) ? trades.find(t => t._id === selectedTrade)?.title : ''}
        </Typography>
      )}
    </div>
  );
}

export default TradeSelectCard;
