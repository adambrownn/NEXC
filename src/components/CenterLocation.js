import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";

export default function CenterDatalist(props) {
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    // fetch centers
    (async () => {
      const resp = await axiosInstance.get("/centers");
      setCenters(resp.data || []);
    })();
  }, [props]);

  const isOptionEqualToValue = (option, value) => {
    return option._id === value._id;
  };

  return (
    <Autocomplete
      id="test centers"
      fullWidth
      options={centers}
      value={props.testCenter}
      getOptionLabel={(test) => test.title || ""}
      onChange={props.handleSelectCenter}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={(params) => (
        <TextField {...params} label="Test Center*" variant="outlined" />
      )}
    />
  );
}
