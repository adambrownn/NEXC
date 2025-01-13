import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
// material
import { styled } from "@material-ui/styles";
//
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import AuthService from "../../services/auth.service";

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled("div")({
  display: "flex",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up("lg")]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    // check if logged in
    (async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        window.location.replace("/auth/login");
      }
      if (!["superadmin", "admin"].includes(user?.accountType)) {
        alert("We know you are sneaking. You do not have Admin access");
        await AuthService.logout();
        window.location.replace("/auth/login");
      } else {
        setCurrentUser(user);
      }
    })();
  }, []);

  return (
    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} {...currentUser} />
      <DashboardSidebar
        isOpenSidebar={open}
        onCloseSidebar={() => setOpen(false)}
        {...currentUser}
      />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
