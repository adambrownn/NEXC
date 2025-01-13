const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const OrdersService = require("./orders.service");

const router = express();

router
  .route("/")
  /**
   *
   * @param {searchId} req
   * @returns populated Order details
   */
  .get(extractTokenDetails, OrdersService.getOrders)
  /**
   *
   * @param {} req
   * @returns populated Order details
   */
  .post(extractTokenDetails, OrdersService.getAggregateOrders);

router
  .route("/create")
  /**
   *
   * @param  req
   * @returns created order
   */
  .post(OrdersService.createOrder);

router
  .route("/search")
  /**
   *
   * @param {searchId} req
   * @returns populated Order details
   */
  .get(extractTokenDetails, OrdersService.getOrdersCount);

router
  .route("/:orderId")
  /**
   *
   * @param {orderId} req
   * @returns populated Order details
   */
  .get(OrdersService.getOrderDetails)
  /**
   *
   * @param  {orderId} req
   * @returns updated order
   */
  .put(OrdersService.updateOrderData)
  /**
   *
   * @param  {orderId} req
   * @returns
   */
  .delete(extractTokenDetails, OrdersService.deleteOrder);

router
  .route("/payment/:orderId")
  /**
   *
   * @param  {orderId} req
   * @returns updated order for payment
   */
  .put(OrdersService.orderPayment);
module.exports = router;
