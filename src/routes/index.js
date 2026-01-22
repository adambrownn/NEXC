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

// Authentication
const Login = Loadable(lazy(() => import("../pages/authentication/Login")));
const Register = Loadable(lazy(() => import("../pages/authentication/Register")));
const ResetPassword = Loadable(lazy(() => import("../pages/authentication/ResetPassword")));
const VerifyCode = Loadable(lazy(() => import("../pages/authentication/VerifyCode")));

// Dashboard - Add the missing imports
const BookedOrders = Loadable(lazy(() => import("../pages/BookedOrders")));
const Applications = Loadable(lazy(() => import("../pages/Applications")));
const SalesPortal = Loadable(lazy(() => import("../pages/dashboard/sales/SalesPortal")));

// Service Management
const ServicePortal = Loadable(lazy(() => import("../pages/dashboard/service/ServicePortal")));
const CallManagement = Loadable(lazy(() => import("../pages/dashboard/service/CallManagement")));
const ChatManagement = Loadable(lazy(() => import("../pages/dashboard/service/ChatManagement")));
const SupportTickets = Loadable(lazy(() => import("../pages/dashboard/service/SupportTickets")));

// Technician Portal
const TechnicianPortal = Loadable(lazy(() => import("../pages/dashboard/technician/TechnicianPortal")));
const TaskDetail = Loadable(lazy(() => import("../pages/dashboard/technician/TaskDetail")));

// Management
const Trades = Loadable(lazy(() => import("../pages/dashboard/trades/EnhancedTradesManager")));
const CardsManager = Loadable(lazy(() => import("../pages/dashboard/cards/CardsManager")));
const CardCreate = Loadable(lazy(() => import("../pages/dashboard/cards/Create")));
const TestsManager = Loadable(lazy(() => import("../pages/dashboard/tests/TestsManager")));
const CreateTest = Loadable(lazy(() => import("../pages/dashboard/tests/create")));
const CoursesManager = Loadable(lazy(() => import("../pages/dashboard/courses/CoursesManager")));
const CoursesCreate = Loadable(lazy(() => import("../pages/dashboard/courses/create")));
const CentersManager = Loadable(lazy(() => import("../pages/dashboard/centers/EnhancedCentersManager")));
const CentersCreate = Loadable(lazy(() => import("../pages/dashboard/centers/EnhancedCentersCreate")));
const QualificationsManager = Loadable(lazy(() => import("../pages/dashboard/qualifications/QualificationsManager")));
const CreateQualification = Loadable(lazy(() => import("../pages/dashboard/qualifications/create")));
const FAQCard = Loadable(lazy(() => import("../pages/dashboard/faqs")));

// Blog
const BlogListing = Loadable(lazy(() => import("../pages/BlogListing")));
const BlogPostView = Loadable(lazy(() => import("../pages/BlogPostView")));
const BlogDashboard = Loadable(lazy(() => import("../pages/blog/BlogDashboard")));
const BlogCreate = Loadable(lazy(() => import("../pages/blog/BlogCreate")));
const BlogEdit = Loadable(lazy(() => import("../pages/blog/BlogEdit")));
const BlogPost = Loadable(lazy(() => import("../pages/blog/BlogPost")));
const MediaDashboard = Loadable(lazy(() => import("../pages/dashboard/MediaDashboard")));

// Main Pages
const LandingPage = Loadable(lazy(() => import("../pages/LandingPage")));
const TradesOverview = Loadable(lazy(() => import("../pages/Trades")));
const TradesDirectory = Loadable(lazy(() => import("../pages/TradesDirectory")));
const TradeDetail = Loadable(lazy(() => import("../pages/TradeDetail")));
const QualificationsPage = Loadable(lazy(() => import("../pages/EnhancedQualifications")));
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
const GroupBooking = Loadable(lazy(() => import("../pages/GroupBooking")));
const DashboardOverview = Loadable(lazy(() => import("../pages/dashboard/DashboardOverview")));
const AnalyticsPage = Loadable(lazy(() => import("../pages/dashboard/AnalyticsPage")));
const UserManagement = Loadable(lazy(() => import("../pages/dashboard/UserManagement")));
const CustomerPortal = Loadable(lazy(() => import("../pages/dashboard/CustomerPortal")));
const UserAccount = Loadable(lazy(() => import("../pages/dashboard/UserAccount")));
const SystemTools = Loadable(lazy(() => import("../pages/dashboard/SystemTools")));

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
        { path: "", element: <DashboardOverview /> },
        { path: "overview", element: <DashboardOverview /> }, // Add explicit overview route
        { path: "analytics", element: <AnalyticsPage /> }, // Analytics page
        { path: "admin", element: <Navigate to="/dashboard/overview" replace /> },
        { path: "sales", element: <SalesPortal /> },
        { path: "booked", element: <BookedOrders /> },
        { path: "applications", element: <Applications /> },
        { path: "users", element: <UserManagement /> }, // Add user management route
        { path: "customers", element: <CustomerPortal /> }, // ADDED: Customer portal route
        { path: "account", element: <UserAccount /> }, // ADDED: User account/profile page
        { path: "system-tools", element: <SystemTools /> }, // ADDED: System tools for superadmin

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
            { path: "", element: <CardsManager /> },
            { path: "create", element: <CardCreate /> },
            { path: "create/:cardId", element: <CardCreate /> },
          ],
        },
        {
          path: "tests",
          children: [
            { path: "", element: <TestsManager /> },
            { path: "create", element: <CreateTest /> },
            { path: "create/:testId", element: <CreateTest /> },
          ],
        },
        {
          path: "courses",
          children: [
            { path: "", element: <CoursesManager /> },
            { path: "create", element: <CoursesCreate /> },
            { path: "create/:courseId", element: <CoursesCreate /> },
          ],
        },
        {
          path: "centers",
          children: [
            { path: "", element: <CentersManager /> },
            { path: "create", element: <CentersCreate /> },
            { path: "create/:centerId", element: <CentersCreate /> },
          ],
        },
        {
          path: "qualifications",
          children: [
            { path: "", element: <QualificationsManager /> },
            { path: "create", element: <CreateQualification /> },
            {
              path: "create/:qualificationId",
              element: <CreateQualification />,
            },
          ],
        },
        { path: "faqs", element: <FAQCard /> },
        
        {
          path: "blog",
          children: [
            { path: "", element: <BlogDashboard /> },
            { path: "create", element: <BlogCreate /> },
            { path: ":id", element: <BlogPost /> },
            { path: ":id/edit", element: <BlogEdit /> },
          ],
        },
        { path: "media", element: <MediaDashboard /> },

        { path: "service", element: <ServicePortal /> },
        { path: "calls", element: <CallManagement /> },
        { path: "service/chat", element: <ChatManagement /> },
        { path: "service/tickets", element: <SupportTickets /> },

        // Technician Portal Routes
        { path: "my-tasks", element: <TechnicianPortal /> },
        { path: "my-tasks/:taskId", element: <TaskDetail /> }
      ],
    },

    {
      path: "/trades",
      element: <MainLayout />,
      children: [
        { path: "", element: <TradesOverview /> },
        { path: "directory", element: <TradesDirectory /> },
        { path: ":tradeId", element: <TradeDetail /> }
      ],
    },
    {
      path: "/groupbooking",
      element: <MainLayout />,
      children: [{ path: "", element: <GroupBooking /> }],
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
        { path: "blog", element: <BlogListing /> },
        { path: "blog/:id", element: <BlogPostView /> },
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