const faqsRepository = require("../../../database/mongo/repositories/faqs.repository");

// CREATE
module.exports.createFaq = async (req, res) => {
  try {
    // Check if user exists and has authentication
    if (!req.user) {
      return res.status(401).json({ err: "Authentication required" });
    }

    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      return res.status(403).json({ err: "You do not have Access" });
    }

    const newFaqResponse = await faqsRepository.createFaq(req.body);
    res.json(newFaqResponse);
  } catch (e) {
    console.error('Error creating FAQ:', e);
    res.status(500).json({ err: e.message });
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
    // Check if user exists and has authentication
    if (!req.user) {
      return res.status(401).json({ err: "Authentication required" });
    }

    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      return res.status(403).json({ err: "You do not have Access" });
    }

    const updateResp = await faqsRepository.updateFaq(
      { _id: req.params.faqId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.error('Error updating FAQ:', e);
    res.status(500).json({ err: e.message });
  }
};

// DELETE
module.exports.deleteFaq = async (req, res) => {
  try {
    // Check if user exists and has authentication
    if (!req.user) {
      return res.status(401).json({ err: "Authentication required" });
    }

    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      return res.status(403).json({ err: "You do not have Access" });
    }

    const deleteResp = await faqsRepository.deleteFaqByFaqId({
      _id: req.params.faqId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.error('Error deleting FAQ:', e);
    res.status(500).json({ err: e.message });
  }
};
