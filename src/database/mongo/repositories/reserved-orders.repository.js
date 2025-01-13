const ReservedOrder = require("../schemas/ReservedOrders.schema");

const createReservedOrder = async (reservedOrderObj) => {
  const newReservedOrder = new ReservedOrder(reservedOrderObj);
  return await newReservedOrder.save();
};

const updateReservedOrder = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return ReservedOrder.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkReservedOrders = async (criteria, dataToUpdate) => {
  return ReservedOrder.updateMany(criteria, dataToUpdate);
};

const deleteReservedOrderByReservedOrderId = async (reservedOrderId) => {
  return ReservedOrder.deleteOne({ _id: reservedOrderId });
};

const getReservedOrders = async (searchObj) => {
  return ReservedOrder.find(searchObj);
};

module.exports = {
  createReservedOrder,
  updateReservedOrder,
  updateBulkReservedOrders,
  deleteReservedOrderByReservedOrderId,
  getReservedOrders,
};
