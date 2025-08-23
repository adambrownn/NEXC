import React, { useEffect, useState } from "react";
import { Card, Stack } from "@mui/material";
import CenterDatalist from "../../CenterLocation";

export default function TestCenter(props) {
  const [testCenter, setTestCenter] = useState(null);

  useEffect(() => {
    const storedCenter = JSON.parse(localStorage.getItem("testCenter"));
    if (storedCenter && storedCenter.id) {
      setTestCenter(storedCenter);
    } else {
      setTestCenter(null);
    }
  }, []);

  const handleSelectCenter = (e, center) => {
    if (center) {
      setTestCenter(center);
      localStorage.setItem("testCenter", JSON.stringify(center));
    } else {
      setTestCenter(null);
      localStorage.removeItem("testCenter");
    }
  };

  return (
    <div>
      <Card sx={{ p: 3, m: 2 }}>
        <Stack width="100%" direction={{ xs: "column", sm: "row" }}>
          <CenterDatalist
            handleSelectCenter={handleSelectCenter}
            testCenter={testCenter}
          />
        </Stack>
      </Card>
    </div>
  );
}