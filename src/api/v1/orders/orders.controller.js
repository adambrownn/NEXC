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

// Create payment intent for order (returns clientSecret for Stripe Elements)
router.post("/:orderId/payment-intent", extractTokenDetails, ordersService.createOrderPaymentIntent);

// Process/confirm payment (legacy endpoint - processes payment with card info)
router.post("/:orderId/payment", extractTokenDetails, ordersService.orderPayment);

// Confirm payment intent (called after Stripe Elements confirmation)
router.post("/:orderId/confirm-payment", extractTokenDetails, ordersService.confirmOrderPayment);

// Get aggregate orders (admin only)
router.post("/aggregate", extractTokenDetails, ordersService.getAggregateOrders);

// Assign technician to order (all items)
router.patch("/:orderId/assign", extractTokenDetails, ordersService.assignTechnician);

// Assign technician to specific item
router.patch("/:orderId/items/:itemId/assign", extractTokenDetails, ordersService.assignTechnicianToItem);

// Update order status
router.patch("/:orderId/status", extractTokenDetails, ordersService.updateOrderStatus);

// Update item status
router.patch("/:orderId/items/:itemId/status", extractTokenDetails, ordersService.updateItemStatus);

module.exports = router;
