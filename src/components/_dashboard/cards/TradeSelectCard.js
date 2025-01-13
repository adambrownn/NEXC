import { useContext, useEffect, useState } from "react";
import { Autocomplete, TextField, Typography } from "@material-ui/core";

import axiosInstance from "../../../axiosConfig";

function TradeSelectCard(props) {
  const [trades, setTrades] = useState([]);
  const { selectedTrade, setSelectedTrade } = useContext(props.tradeContext);

  useEffect(() => {
    getTrades();
  }, [props]);

  const getTrades = async () => {
    const resp = await axiosInstance.get("/trades");
    setTrades(resp.data || []);
  };
  return (
    <div>
      <Autocomplete
        id="combo-box-demo"
        fullWidth
        options={trades}
        value={selectedTrade}
        getOptionLabel={(trade) => trade.title}
        onChange={(e, value) => setSelectedTrade(value)}
        renderInput={(params) => (
          <TextField {...params} label="Select a Trade" variant="outlined" />
        )}
      />
      {selectedTrade && (
        <Typography variant="h6" ml={1} color="gray">
          {" "}
          Selected: {selectedTrade?.title}
        </Typography>
      )}
    </div>
  );
}

export default TradeSelectCard;
