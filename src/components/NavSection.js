import { useState } from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { HashLink as HLink } from "react-router-hash-link";
import {
  NavLink as RouterLink,
  matchPath,
  useLocation,
} from "react-router-dom";
import arrowIosForwardFill from "@iconify/icons-eva/arrow-ios-forward-fill";
import arrowIosDownwardFill from "@iconify/icons-eva/arrow-ios-downward-fill";
// material
import {
  alpha,
  useTheme,
  styled,
} from "@mui/material/styles";
import {
  Box,
  List,
  ListItem,
  Collapse,
  ListItemText,
  ListItemIcon,
  ListSubheader,
} from "@mui/material";

// ----------------------------------------------------------------------

const ListSubheaderStyle = styled((props) => (
  <ListSubheader disableSticky disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.overline,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1.5),
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.08em',
  
  // Mobile optimizations
  [theme.breakpoints.down('md')]: {
    paddingLeft: theme.spacing(4),
    marginTop: theme.spacing(2.5),
    fontSize: '0.65rem',
  },
  
  // Tablet optimizations
  [theme.breakpoints.between('md', 'xl')]: {
    paddingLeft: theme.spacing(4.5),
    fontSize: '0.6875rem',
  },
}));

const ListItemStyle = styled((props) => (
  <ListItem button disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.body2,
  // Touch-friendly minimum height from breakpoints
  minHeight: theme.breakpoints?.values?.minTarget || 44,
  height: 'auto',
  position: "relative",
  textTransform: "capitalize",
  paddingTop: theme.spacing(1.25),
  paddingBottom: theme.spacing(1.25),
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.text.secondary,
  borderRadius: theme.spacing(1),
  margin: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
  transition: theme.transitions.create(['background-color', 'color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  
  // Enhanced touch interactions
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(2px)',
  },
  
  '&:active': {
    transform: 'translateX(2px) scale(0.98)',
  },
  
  // Mobile-specific optimizations
  [theme.breakpoints.down('md')]: {
    minHeight: theme.breakpoints?.values?.minTarget || 44,
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(4),
    fontSize: '0.9rem',
  },
  
  // Tablet optimizations
  [theme.breakpoints.between('md', 'xl')]: {
    paddingLeft: theme.spacing(4.5),
    fontSize: '0.875rem',
  },
  
  "&:before": {
    top: 0,
    left: 0,
    width: 3,
    bottom: 0,
    content: "''",
    display: "none",
    position: "absolute",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const ListItemIconStyle = styled(ListItemIcon)(({ theme }) => ({
  width: 24,
  height: 24,
  minWidth: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(2),
  color: 'inherit',
  
  // Enhanced mobile icon sizing
  [theme.breakpoints.down('md')]: {
    width: 26,
    height: 26,
    minWidth: 26,
  },
  
  '& svg, & .iconify': {
    width: '100%',
    height: '100%',
  },
}));

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func,
};

function NavItem({ item, active }) {
  const theme = useTheme();
  const isActiveRoot = active(item.path);
  const { title, path, icon, info, children } = item;
  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const activeRootStyle = {
    color: "primary.main",
    fontWeight: "fontWeightMedium",
    bgcolor: alpha(theme.palette.primary.main, 0.12),
    transform: 'translateX(2px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.24)}`,
    "&:before": { display: "block" },
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.16),
      transform: 'translateX(2px)',
    },
  };

  const activeSubStyle = {
    color: "primary.main",
    fontWeight: "fontWeightMedium",
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(2px)',
  };

  if (children) {
    return (
      <>
        <ListItemStyle
          onClick={handleOpen}
          sx={{
            ...(isActiveRoot && activeRootStyle),
          }}
        >
          <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
          <ListItemText disableTypography primary={title} />
          {info && info}
          <Box
            component={Icon}
            icon={open ? arrowIosDownwardFill : arrowIosForwardFill}
            sx={{ width: 16, height: 16, ml: 1 }}
          />
        </ListItemStyle>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((item) => {
              const { title, path } = item;
              const isActiveSub = active(path);

              return (
                <ListItemStyle
                  key={title}
                  component={RouterLink}
                  to={path}
                  sx={{
                    ...(isActiveSub && activeSubStyle),
                  }}
                >
                  <ListItemIconStyle>
                    <Box
                      component="span"
                      sx={{
                        width: 4,
                        height: 4,
                        display: "flex",
                        borderRadius: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "text.disabled",
                        transition: (theme) =>
                          theme.transitions.create("transform"),
                        ...(isActiveSub && {
                          transform: "scale(2)",
                          bgcolor: "primary.main",
                        }),
                      }}
                    />
                  </ListItemIconStyle>
                  <ListItemText disableTypography primary={title} />
                </ListItemStyle>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItemStyle
      component={HLink}
      to={path}
      sx={{
        ...(isActiveRoot && activeRootStyle),
      }}
    >
      <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={title} />
      {info && info}
    </ListItemStyle>
  );
}

NavSection.propTypes = {
  navConfig: PropTypes.array,
};

export default function NavSection({ navConfig, ...other }) {
  const { pathname } = useLocation();
  const match = (path) =>
    path ? !!matchPath({ path, end: true }, pathname) : false;

  return (
    <Box {...other}>
      {navConfig.map((list) => {
        const { subheader, items } = list;
        return (
          <List key={subheader} disablePadding>
            <ListSubheaderStyle>{subheader}</ListSubheaderStyle>
            {items.map((item) => (
              <NavItem key={item.title} item={item} active={match} />
            ))}
          </List>
        );
      })}
    </Box>
  );
}
