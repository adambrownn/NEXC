import React, { useState, useEffect } from "react";
import {
  CardContent,
  Grid,
  Typography,
  Card,
  CardHeader,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import { gridSpacing } from "../../../utils/constant";
import { salesService } from "../../../services/sales.service";

export default function TradeCard({ tradeId }) {
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTradeData = async () => {
      if (!tradeId) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await salesService.getTradeServices(tradeId);
        console.log("Trade services response:", response);
        
        if (response && response.success) {
          setCards(response.data.cards || []);
          setCourses(response.data.courses || []);
          setTests(response.data.tests || []);
          setQualifications(response.data.qualifications || []);
        } else {
          throw new Error(response?.error || "Failed to fetch trade data");
        }
      } catch (err) {
        console.error("Error fetching trade data:", err);
        setError(err.message || "An error occurred while fetching trade data");
        // Clear the data states in case of an error
        setCards([]);
        setCourses([]);
        setTests([]);
        setQualifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeData();
  }, [tradeId]);

  if (loading) {
    return (
      <CardContent style={{ textAlign: 'center', padding: '40px' }}>
        <CircularProgress />
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </CardContent>
    );
  }

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
                      key={qualification._id || qualification.id}
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
                  <Typography color="text.secondary">No qualifications found</Typography>
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
                    <Stack
                      key={card._id || card.id}
                      direction="row"
                      alignItems="center"
                    >
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
                  <Typography color="text.secondary">No cards found</Typography>
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
                      key={course._id || course.id}
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
                  <Typography color="text.secondary">No courses found</Typography>
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
                    <Stack
                      key={test._id || test.id}
                      direction="row"
                      alignItems="center"
                    >
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
                  <Typography color="text.secondary">No tests found</Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );
}
