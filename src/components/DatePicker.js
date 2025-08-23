import * as React from "react";
import { enGB } from "date-fns/locale";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function DateTimePickers({ testDate, setTestDate, testTime, setTestTime, handleSaveToItem }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
      <DatePicker
        label="Test Date"
        value={testDate || null}
        onChange={(newValue) => {
          handleSaveToItem(newValue, "testDate");
          setTestDate(newValue);
        }}
        slotProps={{ textField: { fullWidth: true } }}
      />
      <FormControl fullWidth>
        <InputLabel id="time-slot-label">Time slot</InputLabel>
        <Select
          labelId="time-slot-label"
          label="Select a Time slot"
          id="time-slot-select"
          name="new-renew"
          value={testTime || ""}
          onChange={(e) => {
            handleSaveToItem(e.target.value, "testTime");
            setTestTime(e.target.value);
          }}
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
          ].map((time) => (
            <MenuItem key={time} value={time}>
              {time}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </LocalizationProvider>
  );
}