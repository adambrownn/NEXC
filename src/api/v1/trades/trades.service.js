const tradeRepo = require("../../../database/mongo/repositories/trades.repository");

// CREATE
module.exports.createTrade = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newTradeResp = await tradeRepo.createTrade(req.body);
    res.json(newTradeResp);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ
module.exports.getTrades = async (req, res) => {
  const TradesList = await tradeRepo.getTrades({});
  res.json(TradesList);
};

//
module.exports.getTradeById = async (req, res) => {
  const TradesList = await tradeRepo.getTrades({
    _id: req.params.tradeId,
  });
  res.json(TradesList);
};

module.exports.getServicesByTradeId = async (req, res) => {
  const allServices = await tradeRepo.getAllServices({
    tradeId: req.params.tradeId,
  });
  res.json(allServices);
};

// UPDATE
module.exports.updateTrade = async (req, res) => {
  try {
    const updateResp = await tradeRepo.updateTrade(
      { _id: req.params.tradeId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteTrade = async (req, res) => {
  try {
    const deleteResp = await tradeRepo.deleteTradeByTradeId({
      _id: req.params.tradeId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
