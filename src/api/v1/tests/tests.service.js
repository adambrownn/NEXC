const testRepository = require("../../../database/mongo/repositories/tests.repository");

// CREATE
module.exports.createTest = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newTestResponse = await testRepository.createTest(req.body);
    res.json(newTestResponse);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ
module.exports.getTests = async (req, res) => {
  const filterCriteria = {};
  if (req.query.tradeId) {
    filterCriteria.tradeId = req.query.tradeId;
  }
  const testsList = await testRepository.getTests(filterCriteria);
  res.json(testsList);
};

module.exports.getTestById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

    const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.testId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const test = await testRepository.getTestsPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(test);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateTest = async (req, res) => {
  try {
    const updateResp = await testRepository.updateTest(
      { _id: req.params.testId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteTest = async (req, res) => {
  try {
    const deleteResp = await testRepository.deleteTestByTestId({
      _id: req.params.testId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
