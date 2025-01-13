// material
import {
  useTheme,
  experimentalStyled as styled,
} from "@material-ui/core/styles";
import {
  Autocomplete,
  Box,
  Container,
  TextField,
  Typography,
} from "@material-ui/core";
// components
import { MHidden } from "../../@material-extend";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../../axiosConfig";

const RootStyle = styled("div")(({ theme }) => ({
  padding: theme.spacing(10, 0),
  backgroundColor:
    theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
}));

export default function ComponentHero(props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const { setTradeId } = useContext(props.tradeContext);

  const [selectedTrade, setSelectedTrade] = useState();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (props.tradeId && trades.length) {
      const trade = trades.filter((t) => t._id === props.tradeId);
      setSelectedTrade({
        _id: trade[0]._id,
        title: trade[0].title,
      });
    }

    if (props.selectedTrade) {
      setSelectedTrade(props.selectedTrade?._id);
    }
    getTrades();
  }, [props]);

  const getTrades = async () => {
    const resp = await axiosInstance.get("/trades");
    setTrades(resp.data || []);
  };

  const handleSelectTrade = (e, values) => {
    setSelectedTrade(values);
    setTradeId(values?._id || "");
  };

  return (
    <RootStyle>
      <Container
        maxWidth="lg"
        sx={{
          display: { md: "flex" },
          justifyContent: { md: "space-between" },
        }}
      >
        <div>
          <Typography variant="h3" component="h1">
            Trades
          </Typography>

          <Typography
            sx={{
              mt: 3,
              mb: 5,
              color: isLight ? "text.secondary" : "common.white",
            }}
          >
            Type in your Construction Trade or
            <br /> Occupation below to find
            <br /> which card and test is right for your work.
          </Typography>

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
                label="Select a Trade.."
                variant="outlined"
              />
            )}
          />
        </div>

        <MHidden width="mdDown">
          <Box
            component="img"
            src="/static/tradehero.png"
            sx={{ maxHeight: 320 }}
          />
        </MHidden>
      </Container>
    </RootStyle>
  );
}
