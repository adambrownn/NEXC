const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express.Router();

const tradesService = require("./trades.service");
const customersService = require("../customers/customers.service");
const modelRegistry = require("../../../database/mongo/modelRegistry");

// Debug route - remove in production
router.get("/debug/associations/:tradeId", async (req, res) => {
  try {
    const TradeServiceAssociationModel = modelRegistry.getModel("trade-service-associations");
    const mongoose = require('mongoose');
    
    // Convert tradeId to ObjectId
    const tradeId = mongoose.Types.ObjectId.isValid(req.params.tradeId) 
      ? new mongoose.Types.ObjectId(req.params.tradeId)
      : null;
    
    if (!tradeId) {
      return res.status(400).json({ error: 'Invalid trade ID format' });
    }

    // Find associations
    const associations = await TradeServiceAssociationModel.find({ trade: tradeId });
    
    // Get model info
    const modelInfo = {
      modelName: TradeServiceAssociationModel.modelName,
      collectionName: TradeServiceAssociationModel.collection.name,
      schema: TradeServiceAssociationModel.schema.paths
    };

    res.json({
      tradeId: req.params.tradeId,
      associations,
      modelInfo,
      mongooseConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Trade routes
router
  .route("/")
  // get all trades
  .get(tradesService.getTrades)
  // create Trade
  .post(extractTokenDetails, tradesService.createTrade);

// Move this route before the /:tradeId routes to prevent "services" being treated as an ID
router.route("/services/:tradeId?").get(tradesService.getServicesByTradeId);

// Add qualifications route
router.route("/qualifications").get(tradesService.getQualifications);

// Customer routes
router
  .route("/customers")
  .post(extractTokenDetails, customersService.createCustomer)
  .get(customersService.searchCustomers);

router
  .route("/customers/:customerId")
  .get(customersService.getCustomerById)
  .put(extractTokenDetails, customersService.updateCustomer);

router
  .route("/customers/:customerId/status")
  .patch(extractTokenDetails, customersService.updateCustomerStatus);

router
  .route("/customers/:customerId/bookings")
  .get(customersService.getCustomerBookings);

// Trade routes with ID
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
