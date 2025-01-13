const Qualification = require("../schemas/Qualifications.schema");

const createQualification = async (qualificationObj) => {
  const newQualification = new Qualification(qualificationObj);
  return await newQualification.save();
};

const updateQualification = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Qualification.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkQualifications = async (criteria, dataToUpdate) => {
  return Qualification.updateMany(criteria, dataToUpdate);
};

const deleteQualificationByQualificationId = async (qualificationId) => {
  return Qualification.deleteOne({ _id: qualificationId });
};

const getQualifications = async (searchObj) => {
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
