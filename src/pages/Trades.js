// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import {
  Container,
  Divider,
  Grid,
  LinearProgress,
  Typography,
} from "@material-ui/core";
// components
import Page from "../components/Page";
import {
  ComponentCards,
  ComponentCourses,
  ComponentHero,
  ComponentTests,
} from "../components/_external-pages/trades";
import { createContext, useEffect, useState } from "react";
import axiosInstance from "src/axiosConfig";

const TradeContext = createContext();

const RootStyle = styled(Page)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(15),
  [theme.breakpoints.up("md")]: {
    paddingTop: theme.spacing(11),
  },
}));

export default function TradesOverview(props) {
  const [loading, setLoading] = useState({
    cards: false,
    courses: false,
    tests: false,
  });
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);

  const [tradeId, setTradeId] = useState("");
  const [serviceOrder, setServiceOrder] = useState(0);

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let queryTradeId = params.get("tradeid");

    const hash = window.location.hash;
    switch (hash) {
      case "#csl-courses":
        setServiceOrder(1);
        break;

      case "#csl-tests":
        setServiceOrder(2);

        break;

      case "#csl-cards":
      default:
        setServiceOrder(0);
        break;
    }
    if (queryTradeId) {
      setTradeId(queryTradeId);
    }

    (async () => {
      setLoading({ cards: true });
      // get cards list
      const cardsResp = await axiosInstance.get(`/cards?tradeId=${tradeId}`);

      var cardsResult = cardsResp.data?.reduce((unique, o) => {
        if (
          !unique.some(
            (obj) => obj.title === o.title && obj.category === o.category
          )
        ) {
          unique.push(o);
        }
        return unique;
      }, []);
      setCards(cardsResult || []);
      setLoading({ cards: false });

      // get courses list
      setLoading({ courses: true });
      const coursesResp = await axiosInstance.get(
        `/courses?tradeId=${tradeId}`
      );
      var coursesResult = coursesResp.data?.reduce((unique, o) => {
        if (
          !unique.some(
            (obj) => obj.title === o.title && obj.category === o.category
          )
        ) {
          unique.push(o);
        }
        return unique;
      }, []);
      setCourses(coursesResult || []);
      setLoading({ courses: false });

      // get tests list
      setLoading({ tests: true });
      const testsResp = await axiosInstance.get(`/tests?tradeId=${tradeId}`);
      var testsResult = testsResp.data?.reduce((unique, o) => {
        if (
          !unique.some(
            (obj) => obj.title === o.title && obj.category === o.category
          )
        ) {
          unique.push(o);
        }
        return unique;
      }, []);
      setTests(testsResult || []);
      setLoading({ courses: false });
    })();
  }, [tradeId]);

  return (
    <RootStyle title="Components Overview | CSL">
      <TradeContext.Provider value={{ setTradeId }}>
        <ComponentHero tradeId={tradeId} tradeContext={TradeContext} />
      </TradeContext.Provider>
      <Container maxWidth="lg">
        {serviceOrder === 0 && (
          <>
            <div id="csl-cards">
              {loading.cards ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Cards
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentCards tradeId={tradeId} cards={cards} title="Cards" />
              )}
              <Divider />
            </div>

            <div id="csl-courses">
              {loading.courses ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Courses
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentCourses
                  tradeId={tradeId}
                  courses={courses}
                  title="Courses"
                />
              )}
              <Divider />
            </div>

            <div id="csl-tests">
              {loading.tests ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Tests
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentTests tradeId={tradeId} tests={tests} title="Tests" />
              )}
              <Divider />
            </div>
          </>
        )}
        {serviceOrder === 1 && (
          <>
            <div id="csl-courses">
              {loading.courses ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Courses
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentCourses
                  tradeId={tradeId}
                  courses={courses}
                  title="Courses"
                />
              )}
              <Divider />
            </div>

            <div id="csl-cards">
              {loading.cards ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Cards
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentCards tradeId={tradeId} cards={cards} title="Cards" />
              )}
              <Divider />
            </div>

            <div id="csl-tests">
              {loading.tests ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Tests
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentTests tradeId={tradeId} tests={tests} title="Tests" />
              )}
              <Divider />
            </div>
          </>
        )}
        {serviceOrder === 2 && (
          <>
            <div id="csl-tests">
              {loading.tests ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Tests
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentTests tradeId={tradeId} tests={tests} title="Tests" />
              )}
              <Divider />
            </div>

            <div id="csl-cards">
              {loading.cards ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Cards
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentCards tradeId={tradeId} cards={cards} title="Cards" />
              )}
              <Divider />
            </div>

            <div id="csl-courses">
              {loading.courses ? (
                <Grid container spacing={3} sx={{ my: 10 }}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="h5" paragraph>
                      Courses
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <LinearProgress />
                  </Grid>
                </Grid>
              ) : (
                <ComponentCourses
                  tradeId={tradeId}
                  courses={courses}
                  title="Courses"
                />
              )}
              <Divider />
            </div>
          </>
        )}
      </Container>
    </RootStyle>
  );
}
