import { Icon } from "@iconify/react";
import { useRef, useState, useMemo } from "react";
import homeFill from "@iconify/icons-eva/home-fill";
import personFill from "@iconify/icons-eva/person-fill";
import settingsFill from "@iconify/icons-eva/settings-fill";
import { Link as RouterLink } from "react-router-dom";
// material
import { alpha } from "@mui/material/styles";
import {
  Button,
  Box,
  Divider,
  MenuItem,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
// components
import MenuPopover from "../../components/MenuPopover";
import AuthService from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";

// ----------------------------------------------------------------------

// Role-based menu configuration
const getMenuOptions = (userRole) => {
  const isCustomer = !userRole || userRole === 'user' || userRole === 'visitor';
  
  return [
    {
      label: "Home",
      icon: homeFill,
      linkTo: "/",
    },
    isCustomer ? {
      label: 'My Services & Profile',
      icon: personFill,
      linkTo: '/customer/profile'
    } : {
      label: 'Account Settings',
      icon: settingsFill,
      linkTo: '/dashboard/account'
    }
  ];
};

// ----------------------------------------------------------------------

export default function AccountPopover(props) {
  const { user } = useAuth();
  const userRole = user?.accountType || user?.role;
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  // Get menu options based on user role
  const menuOptions = useMemo(() => getMenuOptions(userRole), [userRole]);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      // log me out
      await AuthService.logout();
      window.location.replace("/auth/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            "&:before": {
              zIndex: 1,
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
            },
          }),
        }}
      >
        <Avatar
          src={
            props.profileImage ||
            user?.photoURL ||
            "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
          }
          alt="photoURL"
        />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {props.name || user?.displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {props.email || user?.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {menuOptions.map((option) => (
          <MenuItem
            key={option.label}
            to={option.linkTo}
            component={RouterLink}
            onClick={handleClose}
            sx={{ typography: "body2", py: 1, px: 2.5 }}
          >
            <Box
              component={Icon}
              icon={option.icon}
              sx={{
                mr: 2,
                width: 24,
                height: 24,
              }}
            />

            {option.label}
          </MenuItem>
        ))}

        <Box sx={{ p: 2, pt: 1.5 }}>
          <Button
            fullWidth
            color="inherit"
            variant="outlined"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
