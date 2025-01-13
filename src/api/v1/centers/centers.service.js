const centerRepository = require("../../../database/mongo/repositories/centers.repository");

// CREATE
module.exports.createCenter = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newCenterResponse = await centerRepository.createCenter(req.body);
    res.json(newCenterResponse);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// READ
module.exports.getCenters = async (req, res) => {
  const centersList = await centerRepository.getCenters({});
  res.json(centersList);
};

// READ
module.exports.getCenterById = async (req, res) => {
  const centersList = await centerRepository.getCenters({
    _id: req.params.centerId,
  });
  res.json(centersList);
};

// UPDATE
module.exports.updateCenter = async (req, res) => {
  try {
    const updateResp = await centerRepository.updateCenter(
      { _id: req.params.centerId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteCenter = async (req, res) => {
  try {
    const deleteResp = await centerRepository.deleteCenterByCenterId({
      _id: req.params.centerId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
