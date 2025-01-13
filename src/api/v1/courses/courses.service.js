const courseRepository = require("../../../database/mongo/repositories/courses.repository");

// CREATE
module.exports.createCourse = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newCourseResponse = await courseRepository.createCourse(req.body);
    res.json(newCourseResponse);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ
module.exports.getCourses = async (req, res) => {
  const filterCriteria = {};
  if (req.query.tradeId) {
    filterCriteria.tradeId = req.query.tradeId;
  }

  const coursesList = await courseRepository.getCourses(filterCriteria);
  res.json(coursesList);
};

module.exports.getCourseById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

    const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.courseId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const course = await courseRepository.getCoursesPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(course);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateCourse = async (req, res) => {
  try {
    const updateResp = await courseRepository.updateCourse(
      { _id: req.params.courseId },
      req.body
    );
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteCourse = async (req, res) => {
  try {
    const deleteResp = await courseRepository.deleteCourseByCourseId({
      _id: req.params.courseId,
    });
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
