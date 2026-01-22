const express = require("express");
const router = express();

const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const qualificationsService = require("./qualifications.service");

router
  .route("/")
  // get all Qualifications with pagination
  .get(qualificationsService.getQualifications)
  // create Qualification
  .post(extractTokenDetails, qualificationsService.createQualification);

router
  .route("/stats")
  // get qualification statistics
  .get(qualificationsService.getQualificationsStats);

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
