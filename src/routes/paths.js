// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

function categoryPath(category, type) {
  return `/trades/?category=${category}#${type}`;
}

const ROOTS_AUTH = "/auth";
const ROOTS_DOCS = "/docs";
const ROOTS_DASHBOARD = "/dashboard";
const CATEGORY_ROOT = "/trades";

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, "/login"),
  register: path(ROOTS_AUTH, "/register"),
  resetPassword: path(ROOTS_AUTH, "/reset-password"),
  verify: path(ROOTS_AUTH, "/verify"),
};

export const PATH_PAGE = {
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  privacypolicy: "/privacy-policy",
  tnc: "/terms-condition",
  refund: "/policies#refund",
  cancellation: "/policies#cancellation",
  return: "/policies#return",
  faqs: "/faqs",
  blog: "/blog",
  page404: "/404",
  page500: "/500",
  trades: "/trades",
  groupbooking: "/groupbooking",
  qualifications: "/qualifications",
};

export const CATEGORY_PATH = {
  root: CATEGORY_ROOT,
  cards: {
    cscs: categoryPath("cscs", "csl-cards"),
    skill: categoryPath("skill", "csl-cards"),
    cisrs: categoryPath("cisrs", "csl-cards"),
    cpcs: categoryPath("cpcs", "csl-cards"),
  },
  courses: {
    citb: categoryPath("citb", "csl-courses"),
    healthandsafety: categoryPath("health-and-safety", "csl-courses"),
    plantoperations: categoryPath("plant-opertions", "csl-courses"),
    scaffolding: categoryPath("scaffolding", "csl-courses"),
  },
  tests: {
    operative: categoryPath("operative", "csl-tests"),
    managers: categoryPath("managers-and-professional", "csl-tests"),
    specialist: categoryPath("specialist", "csl-tests"),
    cpcs: categoryPath("cpcs-renewal", "csl-tests"),
  },
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    customers: path(ROOTS_DASHBOARD, "/reserved"),
    sale: path(ROOTS_DASHBOARD, "/booked"),
    applications: path(ROOTS_DASHBOARD, "/applications"),
    users: path(ROOTS_DASHBOARD, "/users"),
    app: path(ROOTS_DASHBOARD, "/app"),
    sales: path(ROOTS_DASHBOARD, "/sales"),
    management: path(ROOTS_DASHBOARD, "/trades"),
    services: path(ROOTS_DASHBOARD, "/cards"),
    calls: path(ROOTS_DASHBOARD, '/calls'),
    others: path(ROOTS_DASHBOARD, "/faqs"),
    blog: path(ROOTS_DASHBOARD, "/blog"),
  },

  service: {
    root: path(ROOTS_DASHBOARD, "/service"),
    requests: path(ROOTS_DASHBOARD, "/service/requests"),
    technicians: path(ROOTS_DASHBOARD, "/service/technicians"),
    chat: path(ROOTS_DASHBOARD, "/service/chat"),
  },

  trades: {
    root: path(ROOTS_DASHBOARD, "/trades"),
  },

  tradeServiceAssociations: {
    root: path(ROOTS_DASHBOARD, "/trades/service-associations"),
  },

  cards: {
    root: path(ROOTS_DASHBOARD, "/cards"),
    create: path(ROOTS_DASHBOARD, "/cards/create"),
  },
  tests: {
    root: path(ROOTS_DASHBOARD, "/tests"),
    create: path(ROOTS_DASHBOARD, "/tests/create"),
  },
  courses: {
    root: path(ROOTS_DASHBOARD, "/courses"),
    create: path(ROOTS_DASHBOARD, "/courses/create"),
  },
  centers: {
    root: path(ROOTS_DASHBOARD, "/centers"),
    create: path(ROOTS_DASHBOARD, "/centers/create"),
  },
  qualifications: {
    root: path(ROOTS_DASHBOARD, "/qualifications"),
    create: path(ROOTS_DASHBOARD, "/qualifications/create"),
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    new: path(ROOTS_DASHBOARD, '/blog/new'),
    view: path(ROOTS_DASHBOARD, '/blog/:id'),
    edit: path(ROOTS_DASHBOARD, '/blog/:id/edit')
  },
  faq: {
    root: path(ROOTS_DASHBOARD, "/faqs"),
  },
};

export const PATH_DOCS = {
  root: ROOTS_DOCS,
  introduction: path(ROOTS_DOCS, "/introduction"),
  quickstart: path(ROOTS_DOCS, "/quick-start"),
  package: path(ROOTS_DOCS, "/package"),

  // Theme UI
  color: path(ROOTS_DOCS, "/color"),
  typography: path(ROOTS_DOCS, "/typography"),
  icon: path(ROOTS_DOCS, "/icon"),
  shadows: path(ROOTS_DOCS, "/shadows"),
  components: path(ROOTS_DOCS, "/components"),
  settings: path(ROOTS_DOCS, "/settings"),
  tips: path(ROOTS_DOCS, "/tips"),

  // Development
  routing: path(ROOTS_DOCS, "/routing"),
  environmentVariables: path(ROOTS_DOCS, "/environment-variables"),
  stateManagement: path(ROOTS_DOCS, "/state-management"),
  apiCalls: path(ROOTS_DOCS, "/api-calls"),
  analytics: path(ROOTS_DOCS, "/analytics"),
  authentication: path(ROOTS_DOCS, "/authentication"),
  multiLanguage: path(ROOTS_DOCS, "/multi-language"),
  lazyload: path(ROOTS_DOCS, "/lazyload-image"),
  formHelper: path(ROOTS_DOCS, "/form-helper"),

  // Changelog
  support: path(ROOTS_DOCS, "/support"),
  changelog: path(ROOTS_DOCS, "/changelog"),
};
