const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const faqsService = require("./faqs.service");

router
  .route("/faqs")
  // get faqss
  .get(faqsService.getFaqs)
  .post(extractTokenDetails, faqsService.createFaq);

router
  .route("/faqs/:faqId")
  .put(extractTokenDetails, faqsService.updateFaq)
  .delete(extractTokenDetails, faqsService.deleteFaq);

module.exports = router;
