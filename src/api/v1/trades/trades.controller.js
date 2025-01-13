const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const tradesService = require("./trades.service");

router
  .route("/")
  // get all trades
  .get(tradesService.getTrades)
  // create Trade
  .post(extractTokenDetails, tradesService.createTrade);

router.route("/services/:tradeId").get(tradesService.getServicesByTradeId);

router
  .route("/:tradeId")
  // get Trade by Id
  .get(tradesService.getTradeById)
  // update Trade
  .put(extractTokenDetails, tradesService.updateTrade)
  // get filter trades
  .post(extractTokenDetails, tradesService.getTrades)
  // delete Trade by id
  .delete(extractTokenDetails, tradesService.deleteTrade);

module.exports = router;
