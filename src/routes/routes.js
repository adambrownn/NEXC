const express = require("express");
const app = express();

/**
 * register a User
 * get User details
 */
app.use("/user", require("../api/v1/user/user.controller"));

/**
 * login a User
 */
app.use("/auth", require("../api/v1/auth/auth.controller"));

/**
 * card routes
 */
app.use("/cards", require("../api/v1/cards/cards.controller"));

/**
 * center routes
 */
app.use("/centers", require("../api/v1/centers/centers.controller"));

/**
 * course routes
 */
app.use("/courses", require("../api/v1/courses/courses.controller"));

/**
 * faqs routes
 */
app.use("/others", require("../api/v1/others/others.controller"));

/**
 * qualification routes
 */
app.use(
  "/qualifications",
  require("../api/v1/qualifications/qualifications.controller")
);

/**
 * test routes
 */
app.use("/tests", require("../api/v1/tests/tests.controller"));

/**
 * trade routes
 */
app.use("/trades", require("../api/v1/trades/trades.controller"));

/**
 * manage orders
 */
app.use("/orders", require("../api/v1/orders/orders.controller"));

/**
 * manage applications
 */
app.use(
  "/applications",
  require("../api/v1/applications/applications.controller")
);

module.exports = app;
