import PropTypes from "prop-types";
import React, { useEffect } from "react";

// material-ui
import { makeStyles, styled } from '@mui/styles';
import {
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
  Box,
  Paper,
  Collapse,
  Button,
  Link,
  alpha,
  Chip
} from "@mui/material";

// project imports
import CardsCard from "./cards-components/CardsCard";

// assets
import ConstructionIcon from '@mui/icons-material/Construction';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FoundationIcon from '@mui/icons-material/Foundation';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NothingHere from "../../../components/NothingHere";

// style constant
const useStyles = makeStyles((theme) => ({
  profileTab: {
    "& .MuiTabs-flexContainer": {
      borderBottom: "none",
    },
    "& button": {
      color: theme?.palette?.grey?.[600] ?? '#757575',
      minHeight: "auto",
      minWidth: "100%",
      padding: "12px 16px",
    },
    "& button.Mui-selected": {
      color: theme?.palette?.primary?.main ?? '#1976d2',
      background: theme?.palette?.grey?.[50] ?? '#fafafa',
    },
    "& button > span": {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
    },
    "& button > span > svg": {
      marginBottom: "8px",
      width: "22px",
      height: "22px",
    },
    "& button > span > span + svg": {
      width: "14px",
      height: "14px",
      marginLeft: "10px",
      marginBottom: "0px",
    },
  },
  cardPanels: {
    borderLeft: "1px solid",
    borderLeftColor: theme?.palette?.grey?.[200] ?? '#eeeeee',
    height: "100%",
  },
}));

// New styled components for progressive disclosure
const InfoPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.info.light, 0.08),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
}));

const CategoryDescription = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

// Category descriptions for SEO enhancement
const categoryDescriptions = {
  cscs: {
    title: "CSCS Cards - Construction Skills Certification Scheme",
    description: "CSCS cards provide proof that individuals working on construction sites have the required training and qualifications. The cards indicate your level of competence and show employers that you are qualified in your job role.",
    longDescription: "The Construction Skills Certification Scheme (CSCS) was established to improve site safety and reduce accidents by ensuring workers have the necessary training and qualifications. Each card type represents a different level of qualification, from Labourer cards requiring the CITB Health, Safety & Environment Test to Skilled Worker cards requiring NVQ Level 2 qualifications. Cards are valid for 3-5 years depending on type.",
    serviceBenefits: [
      "Expert guidance on selecting the right card type",
      "Document verification and application preparation",
      "Fast-track application processing",
      "Support throughout the application journey"
    ]
  },
  skill: {
    title: "Skill Cards - Specialized Construction Competence",
    description: "Skill cards provide proof of competence for specialized construction trades and are often required to access certain construction sites or perform specific work activities.",
    longDescription: "Skill cards cover specialized areas of construction work that require specific competencies. These include JIB/ECS cards for electrical work, FISS/CSCS for fenestration, and SKILLcard for heating, ventilation, and air conditioning specialists. These cards demonstrate your capability in specialized construction disciplines.",
    serviceBenefits: [
      "Trade-specific advice for your specialty",
      "Assistance with qualification mapping",
      "Documentation preparation and verification",
      "Simplified application process"
    ]
  },
  cisrs: {
    title: "CISRS Cards - Construction Industry Scaffolders Record Scheme",
    description: "CISRS is the industry-recognized certification scheme for scaffolding operations, providing proof of training, qualifications and competence for scaffolders.",
    longDescription: "The Construction Industry Scaffolders Record Scheme (CISRS) has been the industry recognized scaffold training scheme for over 40 years. It provides different card levels from Trainee to Advanced Scaffolder, Supervisor and Inspector. Each level requires specific training courses and on-site experience.",
    serviceBenefits: [
      "Guidance through the scaffolding qualification pathway",
      "Training course recommendations",
      "Simplified renewal process",
      "Support with upgrading card levels"
    ]
  },
  cpcs: {
    title: "CPCS Cards - Construction Plant Competence Scheme",
    description: "CPCS cards demonstrate competence in operating construction plant machinery and equipment, essential for safety and compliance on construction sites.",
    longDescription: "The Construction Plant Competence Scheme (CPCS) helps to prove the skills of plant operators. It covers over 60 categories of plant equipment from excavators to cranes. Cards range from Trained Operator (red card) to Competent Operator (blue card), with specific requirements for practical tests, theory tests, and on-site experience.",
    serviceBenefits: [
      "Category-specific application assistance",
      "Test booking and preparation guidance",
      "Log book verification and processing",
      "Support with category addition to existing cards"
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
    label: "CSCS Cards",
    icon: <ConstructionIcon />,
    category: "cscs"
  },
  {
    label: "Skill Cards",
    icon: <EngineeringIcon />,
    category: "skill"
  },
  {
    label: "CISRS Cards",
    icon: <FoundationIcon />,
    category: "cisrs"
  },
  {
    label: "CPCS Cards",
    icon: <PrecisionManufacturingIcon />,
    category: "cpcs"
  },
];

export default function ComponentCards(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [category, setCategory] = React.useState("cscs");
  const [showDetails, setShowDetails] = React.useState(false);

  // Filter cards based on selected category and trade
  const filteredCards = props.cards
    ?.filter(item => !props.tradeId || (props.tradeId && item.isAssociated))
    ?.filter(item => !props.tradeId ? (!category || item.category.toLowerCase() === category) : true) || [];

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let queryCategory = params.get("category");

    if (queryCategory && ["cscs", "skill", "cisrs", "cpcs"].includes(queryCategory.toLowerCase())) {
      setCategory(queryCategory.toLowerCase());
      switch (queryCategory.toLowerCase()) {
        case "cscs":
          setValue(0);
          break;
        case "skill":
          setValue(1);
          break;
        case "cisrs":
          setValue(2);
          break;
        case "cpcs":
          setValue(3);
          break;
        default:
          setValue(0);
          break;
      }
    }
  }, []);

  const handleChange = (event, newValue) => {
    const newCategory = tabsOption[newValue].category;
    setCategory(newCategory);
    setValue(newValue);

    // Update URL for better SEO and user navigation
    const url = new URL(window.location);
    url.searchParams.set('category', newCategory);
    window.history.pushState({}, '', url);

    // Reset expanded state when changing categories
    setShowDetails(false);
  };

  return (
    <Grid container spacing={3} sx={{ my: 4 }}>
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
        {categoryDescriptions[category] && (
          <CategoryDescription>
            <Typography variant="h6" gutterBottom>
              {categoryDescriptions[category].title}
            </Typography>
            <Typography variant="body2" paragraph>
              {categoryDescriptions[category].description}
            </Typography>

            <Collapse in={showDetails}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" paragraph>
                  {categoryDescriptions[category].longDescription}
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Our {category.toUpperCase()} Card Services
                </Typography>

                <Box sx={{ mt: 1 }}>
                  {categoryDescriptions[category].serviceBenefits.map((benefit, index) => (
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

        {/* Progressive Disclosure for CSCS compliance */}
        {category === "cscs" && (
          <InfoPanel>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <InfoOutlinedIcon color="info" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle2" color="info.main">
                  Application Processing Service
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  We provide application assistance and processing services for CSCS cards.
                  Cards are issued directly by CSCS (Construction Skills Certification Scheme).
                  The standard CSCS card fee is £36.00. Our service fee will be clearly displayed during checkout.
                  {' '}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDetails(!showDetails);
                    }}
                  >
                    {showDetails ? 'Hide details' : 'View service details'}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </InfoPanel>
        )}

        <CardContent className={classes.cardPanels}>
          <TabPanel value={value} index={value}>
            {/* Cards Count - Added for SEO and user feedback */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredCards.length} {category.toUpperCase()} card{filteredCards.length !== 1 ? 's' : ''} available
                {props.tradeId ? ' for your selected trade' : ''}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {filteredCards.length > 0 ? (
                filteredCards.map(item => (
                  <CardsCard
                    key={item._id}
                    {...item}
                    tradeId={props.tradeId}
                    type="cards"
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