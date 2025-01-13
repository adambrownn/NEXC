const Orders = require("../schemas/Orders.schema");

const createOrder = async (orderObj) => {
  const newOrder = new Orders(orderObj);
  return await newOrder.save();
};

const updateOrder = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Orders.findOneAndUpdate(criteria, dataToUpdate, options);
};

const deleteOrderById = async (orderId) => {
  return Orders.deleteOne({ _id: orderId });
};

const getOrdersPopulateData = async (searchObj, populateObj) => {
  return Orders.find(searchObj)
    .populate(populateObj)
    .sort({ createdAt: -1 })
    .collation({
      locale: "en",
      strength: 2,
    });
};

const getAggregateOrders = async (pipeline) => {
  return Orders.aggregate(pipeline);
};

const getOrdersCount = async (pipeline) => {
  // return Orders.aggregate(pipeline);
  return Orders.find(pipeline).countDocuments();
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrderById,
  getOrdersPopulateData,
  getAggregateOrders,
  getOrdersCount,
};
