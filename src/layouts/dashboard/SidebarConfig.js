// routes
import { PATH_DASHBOARD } from "../../routes/paths";
// components
import SvgIconStyle from "../../components/SvgIconStyle";

// ----------------------------------------------------------------------

const getIcon = (name) => (
  <SvgIconStyle
    src={`/static/icons/navbar/${name}.svg`}
    sx={{ width: "100%", height: "100%" }}
  />
);

const ICONS = {
  blog: getIcon("ic_blog"),
  cart: getIcon("ic_cart"),
  chat: getIcon("ic_chat"),
  mail: getIcon("ic_mail"),
  user: getIcon("ic_user"),
  calendar: getIcon("ic_calendar"),
  ecommerce: getIcon("ic_ecommerce"),
  analytics: getIcon("ic_analytics"),
  dashboard: getIcon("ic_dashboard"),
  kanban: getIcon("ic_kanban"),
  sales: getIcon("ic_ecommerce"),
  service: getIcon('eva:tool-fill'),
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: "general",
    items: [
      {
        title: "Sales Portal",
        path: PATH_DASHBOARD.general.sales,
        icon: ICONS.sales,
      },
      // Add Chat Management here for higher visibility
      {
        title: "Chat Management",
        path: PATH_DASHBOARD.service.chat,
        icon: ICONS.chat,
      },
      {
        title: "Service Portal",
        path: PATH_DASHBOARD.service.root,
        icon: ICONS.service,
      },
      {
        title: "Call Management",
        path: PATH_DASHBOARD.general.calls,
        icon: ICONS.call,
      },
      {
        title: "Reserved",
        path: PATH_DASHBOARD.general.customers,
        icon: ICONS.ecommerce,
      },
      {
        title: "Booking",
        path: PATH_DASHBOARD.general.sale,
        icon: ICONS.analytics,
      },
      {
        title: "Applications",
        path: PATH_DASHBOARD.general.applications,
        icon: ICONS.dashboard,
      },
      {
        title: "Accounts",
        path: PATH_DASHBOARD.general.users,
        icon: ICONS.user,
      },
    ],
  },

  // SERVICES
  // ----------------------------------------------------------------------
  {
    subheader: "Management",
    items: [
      // SERVICES : trades
      {
        title: "Trades",
        path: PATH_DASHBOARD.trades.root,
        icon: ICONS.kanban,
      },
      // SERVICES : Trade-Service Associations
      {
        title: "Trade-Service Associations",
        path: PATH_DASHBOARD.tradeServiceAssociations.root,
        icon: ICONS.analytics,
      },
    ],
  },

  // SERVICES
  // ----------------------------------------------------------------------
  {
    subheader: "Services",
    items: [
      // SERVICES : cards
      {
        title: "cards",
        path: PATH_DASHBOARD.cards.root,
        icon: ICONS.kanban,
        children: [
          { title: "list", path: PATH_DASHBOARD.cards.root },
          { title: "create", path: PATH_DASHBOARD.cards.create },
        ],
      },

      // SERVICES : centers
      {
        title: "centers",
        path: PATH_DASHBOARD.centers.root,
        icon: ICONS.analytics,
        children: [
          { title: "list", path: PATH_DASHBOARD.centers.root },
          { title: "create", path: PATH_DASHBOARD.centers.create },
        ],
      },

      // SERVICES : courses
      {
        title: "courses",
        path: PATH_DASHBOARD.courses.root,
        icon: ICONS.cart,
        children: [
          { title: "list", path: PATH_DASHBOARD.courses.root },
          { title: "create", path: PATH_DASHBOARD.courses.create },
        ],
      },

      // SERVICES : qualifications
      {
        title: "qualifications",
        path: PATH_DASHBOARD.qualifications.root,
        icon: ICONS.kanban,
        children: [
          { title: "list", path: PATH_DASHBOARD.qualifications.root },
          { title: "create", path: PATH_DASHBOARD.qualifications.create },
        ],
      },

      // SERVICES : tests
      {
        title: "tests",
        path: PATH_DASHBOARD.tests.root,
        icon: ICONS.blog,
        children: [
          { title: "list", path: PATH_DASHBOARD.tests.root },
          { title: "create", path: PATH_DASHBOARD.tests.create },
        ],
      },
    ],
  },
  // OTHERS
  // ----------------------------------------------------------------------
  {
    subheader: "Others",
    items: [
      {
        title: "Blog",
        path: PATH_DASHBOARD.general.blog,
        icon: ICONS.blog,
      },
      {
        title: "FAQs",
        path: PATH_DASHBOARD.general.others,
        icon: ICONS.chat,
      },
    ],
  },
];

export default sidebarConfig;
