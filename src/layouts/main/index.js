import { useLocation, Outlet } from "react-router-dom";
//
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";
import CartCount from "../../components/CartCount";
import ChatWidget from '../../components/chat/ChatWidget';

// ----------------------------------------------------------------------

export default function MainLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <>
      <MainNavbar />
      <div>
        <Outlet />
      </div>
      {!isDashboard && <CartCount position="global" />}
      <MainFooter />
      {/* Add Chat Widget */}
      <ChatWidget />
    </>
  );
}
