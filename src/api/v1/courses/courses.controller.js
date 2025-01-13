const express = require("express");
const {
  extractTokenDetails,
} = require("../../../common/services/auth.service");
const router = express();

const coursesService = require("./courses.service");

router
  .route("/")
  // get all courses
  .get(coursesService.getCourses)
  // create course
  .post(extractTokenDetails, coursesService.createCourse);

router
  .route("/:courseId")
  // get course by Id
  .get(coursesService.getCourseById)
  // update course
  .put(extractTokenDetails, coursesService.updateCourse)
  // get filter courses
  .post(extractTokenDetails, coursesService.getCourses)
  // delete course by id
  .delete(extractTokenDetails, coursesService.deleteCourse);

module.exports = router;
