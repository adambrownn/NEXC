const Trade = require("../schemas/Trades.schema");
const Card = require("../schemas/Cards.schema");
const Course = require("../schemas/Courses.schema");
const Qualification = require("../schemas/Qualifications.schema");
const Test = require("../schemas/Tests.schema");

const createTrade = async (tradeObj) => {
  const newTrade = new Trade(tradeObj);
  return await newTrade.save();
};

const updateTrade = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Trade.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkTrades = async (criteria, dataToUpdate) => {
  return Trade.updateMany(criteria, dataToUpdate);
};

const deleteTradeByTradeId = async (tradeId) => {
  return Trade.deleteOne({ _id: tradeId });
};

const getTrades = async (searchObj) => {
  return Trade.find(searchObj);
};

const getAllServices = async (searchObj) => {
  const services = Promise.all([
    await Card.find(searchObj),
    await Course.find(searchObj),
    await Test.find(searchObj),
    await Qualification.find(searchObj),
  ]);
  return services;
};

module.exports = {
  createTrade,
  updateTrade,
  updateBulkTrades,
  deleteTradeByTradeId,
  getTrades,
  getAllServices,
};
