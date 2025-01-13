import * as React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";
import ApplicationInfo from "../../forms/ApplicationInfo";
import ApplicationForm from "../../forms/ApplicationForm";

export default function TestsCard(props) {
  return (
    <Grid item xs={12} lg={6}>
      <Card
        sx={{
          minHeight: 200,
        }}
      >
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            validity: {props.validity}
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{
              lineHeight: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {props.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Duration:</strong> {props.duration}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Number of Questions:</strong> {props.numberOfQuestions}
          </Typography>
        </CardContent>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <ApplicationInfo {...props} type="tests" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ApplicationForm {...props} type="tests" />
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}
