import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

// material-ui
import { makeStyles, styled } from '@mui/styles';
import {
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
  Box,
  // Paper,
  Collapse,
  Button,
  Link,
  alpha,
  Chip,
  Divider
} from "@mui/material";

// project imports
import TestsCard from "./cards-components/TestsCard";

// assets
import ConstructionIcon from '@mui/icons-material/Construction';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import NothingHere from "../../../components/NothingHere";

// style constant
const useStyles = makeStyles((theme) => ({
  profileTab: {
    "& .MuiTabs-flexContainer": {
      borderBottom: "none",
    },
    "& button": {
      color:
        theme.palette.mode === "dark"
          ? theme.palette.grey[600]
          : theme.palette.grey[600],
      minHeight: "auto",
      minWidth: "100%",
      padding: "12px 16px",
    },
    "& button.Mui-selected": {
      color: theme.palette.primary.main,
      background:
        theme.palette.mode === "dark"
          ? theme.palette.dark.main
          : theme.palette.grey[50],
    },
    "& button > span": {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      textAlign: "left",
      justifyContent: "flex-start",
    },
    "& button > span > svg": {
      marginBottom: "0px !important",
      marginRight: "10px",
      marginTop: "10px",
      height: "20px",
      width: "20px",
    },
    "& button > span > div > span": {
      display: "block",
    },
    "& button > span > span + svg": {
      margin: "0px 0px 0px auto !important",
      width: "14px",
      height: "14px",
    },
    "& > div > span": {
      display: "none",
    },
  },
  cardPanels: {
    borderLeft: "1px solid",
    borderLeftColor: theme.palette.mode === "dark" ? "#333d5e" : "#eeeeee",
    height: "100%",
  },
}));

// New styled components
const CategoryDescription = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const InfoPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.info.light, 0.08),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
}));

// SEO-friendly category descriptions with value propositions
const testCategoryDescriptions = {
  operative: {
    title: "CITB Health & Safety Tests for Operatives",
    shortDescription: "Health, safety & environment tests designed for construction site operatives and workers.",
    longDescription: "The CITB Health, Safety & Environment Test for Operatives covers the essential knowledge needed to work safely on construction sites. This test is a requirement for obtaining a CSCS Labourer card and other operative-level cards. It assesses your understanding of health and safety regulations, signs, hazards, and proper workplace practices.",
    benefits: [
      "Required for most CSCS cards",
      "Covers essential site safety knowledge",
      "Recognized across the UK construction industry",
      "Valid for 2 years upon passing"
    ]
  },
  "managers-and-professional": {
    title: "CITB Tests for Managers & Professionals",
    shortDescription: "Advanced health & safety tests for site managers, supervisors, and construction professionals.",
    longDescription: "The Managers and Professionals test is designed for those in supervisory or management positions in construction. This more demanding test covers risk management, legal responsibilities, and advanced safety protocols. Required for CSCS Academically or Professionally Qualified Person cards and management cards.",
    benefits: [
      "Covers management responsibilities and legislation",
      "Required for higher-level CSCS cards",
      "Demonstrates professional competence",
      "Tests knowledge of risk assessment and management"
    ]
  },
  specialist: {
    title: "Specialist CITB Health & Safety Tests",
    shortDescription: "Specialized tests for various trades and disciplines requiring specific safety knowledge.",
    longDescription: "Specialist tests focus on the unique health and safety requirements of particular construction disciplines. These tests contain both core construction safety questions and specialized questions relevant to specific trades, ensuring workers understand the unique hazards in their field.",
    benefits: [
      "Industry-specific safety knowledge",
      "Required for specialized trade cards",
      "Tests knowledge of trade-specific hazards",
      "Demonstrates specialized competence"
    ]
  },
  "cpcs-renewal": {
    title: "CPCS Renewal Tests",
    shortDescription: "Tests required for renewing Construction Plant Competence Scheme (CPCS) cards.",
    longDescription: "CPCS Renewal Tests are specifically designed for plant operators who need to renew their CPCS cards. These tests ensure continued competence in operating specific plant machinery and equipment, covering both general safety and machine-specific knowledge.",
    benefits: [
      "Required for CPCS card renewal",
      "Machine-category specific questions",
      "Ensures continued operator competence",
      "Maintains industry recognition of skills"
    ]
  }
};

// tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `test-tab-${index}`,
    "aria-controls": `test-tabpanel-${index}`,
  };
}

const tabsOption = [
  {
    label: "Operative",
    icon: <ConstructionIcon />,
    category: "operative"
  },
  {
    label: "Managers and Professional",
    icon: <SupervisorAccountIcon />,
    category: "managers-and-professional"
  },
  {
    label: "Specialist",
    icon: <EngineeringIcon />,
    category: "specialist"
  },
  {
    label: "CPCS Renewal",
    icon: <PrecisionManufacturingIcon />,
    category: "cpcs-renewal"
  },
];

export default function ComponentTests(props) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [category, setCategory] = useState("operative");
  const [showDetails, setShowDetails] = useState(false);

  // Handle URL parameters more robustly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCategory = params.get("category")?.toLowerCase();

    // Map clean category values that match our internal structure
    const categoryMap = {
      "operative": 0,
      "managers-and-professional": 1,
      "managers and professional": 1,
      "specialist": 2,
      "cpcs-renewal": 3,
      "cpcs renewal": 3
    };

    if (queryCategory && categoryMap.hasOwnProperty(queryCategory)) {
      const tabIndex = categoryMap[queryCategory];
      setValue(tabIndex);
      setCategory(tabsOption[tabIndex].category);
    }
  }, []);

  // Handle tab changes with improved URL handling
  const handleChange = (event, newValue) => {
    setValue(newValue);
    const newCategory = tabsOption[newValue].category;
    setCategory(newCategory);

    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('category', newCategory);
    window.history.pushState({}, '', url);

    // Reset expanded state when changing categories
    setShowDetails(false);
  };

  const filteredTests = props.tests
    ?.filter(item => !props.tradeId || (props.tradeId && item.isAssociated))
    ?.filter(item => !props.tradeId ? (!category || item.category.toLowerCase() === category.toLowerCase()) : true) || [];

  // In TradeTests.js - around line 195-200 where you're filtering tests
  const enhancedFilteredTests = filteredTests.map(item => {
    // Auto-detect CITB tests and enrich data
    const isCITBTest =
      item.category?.toLowerCase() === 'operative' ||
      item.category?.toLowerCase() === 'managers-and-professional' ||
      item.category?.toLowerCase() === 'specialist' ||
      item.title?.toLowerCase().includes('citb') ||
      item.title?.toLowerCase().includes('health and safety');

    return {
      ...item,
      testProvider: item.testProvider || (isCITBTest ? 'CITB' : undefined)
    };
  });

  // Determine if the current category contains CITB tests
  const hasCITBTests = enhancedFilteredTests.some(test =>
    test.testProvider?.toLowerCase() === 'citb' ||
    test.title?.toLowerCase().includes('citb') ||
    test.title?.toLowerCase().includes('health and safety')
  );

  return (
    <Grid container spacing={3} sx={{ my: 5 }}>
      <Grid item xs={12} sm={3.5}>
        <Typography variant="h5" paragraph>
          {props.title}
        </Typography>
        {!props.tradeId && (
          <Tabs
            value={value}
            onChange={handleChange}
            orientation="vertical"
            className={classes.profileTab}
            variant="scrollable"
            sx={{
              "& button": {
                borderRadius: "5px",
              },
            }}
          >
            {tabsOption.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Grid container direction="row">
                    {tab.icon}
                    <Typography ml={2} variant="subtitle1" color="inherit">
                      {tab.label}
                    </Typography>
                  </Grid>
                }
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        )}
      </Grid>
      <Grid item xs={12} sm={8.5}>
        {/* Category Description Section - Enhanced for SEO */}
        {testCategoryDescriptions[category] && !props.tradeId && (
          <CategoryDescription>
            <Typography variant="h6" gutterBottom>
              {testCategoryDescriptions[category].title}
            </Typography>
            <Typography variant="body2" paragraph>
              {testCategoryDescriptions[category].shortDescription}
            </Typography>

            <Collapse in={showDetails}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" paragraph>
                  {testCategoryDescriptions[category].longDescription}
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Key Benefits
                </Typography>

                <Box sx={{ mt: 1 }}>
                  {testCategoryDescriptions[category].benefits.map((benefit, index) => (
                    <Chip
                      key={index}
                      label={benefit}
                      size="small"
                      sx={{ mr: 1, mb: 1, backgroundColor: alpha('#e3f2fd', 0.8) }}
                    />
                  ))}
                </Box>
              </Box>
            </Collapse>

            <Button
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              endIcon={showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              {showDetails ? 'Less information' : 'More information'}
            </Button>
          </CategoryDescription>
        )}

        {/* CITB Compliance Section - Only shown when displaying CITB tests */}
        {hasCITBTests && !props.tradeId && (
          <Collapse in={showDetails}>
            <InfoPanel>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <InfoOutlinedIcon color="info" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="subtitle2" color="info.main">
                    CITB Test Booking Service
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    NEXC is a third-party booking agent for CITB tests. We provide test booking services with dedicated support throughout the process. All tests are delivered by the Construction Industry Training Board (CITB).
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      For direct booking, you can also visit the official CITB website
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      endIcon={<OpenInNewIcon />}
                      component={Link}
                      href="https://www.citb.co.uk/courses-and-qualifications/construction-skills-health-safety-and-environment-test/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ ml: 1.5, textTransform: 'none' }}
                    >
                      CITB Website
                    </Button>
                  </Box>
                </Box>
              </Box>
            </InfoPanel>
          </Collapse>
        )}

        <CardContent className={classes.cardPanels}>
          <TabPanel value={value} index={value}>
            {/* Tests Count - Added for SEO and user feedback */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {enhancedFilteredTests.length} test{enhancedFilteredTests.length !== 1 ? 's' : ''} available
                {props.tradeId ? ' for your selected trade' : ''}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {enhancedFilteredTests.length > 0 ? (
                enhancedFilteredTests.map(item => (
                  <TestsCard
                    key={item._id}
                    {...item}
                    tradeId={props.tradeId}
                    type="tests"
                  />
                ))
              ) : (
                <Grid item xs={12} lg={12}>
                  <NothingHere />
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </CardContent>
      </Grid>
    </Grid>
  );
}
