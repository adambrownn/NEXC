// material
import { experimentalStyled as styled } from "@mui/material/styles";
import {
  Container,
  Divider,
  Grid,
  LinearProgress,
  Typography,
  Box
} from "@mui/material";
// components
import Page from "src/components/Page";
import {
  ComponentCards,
  ComponentCourses,
  ComponentHero,
  ComponentTests,
} from "src/components/_external-pages/trades";
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
    cards: true,
    courses: true,
    tests: true,
  });
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState(null);

  const [tradeId, setTradeId] = useState("");
  const [serviceOrder, setServiceOrder] = useState(0);

  useEffect(() => {
    // Handle URL parameters and hash
    const handleUrlParams = () => {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const queryTradeId = params.get("tradeid");

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
    };

    // Call once on mount
    handleUrlParams();
  }, []); // Empty dependency array as we only want this to run once on mount

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      try {
        setError(null);
        setLoading({ cards: true, courses: true, tests: true });

        // Use trade-specific endpoint when a trade is selected
        const endpoint = tradeId ? `/trades/services/${tradeId}` : '/trades/services';
        console.log('[fetchServices] Fetching from endpoint:', endpoint, 'for tradeId:', tradeId);
        
        const servicesResp = await axiosInstance.get(endpoint);
        console.log('[fetchServices] Services response:', servicesResp.data);
        
        if (!isMounted) return;

        if (!servicesResp.data.success) {
          throw new Error(servicesResp.data.error || 'Failed to fetch services');
        }

        const { data } = servicesResp.data;
        if (!data) {
          throw new Error('No data received from server');
        }

        // Extract services and associated IDs
        const {
          cards = [],
          courses = [],
          tests = [],
          associatedServiceIds = []
        } = data;

        console.log('[fetchServices] Raw data:', {
          cards: cards.length,
          courses: courses.length,
          tests: tests.length,
          associatedIds: associatedServiceIds.length,
          tradeId
        });

        // Process services with proper error handling
        const processServices = (services = []) => {
          if (!Array.isArray(services)) {
            console.warn('Invalid services data received:', services);
            return [];
          }

          const processed = services.reduce((unique, service) => {
            if (!service || typeof service !== 'object') {
              console.warn('Invalid service item:', service);
              return unique;
            }

            const title = service.title || '';
            const category = service.category || '';
            
            // Check for duplicates based on title and category
            if (!unique.some(obj => obj.title === title && obj.category === category)) {
              // Create a new object to avoid mutating the original
              const processedService = {
                ...service,
                title,
                category,
                _id: service._id?.toString() || '',
                // Mark as associated if we have a tradeId and the service is in the associatedServiceIds
                isAssociated: tradeId ? associatedServiceIds.includes(service._id?.toString()) : false
              };
              
              // Include all services when no trade is selected, or only associated ones when a trade is selected
              if (!tradeId || processedService.isAssociated) {
                unique.push(processedService);
              }
            }
            return unique;
          }, []);

          console.log('[fetchServices] Processed services:', {
            input: services.length,
            output: processed.length,
            associatedCount: processed.filter(s => s.isAssociated).length,
            tradeId
          });

          return processed;
        };

        if (isMounted) {
          const processedCards = processServices(cards);
          const processedCourses = processServices(courses);
          const processedTests = processServices(tests);

          console.log('[fetchServices] Final processed services:', {
            cards: processedCards.length,
            courses: processedCourses.length,
            tests: processedTests.length
          });

          setCards(processedCards);
          setCourses(processedCourses);
          setTests(processedTests);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        if (isMounted) {
          setError(error.message || 'Failed to fetch services');
          setCards([]);
          setCourses([]);
          setTests([]);
        }
      } finally {
        if (isMounted) {
          setLoading({ cards: false, courses: false, tests: false });
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [tradeId]);

  return (
    <RootStyle title="Components Overview | CSL">
      <TradeContext.Provider value={{ setTradeId }}>
        <ComponentHero tradeId={tradeId} tradeContext={TradeContext} />
      </TradeContext.Provider>
      <Container maxWidth="lg">
        {error && (
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <Typography color="error" variant="body1">
              {error}
            </Typography>
          </Box>
        )}
        {serviceOrder === 0 && !error && (
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
        {serviceOrder === 1 && !error && (
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
        {serviceOrder === 2 && !error && (
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
