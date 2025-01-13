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
} from "@material-ui/core";
import { testModuleAr, testVoiceOver } from "../utils/constant";
import DateTimePickers from "./DatePicker";
import CartBucketService from "../services/bucket";
import CancelIcon from "@material-ui/icons/Cancel";

const DateTimeContext = createContext();

export default function TestFormInputs(props) {
  const [testDate, setTestDate] = useState("");
  const [testTime, setTestTime] = useState("");
  const [voiceover, setVoiceOver] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleSelect, setModuleSelect] = useState(false);

  useEffect(() => {
    (async () => {
      const items = await CartBucketService.getItemsFromBucket();
      items.forEach((item) => {
        if (item._id === props._id) {
          setTestDate(item.testDate || "");
          setTestTime(item.testTime || "");
          setVoiceOver(item.voiceover || "");
        }
      });
    })();
  }, [props]);

  const handleSaveToItem = async (value, name) => {
    const items = await CartBucketService.getItemsFromBucket();
    items.forEach((item) => {
      if (item._id === props._id) {
        item[name] = value;
      }
    });
    await CartBucketService.updateItems(items);
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
                dateTimeContext={DateTimeContext}
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
                  {testVoiceOver?.map((voiceover) => (
                    <MenuItem value={voiceover} map={voiceover}>
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
