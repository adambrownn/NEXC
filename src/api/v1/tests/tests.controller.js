const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const testsService = require("./tests.service");

router
  .route("/")
  // get all tests
  .get(testsService.getTests)
  // create Test
  .post(extractTokenDetails, testsService.createTest);

router
  .route("/:testId")
  // get Test by Id
  .get(testsService.getTestById)
  // update Test
  .put(extractTokenDetails, testsService.updateTest)
  // get filter tests
  .post(extractTokenDetails, testsService.getTests)
  // delete Test by id
  .delete(extractTokenDetails, testsService.deleteTest);

module.exports = router;
