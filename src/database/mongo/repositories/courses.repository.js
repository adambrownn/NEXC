const modelRegistry = require("../modelRegistry");

const getCourseModel = () => {
  return modelRegistry.getModel("courses");
};

const createCourse = async (courseObj) => {
  const Course = getCourseModel();
  const newCourse = new Course(courseObj);
  return await newCourse.save();
};

const updateCourse = async (criteria, dataToUpdate, options = {}) => {
  const Course = getCourseModel();
  options["new"] = true;
  options["lean"] = true;
  return Course.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkCourses = async (criteria, dataToUpdate) => {
  const Course = getCourseModel();
  return Course.updateMany(criteria, dataToUpdate);
};

const deleteCourseByCourseId = async (courseId) => {
  const Course = getCourseModel();
  return Course.deleteOne({ _id: courseId });
};

const getCourses = async (searchObj) => {
  const Course = getCourseModel();
  return Course.find(searchObj).populate([
    {
      path: "tradeId",
      select: "title isAvailable",
    },
  ]);
};

const getCoursesPopulateData = async (searchObj, populateObj, sort, limit) => {
  const Course = getCourseModel();
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
  const Course = getCourseModel();
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
