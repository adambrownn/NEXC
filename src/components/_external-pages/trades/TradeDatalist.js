import { Autocomplete, TextField, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosConfig";
import CartBucketService from "../../../services/bucket";

export default function TradeDatalist(props) {
  const [selectedTrade, setSelectedTrade] = useState();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    setSelectedTrade(props.selectedTrade);
    // fetch trades
    (async () => {
      const resp = await axiosInstance.get("/trades");
      setTrades(resp.data || []);
    })();
  }, [props]);

  const handleSelectTrade = async (e, values) => {
    if (values) {
      setSelectedTrade(values);

      const items = await CartBucketService.getItemsFromBucket();
      items.forEach((item) => {
        // save  trade to correspondant item
        if (item._id === props.itemId) {
          item.trade = {
            _id: values._id,
            title: values.title,
          };
        }
      });
      await CartBucketService.updateItems(items);
    } else {
      const items = await CartBucketService.getItemsFromBucket();
      items.forEach((item) => {
        // save  trade to correspondant item
        if (item._id === props.itemId) {
          delete item.trade;
        }
      });
      await CartBucketService.updateItems(items);
    }
  };

  return (
    <div>
      <Autocomplete
        size="small"
        id="combo-box-demo"
        options={trades}
        value={selectedTrade}
        getOptionLabel={(trade) => trade.title}
        style={{ width: 300 }}
        onChange={handleSelectTrade}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Trade here...(optional) "
            variant="outlined"
          />
        )}
      />
      {selectedTrade && (
        <Typography variant="caption" ml={1} color="gray">
          {" "}
          {selectedTrade?.title}
        </Typography>
      )}
    </div>
  );
}
