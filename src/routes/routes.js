const express = require("express");
const router = express.Router();

// User routes
router.use("/user", require("../api/v1/user/user.controller"));

// Auth routes
router.use("/auth", require("../api/v1/auth/auth.controller"));

// Blog routes
router.use("/blogs", require("../api/v1/blogs/blog.controller"));

// Card routes
router.use("/cards", require("../api/v1/cards/cards.controller"));

// Center routes
router.use("/centers", require("../api/v1/centers/centers.controller"));

// Course routes
router.use("/courses", require("../api/v1/courses/courses.controller"));

// Other routes (FAQs)
router.use("/others", require("../api/v1/others/others.controller"));

// Qualification routes
router.use("/qualifications", require("../api/v1/qualifications/qualifications.controller"));

// Test routes
router.use("/tests", require("../api/v1/tests/tests.controller"));

// Trade routes
router.use("/trades", require("../api/v1/trades/trades.controller"));

// Trade Service Associations routes
console.log('Registering trade-service-associations routes');
router.use("/trade-service-associations", require("../api/v1/trades/tradeServiceAssociations.controller"));

// Order routes
router.use("/orders", require("../api/v1/orders/orders.controller"));

// Payment routes
const paymentsRoutes = require("../api/v1/payments/payments.controller");

// Mount payments routes
router.use("/payments", paymentsRoutes);

//Customer routes
router.use("/customers", require("../api/v1/customers/customers.controller"));

// Application routes
router.use("/applications", require("../api/v1/applications/applications.controller"));

module.exports = router;