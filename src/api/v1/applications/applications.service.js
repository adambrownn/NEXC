const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

const ApplicationsRepository = require("../../../database/mongo/repositories/applications.repository");

module.exports.getAggregateApplications = async (req, res) => {
  var startDate = req.body.startDate
    ? new Date(req.body.startDate)
    : new Date("2021-01-01");
  var endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(); // TODO

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const match = {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate },
    },
  };

  if (req.body.sortByStatus) {
    match["$match"]["$or"] = [
      { paymentStatus: req.body.paymentStatus },
      { applicationCheckPoint: req.body.applicationCheckPoint },
    ];
  }

  const sort = {
    $sort: {
      createdAt: -1,
    },
  };

  const limit = {
    $limit: 25,
  };

  const applications = await ApplicationsRepository.getAggregateApplications([
    match,
    sort,
    limit,
  ]);
  res.json(applications);
};

module.exports.getApplicationDetails = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params?.applicationId)) {
      throw new Error("Invalid Application id");
    }

    const applicationData =
      await ApplicationsRepository.getApplicationsPopulateData(
        {
          _id: req.params.ApplicationId,
        },
        []
      );
    res.json(applicationData[0]);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

module.exports.createApplication = async (req, res) => {
  try {
    const createApplicationResp =
      await ApplicationsRepository.createApplication(req.body);

    res.json(createApplicationResp);
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

module.exports.updateApplicationData = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.applicationId)) {
      throw new Error("Invalid Application");
    }

    const updateReqObj = req.body;
    updateReqObj.updatedAt = Date.now();

    const updatedApplicationResp =
      await ApplicationsRepository.updateApplication(
        {
          _id: req.params.applicationId,
        },
        updateReqObj,
        {}
      );

    if (updatedApplicationResp) {
      res.json(updatedApplicationResp);
    } else {
      throw new Error("Application not updated or Application not Exists");
    }
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
  }
};

module.exports.deleteApplication = async (req, res) => {
  // only admin can delete
  if (!["superadmin", "admin"].includes(req.user.accountType)) {
    throw new Error("You do not have access");
  }

  const deleteResp = await ApplicationsRepository.deleteApplicationById({
    _id: req.params.applicationId,
  });
  res.json(deleteResp);
};
