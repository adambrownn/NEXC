const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const faqsService = require("./faqs.service");
const reservedOrdersService = require("./reservedOrders.service");

router
  .route("/faqs")
  // get faqss
  .get(faqsService.getFaqs)
  .post(extractTokenDetails, faqsService.createFaq);

router
  .route("/faqs/:faqId")
  .put(extractTokenDetails, faqsService.updateFaq)
  .delete(extractTokenDetails, faqsService.deleteFaq);

router
  .route("/reserved-orders")
  // get ReservedOrderss
  .get(reservedOrdersService.getReservedOrders)
  .post(extractTokenDetails, reservedOrdersService.createReservedOrder);

router
  .route("/reserved-orders/:reservedOrderId")
  .put(extractTokenDetails, reservedOrdersService.updateReservedOrder)
  .delete(extractTokenDetails, reservedOrdersService.deleteReservedOrder);

module.exports = router;
