import * as React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { CardMedia, Grid } from "@material-ui/core";
import ApplicationInfo from "../../forms/ApplicationInfo";
import ApplicationForm from "../../forms/ApplicationForm";

export default function CardsCard(props) {
  return (
    <Grid item xs={12} lg={4}>
      <Card
        sx={{
          minHeight: 200,
        }}
      >
        {/* <div style={{ height: 10, background: props.color }}></div> */}
        <CardMedia
          style={{ objectFit: "scale-down" }}
          component="img"
          height="150"
          image={"/static/" + props.category + "/" + props.title + ".png"}
          alt={props.title}
        />
        <CardContent>
          <Grid container>
            <Grid item xs={12} sm={10}>
              <Typography variant="body2" color="text.secondary">
                validity: {props.validity}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={2}>
              <ApplicationInfo {...props} type="cards" />
            </Grid>
          </Grid>
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {props.description}
          </Typography>
        </CardContent>
        <ApplicationForm {...props} type="cards" />
      </Card>
    </Grid>
  );
}
