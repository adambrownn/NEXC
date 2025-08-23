const modelRegistry = require("../modelRegistry");

const getTestModel = () => {
  return modelRegistry.getModel("tests");
};

const createTest = async (testObj) => {
  const Test = getTestModel();
  const newTest = new Test(testObj);
  return await newTest.save();
};

const updateTest = async (criteria, dataToUpdate, options = {}) => {
  const Test = getTestModel();
  options["new"] = true;
  options["lean"] = true;
  return Test.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkTests = async (criteria, dataToUpdate) => {
  const Test = getTestModel();
  return Test.updateMany(criteria, dataToUpdate);
};

const deleteTestByTestId = async (testId) => {
  const Test = getTestModel();
  return Test.deleteOne({ _id: testId });
};

const getTests = async (searchObj) => {
  const Test = getTestModel();
  return Test.find(searchObj).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

const getTestsPopulateData = async (searchObj, populateObj, sort, limit) => {
  const Test = getTestModel();
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
  const Test = getTestModel();
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
