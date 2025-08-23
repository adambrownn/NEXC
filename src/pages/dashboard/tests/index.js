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

const TestCard = (props) => {
  const theme = useTheme();
  const {
    _id,
    title,
    price,
    validity,
    duration,
    numberOfQuestions,
    description,
    category,
  } = props.test;

  const { testsList, setTestsList } = useContext(TestContext);

  const handleDeleteTest = async (_id) => {
    const delResp = await axiosInstance.delete(`/tests/${_id}`);
    if (delResp.data?.err) {
      alert("Unable to Delete");
    } else {
      const _testList = testsList.filter((test) => test._id !== _id);
      setTestsList(_testList);
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
            Validity:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{validity}</Typography>
            Category:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{category}</Typography>
            Duration:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{duration}</Typography>
            Number of Questions:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>
              {numberOfQuestions}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Link to={`/dashboard/tests/create/${_id}`}>
            <Button size="small" color="primary" variant="outlined">
              Edit
            </Button>
          </Link>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() => {
              handleDeleteTest(_id);
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};

const Tests = (props) => {
  const [testsList, setTestsList] = useState([]);
  const [testsListRep, setTestsListRep] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/tests");
      setTestsList(resp.data);
      setTestsListRep(resp.data);
    })();
  }, [props]);

  const handFilterByTitle = (e) => {
    if (e.target.value) {
      const newList = testsList.filter(
        (t) =>
          t.title.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
      );
      setTestsList(newList);
    } else {
      setTestsList(testsListRep);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title={<Searchbar handFilterByTitle={handFilterByTitle} />}>
          <Grid container spacing={gridSpacing} marginTop={2}>
            {testsList?.length > 0 ? (
              testsList.map((test) => (
                <Grid item xs={12} lg={6} key={Math.random()}>
                  <TestContext.Provider
                    value={{
                      testsList,
                      setTestsList,
                    }}
                  >
                    <TestCard
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

export default Tests;
