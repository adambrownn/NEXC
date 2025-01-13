const Test = require("../schemas/Tests.schema");

const createTest = async (testObj) => {
  const newTest = new Test(testObj);
  return await newTest.save();
};

const updateTest = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Test.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkTests = async (criteria, dataToUpdate) => {
  return Test.updateMany(criteria, dataToUpdate);
};

const deleteTestByTestId = async (testId) => {
  return Test.deleteOne({ _id: testId });
};

const getTests = async (searchObj) => {
  return Test.find(searchObj).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

const getTestsPopulateData = async (searchObj, populateObj, sort, limit) => {
  return Test.find(searchObj)
    .populate(populateObj)
    .sort(sort)
    .limit(limit)
    .collation({
      locale: "en",
      strength: 2,
    });
};

const getTestsAggregateData = (criteria) => {
  return Test.aggregate(criteria);
};

module.exports = {
  createTest,
  updateTest,
  updateBulkTests,
  deleteTestByTestId,
  getTests,
  getTestsPopulateData,
  getTestsAggregateData,
};
