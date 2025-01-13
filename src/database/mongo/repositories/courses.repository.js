const Course = require("../schemas/Courses.schema");

const createCourse = async (courseObj) => {
  const newCourse = new Course(courseObj);
  return await newCourse.save();
};

const updateCourse = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return Course.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkCourses = async (criteria, dataToUpdate) => {
  return Course.updateMany(criteria, dataToUpdate);
};

const deleteCourseByCourseId = async (courseId) => {
  return Course.deleteOne({ _id: courseId });
};

const getCourses = async (searchObj) => {
  return Course.find(searchObj).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

const getCoursesPopulateData = async (searchObj, populateObj, sort, limit) => {
  return Course.find(searchObj)
    .populate(populateObj)
    .sort(sort)
    .limit(limit)
    .collation({
      locale: "en",
      strength: 2,
    });
};

const getCoursesAggregateData = (criteria) => {
  return Course.aggregate(criteria);
};

module.exports = {
  createCourse,
  updateCourse,
  updateBulkCourses,
  deleteCourseByCourseId,
  getCourses,
  getCoursesPopulateData,
  getCoursesAggregateData,
};
