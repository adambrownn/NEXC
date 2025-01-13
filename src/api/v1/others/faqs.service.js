const faqsRepository = require("../../../database/mongo/repositories/faqs.repository");

// CREATE
module.exports.createFaq = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newFaqResponse = await faqsRepository.createFaq(req.body);
    res.json(newFaqResponse);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// READ
module.exports.getFaqs = async (req, res) => {
  const filterCriteria = {};
  if (req.query.category) {
    filterCriteria.category = req.query.category;
  }
  const faqsList = await faqsRepository.getFaqs(filterCriteria);
  res.json(faqsList);
};

// UPDATE
module.exports.updateFaq = async (req, res) => {
  try {
    const updateResp = await faqsRepository.updateFaq(
      { _id: req.params.faqId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteFaq = async (req, res) => {
  try {
    const deleteResp = await faqsRepository.deleteFaqByFaqId({
      _id: req.params.faqId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
