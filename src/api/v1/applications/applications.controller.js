const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const ApplicationsService = require("./applications.service");

const router = express();

router
  .route("/")
  /**
   *
   * @param {} req
   * @returns populated Application details
   */
  .post(extractTokenDetails, ApplicationsService.getAggregateApplications);

router
  .route("/create")
  /**
   *
   * @param  req
   * @returns created Application
   */
  .post(ApplicationsService.createApplication);

router
  .route("/:applicationId")
  /**
   *
   * @param {applicationId} req
   * @returns populated Application details
   */
  .get(ApplicationsService.getApplicationDetails)
  /**
   *
   * @param  {ApplicationId} req
   * @returns updated Application
   */
  .put(ApplicationsService.updateApplicationData)
  /**
   *
   * @param  {ApplicationId} req
   * @returns
   */
  .delete(extractTokenDetails, ApplicationsService.deleteApplication);

module.exports = router;
