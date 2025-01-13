import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  CardActionArea,
  CardActions,
  Button,
  Typography,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import { Save as SaveIcon } from "@material-ui/icons";

import SubCard from "../../../components/_dashboard/cards/SubCard";
import { gridSpacing } from "../../../utils/constant";
import axiosInstance from "../../../axiosConfig";

const faqContext = createContext();

const FAQCard = (props) => {
  const theme = useTheme();
  const { faqList, setFaqList, setFormInput, setIsEditing } =
    useContext(faqContext);

  if (!props.faq) return null;
  const { _id, title, description, category } = props.faq;

  const handleDeletecourse = async (_id) => {
    const delResp = await axiosInstance.delete(`/others/faqs/${_id}`);
    if (delResp.data?.err) {
      alert(delResp.data.err);
    } else {
      const _faqList = faqList.filter((faq) => faq._id !== _id);
      setFaqList(_faqList);
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
            FAQ Category:{" "}
            <Typography style={{ color: "#1E88E5a0" }}>{category}</Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => {
              setIsEditing(true);
              setFormInput(props.faq);
            }}
          >
            Edit
          </Button>
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

const Faqs = (props) => {
  const [faqList, setFaqList] = useState([]);
  const [formInput, setFormInput] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Read FAQ list
  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/others/faqs");
      setFaqList(resp.data);
      setFormInput({});
    })();
  }, [props]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const handleAddNewfaq = async () => {
    if (Object.entries(formInput).length > 2) {
      const resp = await axiosInstance.post("/others/faqs", formInput);
      if (resp.data?.err) {
        alert(resp.data.err);
      } else {
        setFaqList([...faqList, resp.data]);
        setFormInput({});
      }
    } else {
      alert("All Inputs are required");
    }
  };

  const handleEditCourse = async () => {
    if (Object.entries(formInput).length > 2) {
      const resp = await axiosInstance.put(
        `/others/faqs/${formInput._id}`,
        formInput
      );
      if (resp.data?.err) {
        alert(resp.data?.err);
      } else {
        const _faqList = faqList.filter((faq) => faq._id !== formInput?._id);
        setFaqList([..._faqList, formInput]);
        setFormInput({});
        setIsEditing(false);
      }
    } else {
      alert("All Inputs are required");
    }
  };

  return (
    <Card>
      <CardHeader title="FAQs" />
      <Divider />
      <CardContent>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <SubCard title="Add New FAQ" backgroundColor="#0001">
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <TextField
                    id="outlined-basic"
                    label={"FAQ question"}
                    variant="outlined"
                    fullWidth
                    name="title"
                    value={formInput.title || ""}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item>
                  <TextField
                    id="outlined-basic"
                    label={"FAQ Description"}
                    variant="outlined"
                    fullWidth
                    name="description"
                    value={formInput.description || ""}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel id="cards-id">Category</InputLabel>
                    <Select
                      labelId="cards-id"
                      id="demo-simple-select"
                      name="category"
                      value={formInput.category || ""}
                      onChange={handleInputChange}
                    >
                      <MenuItem value={"test"}>Test</MenuItem>
                      <MenuItem value={"qualification"}>Qualification</MenuItem>
                      <MenuItem value={"course"}>Course</MenuItem>
                      <MenuItem value={"center"}>Center</MenuItem>
                      <MenuItem value={"card"}>Card</MenuItem>
                      <MenuItem value={"trade"}>Trade</MenuItem>
                      <MenuItem value={"payment"}>payment</MenuItem>
                      <MenuItem value={"info"}>info</MenuItem>
                      <MenuItem value={"other"}>other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={isEditing ? handleEditCourse : handleAddNewfaq}
                  >
                    {isEditing ? "Save Edit" : "Save FAQ"}
                  </Button>
                </Grid>
              </Grid>
            </SubCard>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <SubCard title="FAQs List">
              <Grid container spacing={gridSpacing}>
                {faqList?.length > 0 ? (
                  faqList.map((faq) => (
                    <Grid item xs={12} lg={6} key={Math.random()}>
                      <faqContext.Provider
                        value={{
                          faqList,
                          setFaqList,
                          setFormInput,
                          setIsEditing,
                        }}
                      >
                        <FAQCard
                          bgcolor="primary.main"
                          data={{ label: "Blue-500", color: "#2196F3" }}
                          title="primary.main"
                          faq={faq}
                        />
                      </faqContext.Provider>
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
      </CardContent>
    </Card>
  );
};

export default Faqs;
