const Application = require("../schemas/Applications.schema");

const createApplication = async (applicationObj) => {
  const newApplication = new Application(applicationObj);
  return await newApplication.save();
};

const updateApplication = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Application.findOneAndUpdate(criteria, dataToUpdate, options);
};

const deleteApplicationById = async (applicationId) => {
  return Application.deleteOne({ _id: applicationId });
};

const getApplicationsPopulateData = async (searchObj, populateObj) => {
  return Application.find(searchObj)
    .populate(populateObj)
    .sort({ createdAt: -1 })
    .collation({
      locale: "en",
      strength: 2,
    });
};

const getAggregateApplications = async (pipeline) => {
  return Application.aggregate(pipeline);
};

const getApplicationsCount = async (pipeline) => {
  // return Application.aggregate(pipeline);
  return Application.find(pipeline).countDocuments();
};

module.exports = {
  createApplication,
  updateApplication,
  deleteApplicationById,
  getApplicationsPopulateData,
  getAggregateApplications,
  getApplicationsCount,
};
