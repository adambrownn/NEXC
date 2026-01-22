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
  service: getIcon("ic_kanban"), // Service Portal - using kanban icon (task/management style)
  call: getIcon("ic_chat"), // Using chat icon for calls
  location: getIcon("ic_kanban"), // For centers
  course: getIcon("ic_calendar"), // For courses
  qualification: getIcon("ic_dashboard"), // For qualifications
  test: getIcon("ic_analytics"), // For tests
  task: getIcon("ic_kanban"), // For technician tasks
  trade: getIcon("ic_ecommerce"), // For trades - business/commerce icon
  settings: getIcon("ic_dashboard"), // For system tools
  media: getIcon("ic_kanban"), // For media gallery
};

const sidebarConfig = [
  // DASHBOARD
  // ----------------------------------------------------------------------
  {
    subheader: "Dashboard",
    items: [
      {
        title: "Overview",
        path: PATH_DASHBOARD.root,
        icon: ICONS.dashboard,
      },
      {
        title: "Analytics",
        path: PATH_DASHBOARD.analytics.root,
        icon: ICONS.analytics,
      },
      {
        title: "Sales Portal",
        path: PATH_DASHBOARD.general.sales,
        icon: ICONS.sales,
      },
    ],
  },

  // TECHNICIAN (Staff Role Only)
  // ----------------------------------------------------------------------
  {
    subheader: "My Work",
    roles: ['staff', 'supervisor', 'manager', 'admin', 'superadmin'], // Only show to staff and above
    items: [
      {
        title: "My Tasks",
        path: PATH_DASHBOARD.technician.root,
        icon: ICONS.task,
        roles: ['staff', 'supervisor', 'manager', 'admin', 'superadmin'],
      },
    ],
  },

  // CUSTOMER MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: "Customer Management",
    items: [
      {
        title: "Customer Portal",
        path: PATH_DASHBOARD.general.customers,
        icon: ICONS.ecommerce,
      },
      {
        title: "Chat Management",
        path: PATH_DASHBOARD.service.chat,
        icon: ICONS.chat,
      },
      {
        title: "Call Management",
        path: PATH_DASHBOARD.general.calls,
        icon: ICONS.call,
      },
      {
        title: "Support Tickets",
        path: PATH_DASHBOARD.service.tickets,
        icon: ICONS.mail,
      },
      {
        title: "Service Portal",
        path: PATH_DASHBOARD.service.root,
        icon: ICONS.service,
      },
    ],
  },

  // BOOKINGS & APPLICATIONS
  // ----------------------------------------------------------------------
  {
    subheader: "Bookings & Applications",
    items: [
      {
        title: "Booking",
        path: PATH_DASHBOARD.general.sale,
        icon: ICONS.calendar,
      },
      {
        title: "Applications",
        path: PATH_DASHBOARD.general.applications,
        icon: ICONS.dashboard,
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
        title: "Cards",
        path: PATH_DASHBOARD.cards.root,
        icon: ICONS.kanban,
      },

      // SERVICES : courses
      {
        title: "Courses",
        path: PATH_DASHBOARD.courses.root,
        icon: ICONS.course,
      },

      // SERVICES : tests
      {
        title: "Tests",
        path: PATH_DASHBOARD.tests.root,
        icon: ICONS.test,
      },

      // SERVICES : qualifications
      {
        title: "Qualifications",
        path: PATH_DASHBOARD.qualifications.root,
        icon: ICONS.qualification,
      },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: "Management",
    items: [
      // SERVICES : trades
      {
        title: "Trades",
        path: PATH_DASHBOARD.trades.root,
        icon: ICONS.trade,
      },
      // SERVICES : centers
      {
        title: "Centers",
        path: PATH_DASHBOARD.centers.root,
        icon: ICONS.location,
      },
      // SERVICES : Trade-Service Associations
      {
        title: "Trade Associations",
        path: PATH_DASHBOARD.tradeServiceAssociations.root,
        icon: ICONS.analytics,
      },
      {
        title: "Accounts",
        path: PATH_DASHBOARD.general.users,
        icon: ICONS.user,
      },
      {
        title: "System Tools",
        path: "/dashboard/system-tools",
        icon: ICONS.settings,
        roles: ['superadmin'], // Only superadmin can see this
      },
    ],
  },

  // OTHERS
  // ----------------------------------------------------------------------
  {
    subheader: "Content",
    items: [
      {
        title: "Blog",
        path: PATH_DASHBOARD.general.blog,
        icon: ICONS.blog,
      },
      {
        title: "Media Gallery",
        path: PATH_DASHBOARD.media.root,
        icon: ICONS.media,
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
