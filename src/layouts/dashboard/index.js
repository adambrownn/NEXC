import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
//
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import AuthService from "../../services/auth.service";
import ThemeToggle from "../../components/ThemeToggle";
import DashboardThemeProvider from "../../theme/DashboardThemeProvider";
import { ThemeProvider } from "../../theme/ThemeContext";

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
  const [user, setUser] = useState({});

  useEffect(() => {
    // check if logged in
    (async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        window.location.replace("/auth/login");
      }
      if (!["superadmin", "admin", "sales"].includes(user?.accountType)) {
        alert("You do not have access to this area");
        await AuthService.logout();
        window.location.replace("/auth/login");
      }
      setUser(user);
    })();
  }, []);

  return (
    <ThemeProvider>
      <DashboardThemeProvider>
        <RootStyle>
          <DashboardNavbar onOpenSidebar={() => setOpen(true)} user={user} />
          <DashboardSidebar
            isOpenSidebar={open}
            onCloseSidebar={() => setOpen(false)}
            user={user}
          />
          <MainStyle>
            <Outlet />
          </MainStyle>
          <ThemeToggle />
        </RootStyle>
      </DashboardThemeProvider>
    </ThemeProvider>
  );
}
