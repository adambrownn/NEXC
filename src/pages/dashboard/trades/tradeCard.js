import React, { useState, useEffect } from "react";
import {
  CardContent,
  Grid,
  Typography,
  Card,
  CardHeader,
  Stack,
  Divider,
} from "@material-ui/core";

import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";

export default function TradeCard(props) {
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get(`/trades/services/${props.tradeId}`);
      setCards(resp.data[0]);
      setCourses(resp.data[1]);
      setTests(resp.data[2]);
      setQualifications(resp.data[3]);
    })();
  }, [props]);

  return (
    <React.Fragment>
      <CardContent>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardHeader title="Qualifications" />
              <Divider />
              <Stack spacing={2} sx={{ p: 3 }}>
                {qualifications?.length > 0 ? (
                  qualifications.map((qualification) => (
                    <Stack
                      key={qualification.title}
                      direction="row"
                      alignItems="center"
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        noWrap
                      >
                        {qualification.title}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <p style={{ color: "#0005" }}>No Course found</p>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardHeader title="Courses" />
              <Divider />
              <Stack spacing={2} sx={{ p: 3 }}>
                {courses?.length > 0 ? (
                  courses.map((course) => (
                    <Stack
                      key={course.title}
                      direction="row"
                      alignItems="center"
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        noWrap
                      >
                        {course.title}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <p style={{ color: "#0005" }}>No Course found</p>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardHeader title="Tests" />
              <Divider />
              <Stack spacing={2} sx={{ p: 3 }}>
                {tests?.length > 0 ? (
                  tests.map((test) => (
                    <Stack key={test.title} direction="row" alignItems="center">
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        noWrap
                      >
                        {test.title}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <p style={{ color: "#0005" }}>No Course found</p>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardHeader title="Cards" />
              <Divider />
              <Stack spacing={2} sx={{ p: 3 }}>
                {cards?.length > 0 ? (
                  cards.map((card) => (
                    <Stack key={card.title} direction="row" alignItems="center">
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        noWrap
                      >
                        {card.title}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <p style={{ color: "#0005" }}>No Course found</p>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );
}
