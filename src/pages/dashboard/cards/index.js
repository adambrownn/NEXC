import React, { useEffect, useState } from "react";
import { Card, CardHeader, Divider, Grid, Typography } from "@material-ui/core";
import MuiTypography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";

import { gridSpacing } from "../../../utils/constant";
import SubCard from "../../../components/_dashboard/cards/SubCard";
import axiosInstance from "../../../axiosConfig";
import { Link } from "react-router-dom";
import Searchbar from "../../../layouts/dashboard/Searchbar";

function CardsList(props) {
  const [cardsList, setCardsList] = useState([]);
  const [cardsListRep, setCardsListRep] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/cards");
      setCardsList(resp.data);
      setCardsListRep(resp.data);
    })();
  }, [props]);

  const handleDeleteCard = async (_id) => {
    const delResp = await axiosInstance.delete(`/cards/${_id}`);
    if (delResp.data.err) {
      alert("Unable to Delete");
    } else {
      const _cardList = cardsList.filter((card) => card._id !== _id);
      setCardsList(_cardList);
    }
  };

  const handFilterByTitle = (e) => {
    if (e.target.value) {
      const newList = cardsList.filter(
        (trade) =>
          trade.title.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
      );
      setCardsList(newList);
    } else {
      setCardsList(cardsListRep);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={<Searchbar handFilterByTitle={handFilterByTitle} />}
          />
          <Divider />
          <ul style={{ listStyle: "none", marginTop: 35 }}>
            {cardsList.length > 0 ? (
              cardsList.map(
                ({
                  _id,
                  title,
                  price,
                  color,
                  category,
                  validity,
                  description,
                }) => (
                  <li
                    style={{
                      width: "45%",
                      position: "relative",
                      float: "left",
                      margin: 20,
                    }}
                    key={_id}
                  >
                    <SubCard title={title} backgroundColor={color}>
                      <Grid container direction="column" spacing={1}>
                        <Grid item>
                          <MuiTypography
                            variant="h5"
                            gutterBottom
                            style={{
                              color: color === "yellow" ? "#000" : "#fff",
                            }}
                          >
                            Validity: {validity}
                          </MuiTypography>
                        </Grid>
                        <Grid item>
                          <MuiTypography
                            variant="h5"
                            gutterBottom
                            style={{
                              color: color === "yellow" ? "#000" : "#fff",
                            }}
                          >
                            Price: £ {price}
                          </MuiTypography>
                        </Grid>
                        <Grid item>
                          <MuiTypography
                            variant="h5"
                            gutterBottom
                            style={{
                              color: color === "yellow" ? "#000" : "#fff",
                            }}
                          >
                            Category: {category ? category : ""}
                          </MuiTypography>
                        </Grid>
                        <Grid item>
                          <MuiTypography
                            variant="p"
                            gutterBottom
                            style={{
                              color: color === "yellow" ? "#000" : "#fff",
                            }}
                          >
                            {description}
                          </MuiTypography>
                        </Grid>

                        <Grid item>
                          <Link to={`/dashboard/cards/create/${_id}`}>
                            <Button color="primary" variant="contained">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteCard(_id)}
                          >
                            Delete
                          </Button>
                        </Grid>
                      </Grid>
                    </SubCard>
                  </li>
                )
              )
            ) : (
              <div style={{ textAlign: "center" }}>
                <Typography>No Card Found</Typography>
              </div>
            )}
          </ul>
        </Card>
      </Grid>
    </Grid>
  );
}

export default CardsList;
