const modelRegistry = require("../modelRegistry");

const getQualificationModel = () => {
  return modelRegistry.getModel("qualifications");
};

const createQualification = async (qualificationObj) => {
  const Qualification = getQualificationModel();
  const newQualification = new Qualification(qualificationObj);
  return await newQualification.save();
};

const updateQualification = async (criteria, dataToUpdate, options = {}) => {
  const Qualification = getQualificationModel();
  options["new"] = true;
  options["lean"] = true;
  return Qualification.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkQualifications = async (criteria, dataToUpdate) => {
  const Qualification = getQualificationModel();
  return Qualification.updateMany(criteria, dataToUpdate);
};

const deleteQualificationByQualificationId = async (qualificationId) => {
  const Qualification = getQualificationModel();
  return Qualification.deleteOne({ _id: qualificationId });
};

const getQualifications = async (searchObj) => {
  const Qualification = getQualificationModel();
  return Qualification.find(searchObj).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

const getQualificationsPopulateData = async (
  searchObj,
  populateObj,
  sort,
  limit
) => {
  const Qualification = getQualificationModel();
  return Qualification.find(searchObj)
    .populate(populateObj)
    .sort(sort)
    .limit(limit)
    .collation({
      locale: "en",
      strength: 2,
    });
};

const getQualificationsAggregateData = (criteria) => {
  const Qualification = getQualificationModel();
  return Qualification.aggregate(criteria);
};

module.exports = {
  createQualification,
  updateQualification,
  updateBulkQualifications,
  deleteQualificationByQualificationId,
  getQualifications,
  getQualificationsPopulateData,
  getQualificationsAggregateData,
};
