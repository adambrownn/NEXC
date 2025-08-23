import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Card,
  Grid,
  CardContent,
  CardActionArea,
  CardActions,
  Button,
  Typography,
  useTheme,
} from "@mui/material";

import SubCard from "../../../components/_dashboard/cards/SubCard";
import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";
import { Link } from "react-router-dom";
import Searchbar from "../../../layouts/dashboard/Searchbar";

const CourseContext = createContext();

const CourseCard = (props) => {
  const theme = useTheme();
  const { _id, title, price, validity, duration, isOnline, description } =
    props.course;

  const { coursesList, setCoursesList } = useContext(CourseContext);

  const handleDeletecourse = async (_id) => {
    const delResp = await axiosInstance.delete(`/courses/${_id}`);
    if (delResp.data?.err) {
      alert(delResp.data.err);
    } else {
      const _courseList = coursesList.filter((course) => course._id !== _id);
      setCoursesList(_courseList);
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
            <Typography style={{ color: "#1E88E5a0" }}>
              <strong>Course Price:</strong> £ {price}
            </Typography>
            Course Validity:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{validity}</Typography>
            Course Duration:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{duration} </Typography>
            Available Course Mode:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>
              offline{isOnline && "/online"}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Link to={`/dashboard/courses/create/${_id}`}>
            <Button size="small" color="primary" variant="outlined">
              Edit
            </Button>
          </Link>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() => {
              handleDeletecourse(_id);
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </React.Fragment>
  );
};

const CoursesList = (props) => {
  const [coursesList, setCoursesList] = useState([]);
  const [coursesListRep, setCardsListRep] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/courses");
      setCoursesList(resp.data);
      setCardsListRep(resp.data);
    })();
  }, [props]);

  const handFilterByTitle = (e) => {
    if (e.target.value) {
      const newList = coursesList.filter(
        (t) =>
          t.title.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
      );
      setCoursesList(newList);
    } else {
      setCoursesList(coursesListRep);
    }
  };
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SubCard title={<Searchbar handFilterByTitle={handFilterByTitle} />}>
          <Grid container spacing={gridSpacing} marginTop={2}>
            {coursesList?.length > 0 ? (
              coursesList.map((course) => (
                <Grid item xs={12} lg={6} key={Math.random()}>
                  <CourseContext.Provider
                    value={{ coursesList, setCoursesList }}
                  >
                    <CourseCard
                      bgcolor="primary.main"
                      data={{ label: "Blue-500", color: "#2196F3" }}
                      title="primary.main"
                      course={course}
                    />
                  </CourseContext.Provider>
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

export default CoursesList;
