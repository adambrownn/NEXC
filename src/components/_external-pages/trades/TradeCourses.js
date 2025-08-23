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
  Collapse,
  Button,
  Link,
  alpha,
  Chip,
  Divider
} from "@mui/material";

import ConstructionIcon from '@mui/icons-material/Construction';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import FoundationIcon from '@mui/icons-material/Foundation';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CoursesCard from "./cards-components/CoursesCard";
import NothingHere from "../../../components/NothingHere";

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
const courseCategoryDescriptions = {
  "citb": {
    title: "CITB Courses & Training",
    shortDescription: "Official Construction Industry Training Board courses covering essential construction skills and safety protocols.",
    longDescription: "The CITB (Construction Industry Training Board) offers a wide range of courses designed to improve skills and safety standards across the UK construction industry. These courses are developed by industry experts and are recognized throughout the construction sector, providing valuable qualifications for workers at all levels.",
    benefits: [
      "Industry-recognized qualifications",
      "Developed by construction experts",
      "Required for many site roles",
      "Enhances employability in construction"
    ]
  },
  "health-and-safety": {
    title: "Health & Safety Courses",
    shortDescription: "Comprehensive health and safety training programs to ensure compliance with regulations and create safer workplaces.",
    longDescription: "Our health and safety courses cover essential knowledge and practical skills needed to create and maintain safe construction environments. From basic awareness to specialized risk management, these courses are designed to help companies meet their legal obligations while protecting their workforce.",
    benefits: [
      "Reduces workplace accidents",
      "Ensures regulatory compliance",
      "Improves safety culture",
      "Provides legal protection"
    ]
  },
  "plant-operations": {
    title: "Plant Operations Courses",
    shortDescription: "Specialized training for operating construction plant and machinery safely and effectively.",
    longDescription: "Plant operations courses provide comprehensive training in the safe and efficient operation of construction machinery and equipment. These courses combine theoretical knowledge with practical skills, covering everything from daily maintenance checks to advanced operating techniques.",
    benefits: [
      "Equipment-specific certifications",
      "Hands-on practical training",
      "Reduces equipment damage",
      "Improves operational efficiency"
    ]
  },
  "scaffolding": {
    title: "Scaffolding Courses",
    shortDescription: "Professional scaffolding training for safe erection, inspection, and dismantling of scaffold structures.",
    longDescription: "Our scaffolding courses provide comprehensive training in all aspects of scaffold work, from basic components to complex structures. These courses ensure workers can erect, inspect, modify, and dismantle scaffolding systems safely and in accordance with current regulations.",
    benefits: [
      "Meets CISRS requirements",
      "Covers all scaffolding types",
      "Progressive qualification path",
      "Focused on practical skills"
    ]
  }
};

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

// tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const tabsOption = [
  {
    label: "CITB",
    icon: <ConstructionIcon />,
    category: "citb"
  },
  {
    label: "Health and Safety",
    icon: <HealthAndSafetyIcon />,
    category: "health-and-safety"
  },
  {
    label: "Plant Operations",
    icon: <PrecisionManufacturingIcon />,
    category: "plant-operations"
  },
  {
    label: "Scaffolding",
    icon: <FoundationIcon />,
    category: "scaffolding"
  },
];

export default function ComponentCourses(props) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [category, setCategory] = useState("citb");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCategory = params.get("category")?.toLowerCase();

    // Map clean category values that match our internal structure
    const categoryMap = {
      "citb": 0,
      "health-and-safety": 1,
      "health and safety": 1,
      "plant-operations": 2,
      "plant operations": 2,
      "scaffolding": 3
    };

    if (queryCategory && categoryMap.hasOwnProperty(queryCategory)) {
      const tabIndex = categoryMap[queryCategory];
      setValue(tabIndex);
      setCategory(tabsOption[tabIndex].category);
    }
  }, []);

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

  const filteredCourses = props.courses
    ?.filter(item => !props.tradeId || (props.tradeId && item.isAssociated))
    ?.filter(item => !props.tradeId ? (!category || item.category.toLowerCase() === category) : true) || [];

  // Enhance course data with provider information
  const enhancedCourses = filteredCourses.map(course => {
    // Auto-detect CITB courses
    const isCITBCourse =
      course.category?.toLowerCase() === 'citb' ||
      course.title?.toLowerCase().includes('citb') ||
      course.title?.toLowerCase().includes('construction industry training');

    return {
      ...course,
      courseProvider: course.courseProvider || (isCITBCourse ? 'CITB' : undefined)
    };
  });

  // Determine if the current category contains CITB courses
  const hasCITBCourses = category === 'citb' || enhancedCourses.some(course =>
    course.courseProvider?.toLowerCase() === 'citb' ||
    course.title?.toLowerCase().includes('citb')
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
        {courseCategoryDescriptions[category] && !props.tradeId && (
          <CategoryDescription>
            <Typography variant="h6" gutterBottom>
              {courseCategoryDescriptions[category].title}
            </Typography>
            <Typography variant="body2" paragraph>
              {courseCategoryDescriptions[category].shortDescription}
            </Typography>

            <Collapse in={showDetails}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" paragraph>
                  {courseCategoryDescriptions[category].longDescription}
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Key Benefits
                </Typography>

                <Box sx={{ mt: 1 }}>
                  {courseCategoryDescriptions[category].benefits.map((benefit, index) => (
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

        {/* CITB Compliance Section - Only shown when displaying CITB courses */}
        {hasCITBCourses && !props.tradeId && (
          <Collapse in={showDetails}>
            <InfoPanel>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <InfoOutlinedIcon color="info" sx={{ mt: 0.3 }} />
                <Box>
                  <Typography variant="subtitle2" color="info.main">
                    CITB Course Booking Service
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    NEXC provides booking services for CITB courses with dedicated support throughout the process. All courses are delivered by the Construction Industry Training Board (CITB) or their approved training providers.
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
                      href="https://www.citb.co.uk/courses-and-qualifications/"
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
            {/* Courses Count - Added for SEO and user feedback */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {enhancedCourses.length} course{enhancedCourses.length !== 1 ? 's' : ''} available
                {props.tradeId ? ' for your selected trade' : ''}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {enhancedCourses.length > 0 ? (
                enhancedCourses.map(item => (
                  <CoursesCard
                    key={item._id}
                    {...item}
                    tradeId={props.tradeId}
                    type="courses"
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
