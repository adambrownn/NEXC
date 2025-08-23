import { createContext, useEffect, useState } from "react";
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { testModuleAr, testVoiceOver } from "../utils/constant";
import DateTimePickers from "./DatePicker";
import CartBucketService from "../services/bucket";
import CancelIcon from "@mui/icons-material/Cancel";

const DateTimeContext = createContext();

export default function TestFormInputs(props) {
  const [testDate, setTestDate] = useState(null);
  const [testTime, setTestTime] = useState("");
  const [voiceover, setVoiceOver] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleSelect, setModuleSelect] = useState(false);

  useEffect(() => {
  (async () => {
    try {
      const items = await CartBucketService.getItemsFromBucket();
      items.forEach((item) => {
        if (item._id === props._id) {
          console.log('testDate type:', typeof item.testDate, 'value:', item.testDate);
          setTestDate(item.testDate ? new Date(item.testDate) : null);
          setTestTime(item.testTime || "");
          setVoiceOver(item.voiceover || "");
        }
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  })();
}, [props]);

  const handleSaveToItem = async (value, name) => {
  try {
    const items = await CartBucketService.getItemsFromBucket();
    const updatedItems = items.map((item) => {
      if (item._id === props._id) {
        return { 
          ...item, 
          [name]: name === "testDate" ? value.toISOString() : value 
        };
      }
      return item;
    });
    await CartBucketService.updateItems(updatedItems);
  } catch (error) {
    console.error("Error saving item:", error);
  }
};

  const handleSelectModules = (event) => {
    if (selectedModules.length < 5) {
      const {
        target: { value },
      } = event;
      setSelectedModules(typeof value === "string" ? value.split(",") : value);
    } else {
      alert("You could choose upto 5 modules only!");
    }
  };

  return (
    <div>
      <Stack spacing={3}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 3, sm: 2 }}
          >
          <DateTimeContext.Provider
  value={{ testDate, setTestDate, testTime, setTestTime }}
>
  <DateTimePickers
    testDate={testDate}
    setTestDate={(date) => {
      setTestDate(date);
      handleSaveToItem(date, "testDate");
    }}
    testTime={testTime}
    setTestTime={(time) => {
      setTestTime(time);
      handleSaveToItem(time, "testTime");
    }}
    handleSaveToItem={handleSaveToItem}
  />
</DateTimeContext.Provider>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 3, sm: 2 }}
          >
            {["operative", "managers-and-professional", "specialist"].includes(
              props?.category
            ) && (
              <FormControl fullWidth>
                <InputLabel id="voiceover12">Test Voiceover</InputLabel>
                <Select
                  labelId="cards-id"
                  label="Test Voiceover"
                  id="demo-simple-select"
                  name="new-renew"
                  value={voiceover}
                  onChange={(e) => {
                    handleSaveToItem(e.target.value, "voiceover");
                    setVoiceOver(e.target.value);
                  }}
                >
                  {testVoiceOver?.map((voiceover, index) => (
                    <MenuItem key={index} value={voiceover} map={voiceover}>
                      {voiceover}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {props?.category === "cpcs-renewal" && (
              <FormControl fullWidth>
                <InputLabel id="demo-multiple-checkbox-label">
                  Test Module
                </InputLabel>
                <Select
                  onClick={() => setModuleSelect(!moduleSelect)}
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedModules}
                  onChange={handleSelectModules}
                  onClose={() => {
                    handleSaveToItem(selectedModules, "testModules");
                  }}
                  open={moduleSelect}
                  input={<OutlinedInput label="Test Module" />}
                  renderValue={(selected) => selected.join(", ")}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      width: "100%",
                      justifyContent: "flex-end",
                      paddingRight: 10,
                      cursor: "pointer",
                    }}
                    onClick={() => setModuleSelect(false)}
                  >
                    <CancelIcon fontSize="large" />
                  </div>
                  {testModuleAr?.map((moduleItem, idx) => (
                    <MenuItem key={idx} value={moduleItem} dense>
                      <Checkbox
                        checked={selectedModules?.includes(moduleItem)}
                      />
                      <ListItemText primary={moduleItem} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
}
