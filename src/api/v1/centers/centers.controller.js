const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const centersService = require("./centers.service");

router
  .route("/")
  .get(centersService.getCenters)
  .post(extractTokenDetails, centersService.createCenter);

router
  .route("/:centerId")
  .get(centersService.getCenterById)
  .put(extractTokenDetails, centersService.updateCenter)
  .delete(extractTokenDetails, centersService.deleteCenter);

module.exports = router;
