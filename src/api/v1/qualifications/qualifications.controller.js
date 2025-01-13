const express = require("express");
const router = express();

const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const qualificationsService = require("./qualifications.service");

router
  .route("/")
  // get all Qualifications
  .get(qualificationsService.getQualifications)
  // create Qualification
  .post(extractTokenDetails, qualificationsService.createQualification);

router
  .route("/:qualificationId")
  // get Qualification by Id
  .get(qualificationsService.getQualificationById)
  // update Qualification
  .put(extractTokenDetails, qualificationsService.updateQualification)
  // get filter Qualifications
  .post(extractTokenDetails, qualificationsService.getQualifications)
  // delete Qualification by id
  .delete(extractTokenDetails, qualificationsService.deleteQualification);

module.exports = router;
