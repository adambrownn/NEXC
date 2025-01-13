const qualificationRepo = require("../../../database/mongo/repositories/qualifications.repository");

// CREATE
module.exports.createQualification = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newQualificationResp = await qualificationRepo.createQualification(
      req.body
    );
    res.json(newQualificationResp);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ
module.exports.getQualifications = async (req, res) => {
  const filterCriteria = {};
  if (req.query.tradeId) {
    filterCriteria.tradeId = req.query.tradeId;
  }
  const qualificationsList = await qualificationRepo.getQualifications(
    filterCriteria
  );
  res.json(qualificationsList);
};

module.exports.getQualificationById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

    const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.qualificationId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const qualification = await qualificationRepo.getQualificationsPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(qualification);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateQualification = async (req, res) => {
  try {
    const updateResp = await qualificationRepo.updateQualification(
      { _id: req.params.qualificationId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteQualification = async (req, res) => {
  try {
    const deleteResp =
      await qualificationRepo.deleteQualificationByQualificationId({
        _id: req.params.qualificationId,
      });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
