const Center = require("../schemas/Centers.schema");

const createCenter = async (centerObj) => {
  const newCenter = new Center(centerObj);
  return await newCenter.save();
};

const updateCenter = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Center.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkCenters = async (criteria, dataToUpdate) => {
  return Center.updateMany(criteria, dataToUpdate);
};

const deleteCenterByCenterId = async (centerId) => {
  return Center.deleteOne({ _id: centerId });
};

const getCenters = async (searchObj) => {
  return Center.find(searchObj);
};

module.exports = {
  createCenter,
  updateCenter,
  updateBulkCenters,
  deleteCenterByCenterId,
  getCenters,
};
