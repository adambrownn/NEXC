import { Autocomplete, TextField } from "@material-ui/core";
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

  return (
    <Autocomplete
      id="test centers"
      fullWidth
      options={centers}
      value={props.testCenter}
      getOptionLabel={(test) => test.title || ""}
      onChange={props.handleSelectCenter}
      renderInput={(params) => (
        <TextField {...params} label="Test Center*" variant="outlined" />
      )}
    />
  );
}
