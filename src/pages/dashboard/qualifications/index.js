// Export the new enhanced manager as default
export { default } from './QualificationsManager';

/*
// Old component code kept for reference only (commented out)
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

const TestContext = createContext();

const QualificationsCard = (props) => {
  const theme = useTheme();
  const { _id, title, price, level, description } = props.test;

  const { qualificationsList, setQualificationsList } = useContext(TestContext);

  const handleDeleteQual = async (_id) => {
    const delResp = await axiosInstance.delete(`/qualifications/${_id}`);
    if (delResp.data?.err) {
      alert("Unable to Delete");
    } else {
      const _qualifications = qualificationsList.filter(
        (test) => test._id !== _id
      );
      setQualificationsList(_qualifications);
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
            <Typography variant="body2" color="textSecondary" component="p">
              {description}
            </Typography>
            <br />
            Price:{" "}
            <Typography style={{ color: "#1E88E5a0" }}> £ {price}</Typography>
            <br />
            Level:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{level}</Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Link to={`/dashboard/qualifications/create/${_id}`}>
            {" "}
            <Button size="small" color="primary" variant="outlined">
              Edit
            </Button>
          </Link>

          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() => {
              handleDeleteQual(_id);
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};

const Qualifications = (props) => {
  const [qualificationsList, setQualificationsList] = useState([]);
  const [qualificationsListRep, setQualificationsListRep] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/qualifications");
      setQualificationsList(resp.data);
      setQualificationsListRep(resp.data);
    })();
  }, [props]);

  const handFilterByTitle = (e) => {
    if (e.target.value) {
      const newList = qualificationsList.filter(
        (t) =>
          t.title.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
      );
      setQualificationsList(newList);
    } else {
      setQualificationsList(qualificationsListRep);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title={<Searchbar handFilterByTitle={handFilterByTitle} />}>
          <Grid container spacing={gridSpacing} marginTop={2}>
            {qualificationsList?.length > 0 ? (
              qualificationsList.map((test) => (
                <Grid item xs={12} lg={6} key={Math.random()}>
                  <TestContext.Provider
                    value={{
                      qualificationsList,
                      setQualificationsList,
                    }}
                  >
                    <QualificationsCard
                      bgcolor="primary.main"
                      data={{ label: "Blue-500", color: "#2196F3" }}
                      title="primary.main"
                      test={test}
                    />
                  </TestContext.Provider>
                </Grid>
              ))
            ) : (
              <Grid item xs={12} lg={6}>
                <p style={{ color: "#0005" }}>No List found</p>
              </Grid>
            )}
          </Grid>
        </SubCard>
      </Grid>
    </Grid>
  );
};

// Old component kept for reference only - using QualificationsManager instead
// export default Qualifications;
**/
