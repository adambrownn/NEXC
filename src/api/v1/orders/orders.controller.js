const express = require("express");
const router = express.Router();
const ordersService = require("./orders.service");
const { extractTokenDetails } = require("../../../common/services/auth.service");

// Create order
router.post("/", extractTokenDetails, ordersService.createOrder);

// Get orders with filters
router.get("/", extractTokenDetails, ordersService.getOrders);

// Get customer orders
router.get("/customers/:customerId", extractTokenDetails, ordersService.getCustomerOrders);

// Get order details
router.get("/:orderId", extractTokenDetails, ordersService.getOrderDetails);

// Update order
router.put("/:orderId", extractTokenDetails, ordersService.updateOrderData);

// Delete order
router.delete("/:orderId", extractTokenDetails, ordersService.deleteOrder);

// Process payment
router.post("/payment", extractTokenDetails, ordersService.orderPayment);

// Get aggregate orders (admin only)
router.post("/aggregate", extractTokenDetails, ordersService.getAggregateOrders);

module.exports = router;
