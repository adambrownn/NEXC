import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Card,
  CardContent,
  Grid,
  CardActionArea,
  CardActions,
  Button,
  Typography,
  useTheme,
} from "@mui/material";

import Searchbar from "../../../layouts/dashboard/Searchbar";
import SubCard from "../../../components/_dashboard/cards/SubCard";
import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";
import { Link } from "react-router-dom";

const CenterContext = createContext();

const CenterCard = (props) => {
  const theme = useTheme();
  const { _id, title, geoLocation, address, postcode, direction } =
    props.center;

  const { centersList, setCentersList } = useContext(CenterContext);

  const handleDeleteCenter = async (_id) => {
    const delResp = await axiosInstance.delete(`/centers/${_id}`);
    if (delResp.data?.err) {
      alert(delResp.data.err);
    } else {
      const _centerList = centersList.filter((center) => center._id !== _id);
      setCentersList(_centerList);
    }
  };

  return (
    <React.Fragment>
      <Card
        sx={{
          border: "1px solid",
          borderColor: theme.palette.primary.light,
          ":hover": {
            boxShadow: "0 4px 24px 0 rgb(34 41 47 / 10%)",
          },
          width: "100%",
        }}
      >
        <CardActionArea>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="Secondary" component="h4">
              {address}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {direction}
            </Typography>
            <br />
            Location (Latitude and Longitude):{" "}
            <Typography style={{ color: "#1E88E5a0" }}>
              {geoLocation?.coordinates?.toString()}
            </Typography>
            Post Code:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{postcode}</Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Link to={`/dashboard/centers/create/${_id}`}>
            <Button size="small" color="primary" variant="outlined">
              Edit
            </Button>
          </Link>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() => {
              handleDeleteCenter(_id);
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};

const CentersList = (props) => {
  const [centersList, setCentersList] = useState([]);
  const [centersListRep, setCentersListRep] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/centers");
      setCentersList(resp.data);
      setCentersListRep(resp.data);
    })();
  }, [props]);

  const handFilterByTitle = (e) => {
    if (e.target.value) {
      const newList = centersList.filter(
        (t) =>
          t.title.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
      );
      setCentersList(newList);
    } else {
      setCentersList(centersListRep);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title={<Searchbar handFilterByTitle={handFilterByTitle} />}>
          <Grid container spacing={gridSpacing} marginTop={2}>
            {centersList?.length > 0 ? (
              centersList.map((center) => (
                <Grid item xs={12} lg={6} key={Math.random()}>
                  <CenterContext.Provider
                    value={{ centersList, setCentersList }}
                  >
                    <CenterCard
                      bgcolor="primary.main"
                      data={{ label: "Blue-500", color: "#2196F3" }}
                      center={center}
                    />
                  </CenterContext.Provider>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <p style={{ color: "#0005" }}>No List found</p>
              </Grid>
            )}
          </Grid>
        </SubCard>
      </Grid>
    </Grid>
  );
};

export default CentersList;
