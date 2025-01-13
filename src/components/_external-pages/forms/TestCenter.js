import { useEffect, useState } from "react";
// material
import { Card, Stack } from "@material-ui/core";

// routes
import CenterDatalist from "../../CenterLocation";

export default function TestCenter(props) {
  const [testCenter, setTestCenter] = useState({});

  useEffect(() => {
    (async () => {
      setTestCenter(
        (await JSON.parse(localStorage.getItem("testCenter"))) || {}
      );
    })();
  }, [props]);

  const handleSelectCenter = (e, center) => {
    if (center) {
      setTestCenter(center);
      localStorage.setItem("testCenter", JSON.stringify(center));
    } else {
      setTestCenter({});
      localStorage.removeItem("testCenter");
    }
  };

  return (
    <div>
      <Card sx={{ p: 3, m: 2 }}>
        <Stack fullwidth direction={{ xs: "column", sm: "row" }}>
          <CenterDatalist
            handleSelectCenter={handleSelectCenter}
            testCenter={testCenter}
          />
        </Stack>

        {/* <Stack direction={{ xs: "column", sm: "row" }}>
          {Object.entries(testCenter).length > 0 && (
            <>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <Typography component="span" variant="h6">
                    {testCenter.title}
                  </Typography>
                </Typography>
              </CardContent>
            </>
          )}
        </Stack> */}
      </Card>
    </div>
  );
}
