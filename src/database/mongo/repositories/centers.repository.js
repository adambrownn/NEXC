const modelRegistry = require("../modelRegistry");

const getCenterModel = () => {
  return modelRegistry.getModel("centers");
};

const createCenter = async (centerObj) => {
  const Center = getCenterModel();
  const newCenter = new Center(centerObj);
  return await newCenter.save();
};

const updateCenter = async (criteria, dataToUpdate, options = {}) => {
  const Center = getCenterModel();
  options["new"] = true;
  options["lean"] = true;
  return Center.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkCenters = async (criteria, dataToUpdate) => {
  const Center = getCenterModel();
  return Center.updateMany(criteria, dataToUpdate);
};

const deleteCenterByCenterId = async (centerId) => {
  const Center = getCenterModel();
  return Center.deleteOne({ _id: centerId });
};

const getCenters = async (searchObj) => {
  const Center = getCenterModel();
  console.log('Fetching centers with criteria:', searchObj);
  const centers = await Center.find(searchObj);
  console.log(`Found ${centers.length} centers`);
  return centers;
};

module.exports = {
  createCenter,
  updateCenter,
  updateBulkCenters,
  deleteCenterByCenterId,
  getCenters,
};
