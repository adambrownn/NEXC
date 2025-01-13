const Faq = require("../schemas/Faqs.schema");

const createFaq = async (faqObj) => {
  const newFaq = new Faq(faqObj);
  return await newFaq.save();
};

const updateFaq = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Faq.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkFaqs = async (criteria, dataToUpdate) => {
  return Faq.updateMany(criteria, dataToUpdate);
};

const deleteFaqByFaqId = async (faqId) => {
  return Faq.deleteOne({ _id: faqId });
};

const getFaqs = async (searchObj) => {
  return Faq.find(searchObj);
};

module.exports = {
  createFaq,
  updateFaq,
  updateBulkFaqs,
  deleteFaqByFaqId,
  getFaqs,
};
