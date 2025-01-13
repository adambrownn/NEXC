import * as React from "react";
import TextField from "@mui/material/TextField";
import { enGB } from "date-fns/locale";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

export default function DateTimePickers(props) {
  const { testDate, setTestDate, testTime, setTestTime } = React.useContext(
    props.dateTimeContext
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
      <DatePicker
        label="Test Date"
        value={testDate}
        onChange={(newValue) => {
          props.handleSaveToItem(newValue, "testDate");
          setTestDate(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Time slot</InputLabel>
        <Select
          labelId="cards-id"
          label="Select a Time slot"
          id="demo-simple-select"
          name="new-renew"
          onChange={(e) => {
            props.handleSaveToItem(e.target.value, "testTime");
            setTestTime(e.target.value);
          }}
          value={testTime}
        >
          {[
            "07:00 AM - 08:00 AM",
            "08:00 AM - 09:00 AM",
            "09:00 AM - 10:00 AM",
            "10:00 AM - 11:00 AM",
            "11:00 AM - 12:00 PM",
            "12:00 PM - 13:00 PM",
            "13:00 PM - 14:00 PM",
            "14:00 PM - 15:00 PM",
            "15:00 PM - 16:00 PM",
            "16:00 PM - 17:00 PM",
            "17:00 PM - 18:00 PM",
            "18:00 PM - 19:00 PM",
          ].map((value, index) => (
            <MenuItem value={value} key={index}>
              {value}{" "}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </LocalizationProvider>
  );
}
