import PropTypes from "prop-types";
import React, { useEffect } from "react";

// material-ui
import { makeStyles } from "@material-ui/styles";
import { CardContent, Grid, Tab, Tabs, Typography } from "@material-ui/core";

// project imports
import CardsCard from "./cards-components/CardsCard";

// assets
import PersonOutlineTwoToneIcon from "@material-ui/icons/PersonOutlineTwoTone";
import DescriptionTwoToneIcon from "@material-ui/icons/DescriptionTwoTone";
import VpnKeyTwoToneIcon from "@material-ui/icons/VpnKeyTwoTone";
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
    icon: <PersonOutlineTwoToneIcon />,
  },
  {
    label: "Skill Cards",
    icon: <DescriptionTwoToneIcon />,
  },
  {
    label: "CISRS Cards",
    icon: <VpnKeyTwoToneIcon />,
  },
];

export default function ComponentCards(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [category, setCategory] = React.useState("cscs");

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let queryCategory = params.get("category");

    if (["cscs", "skill", "cisrs"].includes(queryCategory)) {
      setCategory(queryCategory);
      switch (queryCategory) {
        case "cscs":
          setValue(0);
          break;

        case "skill":
          setValue(1);
          break;

        case "cisrs":
          setValue(2);
          break;

        default:
          setValue(0);
          break;
      }
    }
  }, [props]);

  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        setCategory("cscs");
        break;

      case 1:
        setCategory("skill");
        break;

      case 2:
        setCategory("cisrs");
        break;

      default:
        setCategory("cscs");
        break;
    }
    setValue(newValue);
  };
  return (
    <Grid container spacing={3} sx={{ my: 10 }}>
      <Grid item xs={12} sm={props.tradeId ? 1 : 3.5}>
        <Typography variant="h5" paragraph>
          {props.title}
        </Typography>
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
          {!props.tradeId &&
            tabsOption.map((tab, index) => (
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
      </Grid>
      <Grid item xs={12} sm={props.tradeId ? 11 : 8.5}>
        <CardContent className={classes.cardPanels}>
          <TabPanel value={value} index={value}>
            <Grid container spacing={2}>
              {props.tradeId ? (
                props.cards?.length ? (
                  props.cards?.map((item) => (
                    <CardsCard key={item.name} {...item} type="cards" />
                  ))
                ) : (
                  <Grid item xs={12} lg={12}>
                    <NothingHere />
                  </Grid>
                )
              ) : props.cards?.length ? (
                props.cards
                  ?.filter((item) => item.category === category)
                  ?.map((item) => (
                    <CardsCard key={item.name} {...item} type="cards" />
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
