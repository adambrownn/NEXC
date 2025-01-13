import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useTheme,
} from "@material-ui/core";

const SubCard = (props) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: theme.palette.primary.light,
        ":hover": {
          boxShadow: "0 4px 24px 0 rgb(34 41 47 / 10%)",
        },
        background: props.backgroundColor || "none",
        color: props.color || "#000",
      }}
    >
      {!props.darkTitle && props.title && (
        <CardHeader
          title={<Typography variant="h5">{props.title}</Typography>}
          action={props.secondary}
        />
      )}
      {props.darkTitle && props.title && (
        <CardHeader
          title={<Typography variant="h4">{props.title}</Typography>}
        />
      )}
      {props.title && <Divider sx={{ borderColor: "primary.light" }} />}
      <CardContent className={props.contentClass}>{props.children}</CardContent>
    </Card>
  );
};

export default SubCard;
