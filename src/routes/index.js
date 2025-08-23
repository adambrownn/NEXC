import { Suspense, lazy } from "react";
import { Navigate, useRoutes, useLocation } from "react-router-dom";
// layouts
import MainLayout from "../layouts/main";
import DashboardLayout from "../layouts/dashboard";
import LogoOnlyLayout from "../layouts/LogoOnlyLayout";
// guards
import LoadingScreen from "../components/LoadingScreen";

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...(!isDashboard && {
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9999,
              position: "fixed",
            }),
          }}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: "auth",
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "reset-password", element: <ResetPassword /> },
        { path: "verify", element: <VerifyCode /> },
      ],
    },

    {
      path: "dashboard",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <Navigate to="/dashboard/booked" replace /> },
        { path: "admin", element: <Navigate to="/dashboard/booked" replace /> },
        { path: "sales", element: <SalesPortal /> },
        { path: "booked", element: <BookedOrders /> },
        { path: "applications", element: <Applications /> },
        { path: "users", element: <Accounts /> },

        {
          path: "trades",
          element: <Trades />,
        },
        {
          path: "trades/service-associations",
          element: <TradeServiceAssociations />,
        },
        {
          path: "cards",
          children: [
            { path: "", element: <CardsList /> },
            { path: "create", element: <CardCreate /> },
            { path: "create/:cardId", element: <CardCreate /> },
          ],
        },
        {
          path: "tests",
          children: [
            { path: "", element: <Tests /> },
            { path: "create", element: <CreateTest /> },
            { path: "create/:testId", element: <CreateTest /> },
          ],
        },
        {
          path: "courses",
          children: [
            { path: "", element: <CoursesList /> },
            { path: "create", element: <CoursesCreate /> },
            { path: "create/:courseId", element: <CoursesCreate /> },
          ],
        },
        {
          path: "centers",
          children: [
            { path: "", element: <CentersList /> },
            { path: "create", element: <CentersCreate /> },
            { path: "create/:centerId", element: <CentersCreate /> },
          ],
        },
        {
          path: "qualifications",
          children: [
            { path: "", element: <Qualifications /> },
            { path: "create", element: <CreateQualification /> },
            {
              path: "create/:qualificationId",
              element: <CreateQualification />,
            },
          ],
        },
        { path: "faqs", element: <FAQCard /> },
        { path: "blog", element: <Blog /> },

        { path: "service", element: <ServicePortal /> },
        { path: "calls", element: <CallManagement /> },
        { path: "service/chat", element: <ChatManagement /> }
      ],
    },

    {
      path: "/trades",
      element: <MainLayout />,
      children: [{ path: "", element: <TradesOverview /> }],
    },
    {
      path: "/groupbooking",
      element: <MainLayout />,
      children: [{ path: "", element: <TradesOverview /> }],
    },

    {
      path: "/orders",
      element: <LogoOnlyLayout />,
      children: [{ path: "invoice/:orderId", element: <EcommerceInvoice /> }],
    },

    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: "", element: <LandingPage /> },
        { path: "checkout", element: <Checkout /> },
        { path: "qualifications", element: <QualificationsPage /> },
        { path: "about-us", element: <About /> },
        { path: "contact-us", element: <Contact /> },
        { path: "blog", element: <Blog /> },
        { path: "privacy-policy", element: <PrivacyPolicy /> },
        { path: "terms-condition", element: <Tnc /> },
        { path: "faqs", element: <Faqs /> },
        { path: "policies", element: <Policies /> },
        { path: "customer/profile", element: <CustomerProfile /> }
      ],
    },
    {
      path: "*",
      element: <LogoOnlyLayout />,
      children: [
        { path: "500", element: <Page500 /> },
        { path: "404", element: <NotFound /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },

    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

// Authentication
const Login = Loadable(lazy(() => import("../pages/authentication/Login")));
const Register = Loadable(lazy(() => import("../pages/authentication/Register")));
const ResetPassword = Loadable(lazy(() => import("../pages/authentication/ResetPassword")));
const VerifyCode = Loadable(lazy(() => import("../pages/authentication/VerifyCode")));

// Dashboard
const BookedOrders = Loadable(lazy(() => import("../pages/BookedOrders")));
const Applications = Loadable(lazy(() => import("../pages/Applications")));
const Accounts = Loadable(lazy(() => import("../pages/Accounts")));
const SalesPortal = Loadable(lazy(() => import("../pages/dashboard/sales/SalesPortal")));

// Service Management
const ServicePortal = Loadable(lazy(() => import("../pages/dashboard/service/ServicePortal")));
const CallManagement = Loadable(lazy(() => import("../pages/dashboard/service/CallManagement")));
const ChatManagement = Loadable(lazy(() => import("../pages/dashboard/service/ChatManagement")));

// Management
const Trades = Loadable(lazy(() => import("../pages/dashboard/trades")));
const CardsList = Loadable(lazy(() => import("../pages/dashboard/cards")));
const CardCreate = Loadable(lazy(() => import("../pages/dashboard/cards/Create")));
const Tests = Loadable(lazy(() => import("../pages/dashboard/tests")));
const CreateTest = Loadable(lazy(() => import("../pages/dashboard/tests/create")));
const CoursesList = Loadable(lazy(() => import("../pages/dashboard/courses")));
const CoursesCreate = Loadable(lazy(() => import("../pages/dashboard/courses/create")));
const CentersList = Loadable(lazy(() => import("../pages/dashboard/centers")));
const CentersCreate = Loadable(lazy(() => import("../pages/dashboard/centers/create")));
const Qualifications = Loadable(lazy(() => import("../pages/dashboard/qualifications")));
const CreateQualification = Loadable(lazy(() => import("../pages/dashboard/qualifications/create")));
const FAQCard = Loadable(lazy(() => import("../pages/dashboard/faqs")));

// Blog
const Blog = Loadable(lazy(() => import("../pages/Blog")));

// Main Pages
const LandingPage = Loadable(lazy(() => import("../pages/LandingPage")));
const TradesOverview = Loadable(lazy(() => import("../pages/Trades")));
const QualificationsPage = Loadable(lazy(() => import("../pages/Qualifications")));
const EcommerceInvoice = Loadable(lazy(() => import("../pages/EcommerceInvoice")));
const About = Loadable(lazy(() => import("../pages/About")));
const PrivacyPolicy = Loadable(lazy(() => import("../pages/PrivacyPolicy")));
const Tnc = Loadable(lazy(() => import("../pages/TermsCondition")));
const Contact = Loadable(lazy(() => import("../pages/Contact")));
const Faqs = Loadable(lazy(() => import("../pages/Faqs")));
const Policies = Loadable(lazy(() => import("../pages/Policies")));
const TradeServiceAssociations = Loadable(lazy(() => import("../pages/dashboard/trades/TradeServiceAssociations")));
const NotFound = Loadable(lazy(() => import("../pages/Page404")));
const Page500 = Loadable(lazy(() => import("../pages/Page500")));
const CustomerProfile = Loadable(lazy(() => import("../pages/customer/Profile")));
const Checkout = Loadable(lazy(() => import("../pages/Checkout")));